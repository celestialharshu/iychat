"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import ProfileCard from "@/components/ProfileCard";
import NotificationPanel from "@/components/NotificationPanel";
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

  // follow / notification state
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileCardUser, setProfileCardUser] = useState(null);

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const selectedUserRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // load conversation history on mount
  useEffect(() => {
    if (!user) return;
    const load = async () => {
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
    load();
  }, [user]);

  // load initial notification count on mount
  useEffect(() => {
    if (!user) return;
    const loadCount = async () => {
      try {
        const res = await api.get("/api/follow/pending");
        setNotificationCount(res.data.length);
      } catch (err) {
        console.error("Failed to load notification count", err);
      }
    };
    loadCount();
  }, [user]);

  // socket setup
  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    socketRef.current = socket;

    socket.emit("user_online", user._id);

    socket.on("connect", () => {
      socket.emit("user_online", user._id);
    });

    socket.on("online_users", (ids) => {
      setOnlineUserIds(ids);
    });

    socket.on("receive_message", (message) => {
      const isOpenChat = message.sender === selectedUserRef.current?._id;

      setMessages((prev) => {
        const belongs =
          message.sender === selectedUserRef.current?._id ||
          message.receiver === selectedUserRef.current?._id;
        if (!belongs) return prev;
        return [...prev, message];
      });

      if (isOpenChat) {
        const now = new Date().toISOString();
        socket.emit("mark_read", { senderId: message.sender, readAt: now });
      }

      if (!isOpenChat) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.sender]: (prev[message.sender] || 0) + 1,
        }));
      }

      setConversations((prev) => {
        const existing = prev.find((u) => u._id === message.sender);
        if (existing) {
          return [existing, ...prev.filter((u) => u._id !== message.sender)];
        }
        return prev;
      });

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

    socket.on("messages_read", ({ readBy, readAt }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.sender === user._id && m.receiver === readBy && !m.isRead) {
            return { ...m, isRead: true, readAt };
          }
          return m;
        })
      );
    });

    // someone sent us a follow request in real time
    socket.on("follow_request", ({ requestId, sender }) => {
      setNotificationCount((prev) => prev + 1);
    });

    // our follow request was accepted
    socket.on("request_accepted", ({ acceptedBy }) => {
      // if profile card is open for this user, update their button state
      // by re-fetching (ProfileCard handles its own status fetch on mount,
      // so just close and let the user re-open if needed — or notify them)
      // For now, a simple alert-style notification is fine here
      console.log(`${acceptedBy.username} accepted your follow request`);
    });

    socket.on("typing", ({ senderId }) => {
      if (senderId === selectedUserRef.current?._id) setTypingFrom(senderId);
    });

    socket.on("stop_typing", ({ senderId }) => {
      if (senderId === selectedUserRef.current?._id) setTypingFrom(null);
    });

    return () => {
      socket.off("connect");
      socket.off("online_users");
      socket.off("receive_message");
      socket.off("message_sent");
      socket.off("messages_read");
      socket.off("follow_request");
      socket.off("request_accepted");
      socket.off("typing");
      socket.off("stop_typing");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  const handleSelectUser = useCallback(async (otherUser) => {
    setSelectedUser(otherUser);
    setTypingFrom(null);

    setUnreadCounts((prev) => {
      if (!prev[otherUser._id]) return prev;
      const updated = { ...prev };
      delete updated[otherUser._id];
      return updated;
    });

    setConversations((prev) => {
      const existing = prev.find((u) => u._id === otherUser._id);
      const rest = prev.filter((u) => u._id !== otherUser._id);
      return [existing || otherUser, ...rest];
    });

    try {
      const res = await api.get(`/api/messages/${otherUser._id}`);
      setMessages(res.data);
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
    async (text, replyingTo = null, messageType = "text") => {
      if (!selectedUser) return;
      try {
        const body = { text, messageType };
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

  const handleBackToList = () => setSelectedUser(null);

  // called when the user accepts a follow request through the notification
  // panel and then wants to open chat with that person from ProfileCard
  const handleOpenChatFromProfile = (profileUser) => {
    setProfileCardUser(null);
    handleSelectUser(profileUser);
  };

  if (loading || !user) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading…</p>
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
          notificationCount={notificationCount}
          onBellClick={() => setShowNotifications((v) => !v)}
          onProfileCardOpen={setProfileCardUser}
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

      {/* profile card overlay — shown when clicking a search result */}
      {profileCardUser && (
        <ProfileCard
          user={profileCardUser}
          currentUser={user}
          onClose={() => setProfileCardUser(null)}
          onOpenChat={handleOpenChatFromProfile}
        />
      )}

      {/* notification panel — slides in from the right */}
      {showNotifications && (
        <NotificationPanel
          onClose={() => setShowNotifications(false)}
          onCountChange={setNotificationCount}
        />
      )}
    </div>
  );
}
