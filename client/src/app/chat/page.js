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

  // all notifications in one array, newest first — count is derived from this
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileCardUser, setProfileCardUser] = useState(null);

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const selectedUserRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  // load permanent conversation list
  useEffect(() => {
    if (!user) return;
    api.get("/api/messages/conversations")
      .then((res) => {
        setConversations(res.data.map((c) => ({
          _id: c._id,
          username: c.username,
          email: c.email,
          avatar: c.avatar,
        })));
        const counts = {};
        res.data.forEach((c) => {
          if (c.unreadCount > 0) counts[c._id] = c.unreadCount;
        });
        setUnreadCounts(counts);
      })
      .catch((err) => console.error("Failed to load conversations", err));
  }, [user]);

  // load all notifications on mount — this is the permanent history
  useEffect(() => {
    if (!user) return;
    api.get("/api/notifications")
      .then((res) => setNotifications(res.data))
      .catch((err) => console.error("Failed to load notifications", err));
  }, [user]);

  // unread badge count is always derived from the notifications array —
  // never stored separately, so it can never get out of sync
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  // socket setup
  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    socketRef.current = socket;
    socket.emit("user_online", user._id);

    socket.on("connect", () => {
      socket.emit("user_online", user._id);
    });

    socket.on("online_users", (ids) => setOnlineUserIds(ids));

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
      } else {
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
        if (prev.some((u) => u._id === message.sender)) return prev;
        api.get(`/api/users/${message.sender}`)
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
        prev.map((m) =>
          m.sender === user._id && m.receiver === readBy && !m.isRead
            ? { ...m, isRead: true, readAt }
            : m
        )
      );
    });

    // a new notification arrived in real time (follow request or acceptance)
    // prepend it so it appears at the top of the panel immediately
    socket.on("new_notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
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
      socket.off("new_notification");
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
      socketRef.current?.emit("mark_read", {
        senderId: otherUser._id,
        readAt: new Date().toISOString(),
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
        socketRef.current?.emit("send_message", {
          ...res.data,
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

  // when the panel opens, mark everything as read so the bell badge
  // clears — we update the local array immediately so the UI is instant
  const handleBellClick = async () => {
    const opening = !showNotifications;
    setShowNotifications(opening);
    if (opening && unreadNotifCount > 0) {
      // optimistic update — mark all read locally right away
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      // persist to server in the background
      api.post("/api/notifications/read").catch(console.error);
    }
  };

  // when a notification's follow_request row gets accepted inside the panel,
  // update that specific notification's type so the row converts its text
  const handleNotificationUpdate = (notifId, changes) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === notifId ? { ...n, ...changes } : n))
    );
  };

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
          notificationCount={unreadNotifCount}
          onBellClick={handleBellClick}
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
          onBack={isMobile ? () => setSelectedUser(null) : null}
        />
      )}

      {profileCardUser && (
        <ProfileCard
          user={profileCardUser}
          currentUser={user}
          onClose={() => setProfileCardUser(null)}
          onOpenChat={handleOpenChatFromProfile}
        />
      )}

      {showNotifications && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onNotificationUpdate={handleNotificationUpdate}
        />
      )}
    </div>
  );
}
