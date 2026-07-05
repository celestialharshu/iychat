"use client";

import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({
  selectedUser,
  messages,
  currentUserId,
  currentUsername,
  onSendMessage,
  isTyping,
  onTyping,
  onStopTyping,
  onBack,
}) {
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // the message being replied to
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // when reply is set, focus the input automatically so the user can
  // start typing without an extra tap
  useEffect(() => {
    if (replyingTo) {
      inputRef.current?.focus();
    }
  }, [replyingTo]);

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

    onSendMessage(text.trim(), replyingTo);
    setText("");
    setReplyingTo(null);
    onStopTyping();
  };

  const handleChange = (e) => {
    setText(e.target.value);
    onTyping();
  };

  const handleReply = (message) => {
    setReplyingTo(message);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        {onBack && (
          <button onClick={onBack} style={styles.backBtn} aria-label="Back">
            ←
          </button>
        )}
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
            isOwnMessage={
              msg.sender === currentUserId ||
              msg.sender?._id === currentUserId
            }
            currentUsername={currentUsername}
            onReply={handleReply}
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

      {/* reply bar — appears above input when replying to a message */}
      {replyingTo && (
        <div style={styles.replyBar}>
          <div style={styles.replyBarContent}>
            <span style={styles.replyBarLabel}>
              Replying to{" "}
              <strong>
                {replyingTo.sender === currentUserId ||
                replyingTo.sender?._id === currentUserId
                  ? "yourself"
                  : selectedUser.username}
              </strong>
            </span>
            <span style={styles.replyBarText}>
              {replyingTo.text.length > 60
                ? replyingTo.text.slice(0, 60) + "…"
                : replyingTo.text}
            </span>
          </div>
          <button
            onClick={cancelReply}
            style={styles.cancelReplyBtn}
            aria-label="Cancel reply"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.inputBar}>
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleChange}
          placeholder={replyingTo ? "Type your reply…" : "Type a message"}
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
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  backBtn: {
    fontSize: "18px",
    background: "transparent",
    color: "var(--text)",
    border: "none",
    padding: "4px 6px",
    lineHeight: 1,
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
  replyBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    borderTop: "1px solid var(--border)",
    background: "var(--surface)",
    gap: "12px",
  },
  replyBarContent: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    overflow: "hidden",
  },
  replyBarLabel: {
    fontSize: "12px",
    color: "var(--text-muted)",
  },
  replyBarText: {
    fontSize: "13px",
    color: "var(--text)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cancelReplyBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    fontSize: "14px",
    cursor: "pointer",
    flexShrink: 0,
    padding: "4px",
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
