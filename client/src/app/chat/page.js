"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import { useIsMobile } from "@/lib/useIsMobile";

export default function ChatPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();

  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [typingFrom, setTypingFrom] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({}); // { [userId]: count }

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // NOTE: we intentionally do NOT fetch the full user list anymore.
  // The sidebar starts empty — people are found only via username search.

  // set up the socket connection once
  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    socketRef.current = socket;

    socket.emit("user_online", user._id);

    socket.on("online_users", (ids) => {
      setOnlineUserIds(ids);
    });

    socket.on("receive_message", (message) => {
      const isOpenChat = message.sender === selectedUserRef.current?._id;

      setMessages((prev) => {
        // only append if this message belongs to the open conversation
        const belongsToOpenChat =
          message.sender === selectedUserRef.current?._id ||
          message.receiver === selectedUserRef.current?._id;
        if (!belongsToOpenChat) return prev;
        return [...prev, message];
      });

      // bump the unread badge for this sender, unless their chat is the
      // one currently open (in that case there's nothing "unread" about it)
      if (!isOpenChat) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.sender]: (prev[message.sender] || 0) + 1,
        }));
      }

      // move this sender to the top of the sidebar list — newest activity
      // surfaces first, same as most chat apps
      setConversations((prev) => {
        const existing = prev.find((u) => u._id === message.sender);
        if (existing) {
          const rest = prev.filter((u) => u._id !== message.sender);
          return [existing, ...rest];
        }
        return prev;
      });

      // if this sender isn't in the sidebar yet (they messaged us first,
      // before we ever searched for them), fetch their profile and add them
      setConversations((prev) => {
        const alreadyThere = prev.some((u) => u._id === message.sender);
        if (alreadyThere) return prev;

        api
          .get(`/api/users/${message.sender}`)
          .then((res) => {
            setConversations((current) => {
              const exists = current.some((u) => u._id === res.data._id);
              if (exists) return current;
              return [res.data, ...current];
            });
          })
          .catch((err) => console.error("Failed to load sender profile", err));

        return prev;
      });
    });

    socket.on("message_sent", (message) => {
      setMessages((prev) => {
        const alreadyExists = prev.some((m) => m._id === message._id);
        if (alreadyExists) return prev;
        return [...prev, message];
      });
    });

    socket.on("typing", ({ senderId }) => {
      if (senderId === selectedUserRef.current?._id) {
        setTypingFrom(senderId);
      }
    });

    socket.on("stop_typing", ({ senderId }) => {
      if (senderId === selectedUserRef.current?._id) {
        setTypingFrom(null);
      }
    });

    return () => {
      socket.off("online_users");
      socket.off("receive_message");
      socket.off("message_sent");
      socket.off("typing");
      socket.off("stop_typing");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // keep a ref of the selected user so socket callbacks always read the latest value
  const selectedUserRef = useRef(null);
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // load conversation history whenever a different user is selected
  const handleSelectUser = useCallback(async (otherUser) => {
    setSelectedUser(otherUser);
    setTypingFrom(null);

    // opening a chat clears its unread badge
    setUnreadCounts((prev) => {
      if (!prev[otherUser._id]) return prev;
      const updated = { ...prev };
      delete updated[otherUser._id];
      return updated;
    });

    // remember this person in the sidebar (and bring them to the top)
    // so the chat doesn't disappear once the search box is cleared
    setConversations((prev) => {
      const existing = prev.find((u) => u._id === otherUser._id);
      const rest = prev.filter((u) => u._id !== otherUser._id);
      return [existing || otherUser, ...rest];
    });

    try {
      const res = await api.get(`/api/messages/${otherUser._id}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load messages", err);
      setMessages([]);
    }
  }, []);

  // called by the Sidebar search box — looks up users by username
  const handleSearch = useCallback(async (username) => {
    try {
      const res = await api.get("/api/users/search", {
        params: { username },
      });
      return { results: res.data, error: null };
    } catch (err) {
      console.error("Search failed", err);
      // surface what actually went wrong instead of pretending it was
      // just an empty result — a 401, CORS failure, or network error
      // looks identical to "no matches" unless we report it
      const message =
        err.response?.status === 401
          ? "Your session expired — please log in again."
          : err.message === "Network Error"
          ? "Network error — check your connection and try again."
          : err.response?.data?.message || "Search failed. Try again.";
      return { results: [], error: message };
    }
  }, []);

  const handleSendMessage = useCallback(
    async (text) => {
      if (!selectedUser) return;

      try {
        const res = await api.post(`/api/messages/${selectedUser._id}`, {
          text,
        });

        const savedMessage = res.data;

        socketRef.current?.emit("send_message", {
          ...savedMessage,
          sender: user._id,
          receiver: selectedUser._id,
        });
      } catch (err) {
        console.error("Failed to send message", err);
      }
    },
    [selectedUser, user]
  );

  const handleTyping = useCallback(() => {
    if (!selectedUser) return;
    socketRef.current?.emit("typing", {
      senderId: user._id,
      receiverId: selectedUser._id,
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  }, [selectedUser, user]);

  const handleStopTyping = useCallback(() => {
    if (!selectedUser) return;
    socketRef.current?.emit("stop_typing", {
      senderId: user._id,
      receiverId: selectedUser._id,
    });
  }, [selectedUser, user]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // on mobile, the back button just clears the open chat so the
  // sidebar (conversation list) shows again
  const handleBackToList = () => {
    setSelectedUser(null);
  };

  if (loading || !user) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  // on mobile: show ONLY the sidebar (no chat open) OR ONLY the chat
  // window (a chat is open) — never both at once, like WhatsApp Web.
  // on desktop: show both side by side, like before.
  const showSidebar = !isMobile || !selectedUser;
  const showChatWindow = !isMobile || !!selectedUser;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {showSidebar && (
        <Sidebar
          conversations={conversations}
          selectedUser={selectedUser}
          onSelectUser={handleSelectUser}
          onlineUserIds={onlineUserIds}
          currentUser={user}
          onLogout={handleLogout}
          onSearch={handleSearch}
          unreadCounts={unreadCounts}
        />
      )}
      {showChatWindow && (
        <ChatWindow
          selectedUser={selectedUser}
          messages={messages}
          currentUserId={user._id}
          onSendMessage={handleSendMessage}
          isTyping={typingFrom === selectedUser?._id}
          onTyping={handleTyping}
          onStopTyping={handleStopTyping}
          onBack={isMobile ? handleBackToList : null}
        />
      )}
    </div>
  );
}
