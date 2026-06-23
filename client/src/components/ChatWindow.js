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

        {isTyping && (
          <div style={styles.typingBubble}>
            <span style={{ ...styles.typingDot, animationDelay: "0s" }} />
            <span style={{ ...styles.typingDot, animationDelay: "0.15s" }} />
            <span style={{ ...styles.typingDot, animationDelay: "0.3s" }} />
          </div>
        )}

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
    background: "var(--bg)",
  },
  placeholder: {
    flex: 1,
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--text-muted)",
    fontSize: "14px",
    background: "var(--bg)",
  },
  header: {
    padding: "16px",
    borderBottom: "1px solid var(--border)",
  },
  headerTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--text)",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
  },
  emptyText: {
    color: "var(--text-muted)",
    fontSize: "13px",
    textAlign: "center",
    marginTop: "20px",
  },
  typingBubble: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "10px 14px",
    borderRadius: "16px 16px 16px 4px",
    background: "var(--bubble-received-bg)",
    border: "1px solid var(--bubble-received-border)",
    width: "fit-content",
    marginTop: "2px",
  },
  typingDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "var(--text-muted)",
    display: "inline-block",
    animation: "typingDot 1.1s infinite ease-in-out",
  },
  inputBar: {
    display: "flex",
    gap: "10px",
    padding: "16px",
    borderTop: "1px solid var(--border)",
  },
  input: {
    flex: 1,
    padding: "12px",
    border: "1px solid var(--input-border)",
    background: "var(--input-bg)",
    color: "var(--text)",
    fontSize: "14px",
    outline: "none",
    borderRadius: "10px",
  },
  sendBtn: {
    padding: "12px 20px",
    background: "var(--bubble-sent-bg)",
    color: "var(--bubble-sent-text)",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    borderRadius: "10px",
  },
};
