"use client";

export default function MessageBubble({ message, isOwnMessage }) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isOwnMessage ? "flex-end" : "flex-start",
        marginBottom: "10px",
        animation: "bubbleIn 0.18s ease-out",
      }}
    >
      <div
        style={{
          maxWidth: "62%",
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
        <p style={{ fontSize: "14.5px", margin: 0, lineHeight: 1.45 }}>
          {message.text}
        </p>
        <span
          style={{
            fontSize: "10.5px",
            opacity: 0.65,
            display: "block",
            marginTop: "4px",
            textAlign: "right",
          }}
        >
          {time}
        </span>
      </div>
    </div>
  );
}
