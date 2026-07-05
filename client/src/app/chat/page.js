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
  const [unreadCounts, setUnreadCounts] = useState({});

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const selectedUserRef = useRef(null);

  // redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // load every conversation this user has ever had on mount —
  // this makes the sidebar list survive refreshes, logouts, and new devices
  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      try {
        const res = await api.get("/api/messages/conversations");

        setConversations(
          res.data.map((c) => ({
            _id: c._id,
            username: c.username,
            email: c.email,
            avatar: c.avatar,
          }))
        );

        const counts = {};
        res.data.forEach((c) => {
          if (c.unreadCount > 0) counts[c._id] = c.unreadCount;
        });
        setUnreadCounts(counts);
      } catch (err) {
        console.error("Failed to load conversations", err);
      }
    };

    loadConversations();
  }, [user]);

  // set up the socket connection once per login session
  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    socketRef.current = socket;

    socket.emit("user_online", user._id);

    // re-announce presence after every reconnect so the server always
    // knows which socket belongs to this user
    socket.on("connect", () => {
      socket.emit("user_online", user._id);
    });

    socket.on("online_users", (ids) => {
      setOnlineUserIds(ids);
    });

    socket.on("receive_message", (message) => {
      const isOpenChat = message.sender === selectedUserRef.current?._id;

      setMessages((prev) => {
        const belongsToOpenChat =
          message.sender === selectedUserRef.current?._id ||
          message.receiver === selectedUserRef.current?._id;
        if (!belongsToOpenChat) return prev;
        return [...prev, message];
      });

      // if the chat is open right now, tell the sender it was read immediately
      if (isOpenChat) {
        const now = new Date().toISOString();
        socket.emit("mark_read", {
          senderId: message.sender,
          readAt: now,
        });
      }

      if (!isOpenChat) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.sender]: (prev[message.sender] || 0) + 1,
        }));
      }

      // move sender to top of sidebar
      setConversations((prev) => {
        const existing = prev.find((u) => u._id === message.sender);
        if (existing) {
          return [existing, ...prev.filter((u) => u._id !== message.sender)];
        }
        return prev;
      });

      // if sender not in sidebar yet, fetch their profile
      setConversations((prev) => {
        const alreadyThere = prev.some((u) => u._id === message.sender);
        if (alreadyThere) return prev;
        api
          .get(`/api/users/${message.sender}`)
          .then((res) => {
            setConversations((cur) => {
              if (cur.some((u) => u._id === res.data._id)) return cur;
              return [res.data, ...cur];
            });
          })
          .catch(console.error);
        return prev;
      });
    });

    socket.on("message_sent", (message) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    });

    // the other person just opened our conversation — update the seen
    // status on our messages in real time without them needing to reload
    socket.on("messages_read", ({ readBy, readAt }) => {
      setMessages((prev) =>
        prev.map((m) => {
          // only update messages we sent to this person that weren't read yet
          if (
            m.sender === user._id &&
            m.receiver === readBy &&
            !m.isRead
          ) {
            return { ...m, isRead: true, readAt };
          }
          return m;
        })
      );
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
      socket.off("connect");
      socket.off("online_users");
      socket.off("receive_message");
      socket.off("message_sent");
      socket.off("messages_read");
      socket.off("typing");
      socket.off("stop_typing");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // keep a ref to selectedUser so socket callbacks always have the latest value
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  const handleSelectUser = useCallback(async (otherUser) => {
    setSelectedUser(otherUser);
    setTypingFrom(null);

    // clear unread badge for this person
    setUnreadCounts((prev) => {
      if (!prev[otherUser._id]) return prev;
      const updated = { ...prev };
      delete updated[otherUser._id];
      return updated;
    });

    // bring them to the top of the sidebar
    setConversations((prev) => {
      const existing = prev.find((u) => u._id === otherUser._id);
      const rest = prev.filter((u) => u._id !== otherUser._id);
      return [existing || otherUser, ...rest];
    });

    try {
      const res = await api.get(`/api/messages/${otherUser._id}`);
      setMessages(res.data);

      // tell their socket that we just read all their messages
      const now = new Date().toISOString();
      socketRef.current?.emit("mark_read", {
        senderId: otherUser._id,
        readAt: now,
      });
    } catch (err) {
      console.error("Failed to load messages", err);
      setMessages([]);
    }
  }, []);

  const handleSearch = useCallback(async (username) => {
    try {
      const res = await api.get("/api/users/search", { params: { username } });
      return { results: res.data, error: null };
    } catch (err) {
      console.error("Search failed", err);
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
    async (text, replyingTo = null) => {
      if (!selectedUser) return;

      try {
        const body = { text };

        if (replyingTo) {
          body.replyTo = {
            messageId: replyingTo._id,
            text: replyingTo.text,
            senderUsername:
              replyingTo.sender === user._id
                ? user.username
                : selectedUser.username,
          };
        }

        const res = await api.post(`/api/messages/${selectedUser._id}`, body);
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
    typingTimeoutRef.current = setTimeout(() => handleStopTyping(), 2000);
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
          currentUsername={user.username}
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
