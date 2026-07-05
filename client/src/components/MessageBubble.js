"use client";

import { useState } from "react";
import { useRelativeTime } from "@/lib/useRelativeTime";

export default function MessageBubble({ message, isOwnMessage, onReply, currentUsername }) {
  const [hovered, setHovered] = useState(false);

  const sentTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // live-updating label for when this message was seen —
  // only shown on our own sent messages that have been read
  const seenLabel = useRelativeTime(
    isOwnMessage && message.isRead ? message.readAt || message.createdAt : null
  );

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        justifyContent: isOwnMessage ? "flex-end" : "flex-start",
        alignItems: "flex-end",
        gap: "6px",
        marginBottom: "10px",
        animation: "bubbleIn 0.18s ease-out",
      }}
    >
      {/* reply button — appears on the left of your own messages */}
      {isOwnMessage && (
        <button
          onClick={() => onReply(message)}
          style={{
            ...styles.replyBtn,
            opacity: hovered ? 1 : 0,
            pointerEvents: hovered ? "auto" : "none",
          }}
          aria-label="Reply to this message"
          title="Reply"
        >
          ↩
        </button>
      )}

      <div
        className="message-bubble"
        style={{
          padding: "10px 14px",
          borderRadius: isOwnMessage
            ? "16px 16px 4px 16px"
            : "16px 16px 16px 4px",
          background: isOwnMessage
            ? "var(--bubble-sent-bg)"
            : "var(--bubble-received-bg)",
          color: isOwnMessage
            ? "var(--bubble-sent-text)"
            : "var(--bubble-received-text)",
          border: isOwnMessage
            ? "none"
            : "1px solid var(--bubble-received-border)",
          boxShadow: "var(--shadow-sm)",
          wordBreak: "break-word",
        }}
      >
        {/* quoted reply preview — shown when this message is a reply */}
        {message.replyTo?.text && (
          <div
            style={{
              ...styles.replyPreview,
              borderLeftColor: isOwnMessage
                ? "rgba(255,255,255,0.5)"
                : "var(--border)",
              background: isOwnMessage
                ? "rgba(255,255,255,0.12)"
                : "var(--bg)",
            }}
          >
            <span style={styles.replyPreviewName}>
              {message.replyTo.senderUsername}
            </span>
            <span style={styles.replyPreviewText}>
              {message.replyTo.text.length > 80
                ? message.replyTo.text.slice(0, 80) + "…"
                : message.replyTo.text}
            </span>
          </div>
        )}

        <p style={{ fontSize: "14.5px", margin: 0, lineHeight: 1.45 }}>
          {message.text}
        </p>

        <div style={styles.metaRow}>
          <span style={{ fontSize: "10.5px", opacity: 0.65 }}>{sentTime}</span>

          {/* seen status — only shown on your own sent messages */}
          {isOwnMessage && (
            <span style={styles.seenLabel}>
              {message.isRead ? `Seen ${seenLabel}` : "Sent"}
            </span>
          )}
        </div>
      </div>

      {/* reply button — appears on the right of received messages */}
      {!isOwnMessage && (
        <button
          onClick={() => onReply(message)}
          style={{
            ...styles.replyBtn,
            opacity: hovered ? 1 : 0,
            pointerEvents: hovered ? "auto" : "none",
          }}
          aria-label="Reply to this message"
          title="Reply"
        >
          ↩
        </button>
      )}
    </div>
  );
}

const styles = {
  replyBtn: {
    background: "transparent",
    border: "none",
    fontSize: "16px",
    color: "var(--text-muted)",
    padding: "4px",
    cursor: "pointer",
    transition: "opacity 0.15s ease",
    lineHeight: 1,
    flexShrink: 0,
  },
  replyPreview: {
    borderLeft: "3px solid",
    paddingLeft: "8px",
    marginBottom: "8px",
    borderRadius: "4px",
    padding: "6px 8px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  replyPreviewName: {
    fontSize: "11px",
    fontWeight: "700",
    opacity: 0.8,
  },
  replyPreviewText: {
    fontSize: "12px",
    opacity: 0.7,
    fontStyle: "italic",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "6px",
    marginTop: "4px",
  },
  seenLabel: {
    fontSize: "10.5px",
    opacity: 0.65,
  },
};
