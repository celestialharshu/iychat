"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useIsMobile } from "@/lib/useIsMobile";

import NavRail from "@/components/NavRail";
import ChatList from "@/components/ChatList";
import ChatWindow from "@/components/ChatWindow";
import EmptyState from "@/components/EmptyState";
import ProfileCard from "@/components/ProfileCard";
import NotificationPanel from "@/components/NotificationPanel";

// Move a conversation to the top of the list and refresh its preview line —
// this is what makes the sidebar reorder itself as messages come in.
function bumpToTop(list, partnerId, message) {
  const index = list.findIndex((chat) => chat._id === partnerId);
  if (index === -1) return list;

  const updated = {
    ...list[index],
    lastMessageText: message.text,
    lastMessageAt: message.createdAt,
    lastMessageSender: message.sender,
  };

  const rest = list.filter((_, i) => i !== index);
  return [updated, ...rest];
}

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

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileUser, setProfileUser] = useState(null);

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // socket callbacks are registered once, so they'd otherwise close over stale
  // state — these refs give them a live view of what's currently on screen
  const selectedUserRef = useRef(null);
  const conversationsRef = useRef([]);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  /* ---------------------------------------------------------------- */
  /* initial data                                                      */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (!user) return;

    api
      .get("/api/messages/conversations")
      .then((res) => {
        setConversations(res.data);

        const counts = {};
        res.data.forEach((chat) => {
          if (chat.unreadCount > 0) counts[chat._id] = chat.unreadCount;
        });
        setUnreadCounts(counts);
      })
      .catch((err) => console.error("Failed to load conversations", err));

    api
      .get("/api/notifications")
      .then((res) => setNotifications(res.data))
      .catch((err) => console.error("Failed to load notifications", err));
  }, [user]);

  // the badge is always counted from the list itself, so it can never drift
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  /* ---------------------------------------------------------------- */
  /* sockets                                                           */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    socketRef.current = socket;
    socket.emit("user_online", user._id);

    socket.on("connect", () => socket.emit("user_online", user._id));
    socket.on("online_users", setOnlineUserIds);

    socket.on("receive_message", (message) => {
      const from = message.sender;
      const chatIsOpen = from === selectedUserRef.current?._id;

      if (chatIsOpen) {
        setMessages((prev) => [...prev, message]);
        socket.emit("mark_read", {
          senderId: from,
          readAt: new Date().toISOString(),
        });
      } else {
        setUnreadCounts((prev) => ({ ...prev, [from]: (prev[from] || 0) + 1 }));
      }

      const known = conversationsRef.current.some((chat) => chat._id === from);

      if (known) {
        setConversations((prev) => bumpToTop(prev, from, message));
      } else {
        // first message from someone we don't have in the list yet —
        // pull their profile so we can render a proper row for them
        api
          .get(`/api/users/${from}`)
          .then((res) => {
            setConversations((prev) => {
              if (prev.some((chat) => chat._id === res.data._id)) return prev;
              return [
                {
                  ...res.data,
                  lastMessageText: message.text,
                  lastMessageAt: message.createdAt,
                  lastMessageSender: from,
                },
                ...prev,
              ];
            });
          })
          .catch((err) => console.error("Failed to load sender", err));
      }
    });

    socket.on("message_sent", (message) => {
      setMessages((prev) =>
        prev.some((m) => m._id === message._id) ? prev : [...prev, message]
      );
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
  }, [user]);

  /* ---------------------------------------------------------------- */
  /* actions                                                           */
  /* ---------------------------------------------------------------- */

  const handleSelectUser = useCallback(async (partner) => {
    setSelectedUser(partner);
    setTypingFrom(null);

    // clear their unread badge
    setUnreadCounts((prev) => {
      if (!prev[partner._id]) return prev;
      const next = { ...prev };
      delete next[partner._id];
      return next;
    });

    // make sure they're in the list, even if you've never messaged them
    setConversations((prev) =>
      prev.some((chat) => chat._id === partner._id) ? prev : [partner, ...prev]
    );

    try {
      const res = await api.get(`/api/messages/${partner._id}`);
      setMessages(res.data);

      socketRef.current?.emit("mark_read", {
        senderId: partner._id,
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
          ? "Your session expired — log in again."
          : err.message === "Network Error"
          ? "No connection. Check your internet and try again."
          : err.response?.data?.message || "Search failed. Try again.";

      return { results: [], error: message };
    }
  }, []);

  const handleSendMessage = useCallback(
    async (text, replyingTo = null) => {
      if (!selectedUser) return;

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

      try {
        const res = await api.post(`/api/messages/${selectedUser._id}`, body);

        socketRef.current?.emit("send_message", {
          ...res.data,
          sender: user._id,
          receiver: selectedUser._id,
        });

        setConversations((prev) => bumpToTop(prev, selectedUser._id, res.data));
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
      socketRef.current?.emit("stop_typing", {
        senderId: user._id,
        receiverId: selectedUser._id,
      });
    }, 2000);
  }, [selectedUser, user]);

  const handleStopTyping = useCallback(() => {
    if (!selectedUser) return;

    clearTimeout(typingTimeoutRef.current);
    socketRef.current?.emit("stop_typing", {
      senderId: user._id,
      receiverId: selectedUser._id,
    });
  }, [selectedUser, user]);

  // opening the drawer clears the badge — locally first so it feels instant,
  // then on the server in the background
  const handleBellClick = () => {
    const opening = !showNotifications;
    setShowNotifications(opening);

    if (opening && unreadNotifications > 0) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      api.post("/api/notifications/read").catch(console.error);
    }
  };

  const handleNotificationUpdate = (id, changes) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, ...changes } : n))
    );
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  /* ---------------------------------------------------------------- */
  /* render                                                            */
  /* ---------------------------------------------------------------- */

  if (loading || !user) {
    return (
      <div className="auth">
        <p style={{ color: "var(--text-muted)" }}>Loading…</p>
      </div>
    );
  }

  // on a phone you only ever see one panel: the list, or the open chat
  const showList = !isMobile || !selectedUser;
  const showChat = !isMobile || !!selectedUser;

  return (
    <div className="app">
      {!isMobile && (
        <NavRail
          currentUser={user}
          unreadNotifications={unreadNotifications}
          notificationsOpen={showNotifications}
          onBellClick={handleBellClick}
          onLogout={handleLogout}
        />
      )}

      {showList && (
        <ChatList
          conversations={conversations}
          selectedUser={selectedUser}
          onSelectUser={handleSelectUser}
          onlineUserIds={onlineUserIds}
          currentUser={user}
          unreadCounts={unreadCounts}
          unreadNotifications={unreadNotifications}
          onSearch={handleSearch}
          onProfileCardOpen={setProfileUser}
          onBellClick={handleBellClick}
        />
      )}

      {showChat &&
        (selectedUser ? (
          <ChatWindow
            selectedUser={selectedUser}
            messages={messages}
            currentUserId={user._id}
            isOnline={onlineUserIds.includes(selectedUser._id)}
            isTyping={typingFrom === selectedUser._id}
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            onStopTyping={handleStopTyping}
            onBack={isMobile ? () => setSelectedUser(null) : null}
          />
        ) : (
          <EmptyState />
        ))}

      {profileUser && (
        <ProfileCard
          user={profileUser}
          onClose={() => setProfileUser(null)}
          onOpenChat={(partner) => {
            setProfileUser(null);
            handleSelectUser(partner);
          }}
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
