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
      }}
    >
      <div
        style={{
          maxWidth: "60%",
          padding: "10px 14px",
          borderRadius: "14px",
          background: isOwnMessage ? "#000000" : "#ffffff",
          color: isOwnMessage ? "#ffffff" : "#000000",
          border: isOwnMessage ? "1px solid #000000" : "1px solid #000000",
          wordBreak: "break-word",
        }}
      >
        <p style={{ fontSize: "14px", margin: 0 }}>{message.text}</p>
        <span
          style={{
            fontSize: "10px",
            opacity: 0.6,
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
