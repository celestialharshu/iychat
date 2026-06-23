"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";

export default function ChatPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [typingFrom, setTypingFrom] = useState(null);

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // fetch the list of other users once logged in
  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      try {
        const res = await api.get("/api/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };

    fetchUsers();
  }, [user]);

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
      setMessages((prev) => {
        // only append if this message belongs to the open conversation
        const belongsToOpenChat =
          message.sender === selectedUserRef.current?._id ||
          message.receiver === selectedUserRef.current?._id;
        if (!belongsToOpenChat) return prev;
        return [...prev, message];
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

    try {
      const res = await api.get(`/api/messages/${otherUser._id}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load messages", err);
      setMessages([]);
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

  if (loading || !user) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar
        users={users}
        selectedUser={selectedUser}
        onSelectUser={handleSelectUser}
        onlineUserIds={onlineUserIds}
        currentUser={user}
        onLogout={handleLogout}
      />
      <ChatWindow
        selectedUser={selectedUser}
        messages={messages}
        currentUserId={user._id}
        onSendMessage={handleSendMessage}
        isTyping={typingFrom === selectedUser?._id}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
      />
    </div>
  );
}
