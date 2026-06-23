"use client";

import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({
  selectedUser,
  messages,
  currentUserId,
  onSendMessage,
  isTyping,
  onTyping,
  onStopTyping,
}) {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!selectedUser) {
    return (
      <div style={styles.placeholder}>
        <p>Select a user from the left to start chatting</p>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText("");
    onStopTyping();
  };

  const handleChange = (e) => {
    setText(e.target.value);
    onTyping();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.headerTitle}>{selectedUser.username}</h3>
      </div>

      <div style={styles.messages}>
        {messages.length === 0 && (
          <p style={styles.emptyText}>
            No messages yet. Say hello to {selectedUser.username}!
          </p>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            isOwnMessage={msg.sender === currentUserId}
          />
        ))}

        {isTyping && <p style={styles.typingText}>typing...</p>}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} style={styles.inputBar}>
        <input
          type="text"
          value={text}
          onChange={handleChange}
          placeholder="Type a message"
          style={styles.input}
        />
        <button type="submit" style={styles.sendBtn}>
          Send
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#ffffff",
  },
  placeholder: {
    flex: 1,
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#666666",
    fontSize: "14px",
  },
  header: {
    padding: "16px",
    borderBottom: "1px solid #000000",
  },
  headerTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#000000",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
  },
  emptyText: {
    color: "#666666",
    fontSize: "13px",
    textAlign: "center",
    marginTop: "20px",
  },
  typingText: {
    fontSize: "12px",
    color: "#666666",
    fontStyle: "italic",
    marginTop: "4px",
  },
  inputBar: {
    display: "flex",
    gap: "10px",
    padding: "16px",
    borderTop: "1px solid #000000",
  },
  input: {
    flex: 1,
    padding: "12px",
    border: "1px solid #000000",
    background: "#ffffff",
    color: "#000000",
    fontSize: "14px",
    outline: "none",
  },
  sendBtn: {
    padding: "12px 20px",
    background: "#000000",
    color: "#ffffff",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
  },
};
