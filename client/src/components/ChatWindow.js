"use client";

import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import { BackIcon, CloseIcon, SendIcon, ThumbIcon } from "./Icons";
import { useRelativeTime } from "@/lib/useRelativeTime";
import {
  formatDayLabel,
  isSameDay,
  isSameGroup,
  senderId,
} from "@/lib/time";

export default function ChatWindow({
  selectedUser,
  messages,
  currentUserId,
  isOnline,
  isTyping,
  onSendMessage,
  onTyping,
  onStopTyping,
  onBack,
}) {
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  // always keep the newest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // hitting reply should drop you straight into the input
  useEffect(() => {
    if (replyingTo) inputRef.current?.focus();
  }, [replyingTo]);

  const send = (body) => {
    if (!body.trim()) return;

    onSendMessage(body.trim(), replyingTo);
    setText("");
    setReplyingTo(null);
    onStopTyping();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send(text);
  };

  const handleChange = (e) => {
    setText(e.target.value);
    onTyping();
  };

  // the last message you sent, used for the Sent / Seen line at the bottom
  const lastMessage = messages[messages.length - 1];
  const lastIsMine = lastMessage && senderId(lastMessage) === currentUserId;

  return (
    <section className="panel chat">
      <header className="chat-head">
        {onBack && (
          <button className="icon-btn is-plain" onClick={onBack} aria-label="Back">
            <BackIcon />
          </button>
        )}

        <Avatar user={selectedUser} size={40} online={isOnline} />

        <div>
          <div className="chat-head-name">{selectedUser.username}</div>
          <div className="chat-head-status">
            {isOnline ? "Active now" : "Offline"}
          </div>
        </div>
      </header>

      <div className="messages scroll-area">
        {messages.length === 0 && (
          <div className="empty">
            <Avatar user={selectedUser} size={72} />
            <p className="empty-title" style={{ marginTop: 12 }}>
              {selectedUser.username}
            </p>
            <p className="empty-text">
              This is the start of your conversation. Say something.
            </p>
          </div>
        )}

        {messages.map((message, i) => {
          const previous = messages[i - 1];
          const next = messages[i + 1];

          const isOwn = senderId(message) === currentUserId;

          // a divider whenever we roll over into a new day
          const startsNewDay =
            !previous ||
            !isSameDay(new Date(previous.createdAt), new Date(message.createdAt));

          const joinTop = !startsNewDay && isSameGroup(previous, message);
          const joinBottom = isSameGroup(message, next);

          return (
            <div key={message._id}>
              {startsNewDay && (
                <div className="day-divider">
                  {formatDayLabel(message.createdAt)}
                </div>
              )}

              <MessageBubble
                message={message}
                isOwn={isOwn}
                sender={selectedUser}
                joinTop={joinTop}
                joinBottom={joinBottom}
                onReply={setReplyingTo}
              />
            </div>
          );
        })}

        {isTyping && (
          <div className="msg-line is-in">
            <Avatar user={selectedUser} size={28} />
            <div className="typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        {lastIsMine && <Receipt message={lastMessage} />}

        <div ref={bottomRef} />
      </div>

      {replyingTo && (
        <div className="reply-bar">
          <div className="reply-bar-body">
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Replying to{" "}
              <strong>
                {senderId(replyingTo) === currentUserId
                  ? "yourself"
                  : selectedUser.username}
              </strong>
            </div>
            <div
              style={{
                fontSize: 13,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {replyingTo.text}
            </div>
          </div>

          <button
            className="icon-btn is-plain"
            onClick={() => setReplyingTo(null)}
            aria-label="Cancel reply"
          >
            <CloseIcon />
          </button>
        </div>
      )}

      <form className="composer" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className="composer-input"
          type="text"
          value={text}
          onChange={handleChange}
          onBlur={onStopTyping}
          placeholder={replyingTo ? "Type your reply…" : "Aa"}
        />

        {/* empty box gives you the thumbs up, like the real thing */}
        {text.trim() ? (
          <button className="send-btn" type="submit" aria-label="Send message">
            <SendIcon />
          </button>
        ) : (
          <button
            className="send-btn"
            type="button"
            onClick={() => send("👍")}
            aria-label="Send a thumbs up"
          >
            <ThumbIcon />
          </button>
        )}
      </form>
    </section>
  );
}

/* ---------------------------------------------------------------- */

// Sits under your last message. Plain text — "Sent" until they open the
// chat, then "Seen just now", which ticks over to "Seen 2m ago" on its own
// because useRelativeTime refreshes the label every 30 seconds.
function Receipt({ message }) {
  const seenAgo = useRelativeTime(
    message.isRead ? message.readAt || message.createdAt : null
  );

  return (
    <div className="receipt">
      {message.isRead ? `Seen ${seenAgo}` : "Sent"}
    </div>
  );
}
