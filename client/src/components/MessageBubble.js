"use client";

import Avatar from "./Avatar";
import { ReplyIcon } from "./Icons";
import { formatClock } from "@/lib/time";

// One row in the thread: the bubble itself, plus the avatar and the
// reply/timestamp controls that fade in when you hover it.
//
// joinTop / joinBottom say whether this message is stacked against another
// one from the same person. When it is, the corner facing that neighbour
// gets flattened — that's the little detail that makes a run of messages
// read as a single block instead of a pile of separate pills.
export default function MessageBubble({
  message,
  isOwn,
  sender,
  joinTop,
  joinBottom,
  onReply,
}) {
  const side = isOwn ? "is-out" : "is-in";

  const bubbleClass = [
    "bubble",
    side,
    joinTop ? "join-top" : "",
    joinBottom ? "join-bottom" : "",
  ].join(" ");

  return (
    <div className={`msg-line ${side} ${joinBottom ? "join-bottom" : ""}`}>
      {/* their avatar sits next to the last bubble of their run — the rest of
          the run gets an empty slot of the same width so nothing shifts */}
      {!isOwn &&
        (joinBottom ? (
          <div style={{ width: 28, flexShrink: 0 }} />
        ) : (
          <Avatar user={sender} size={28} />
        ))}

      <div className={bubbleClass}>
        {message.replyTo?.text && (
          <div className={`quote ${isOwn ? "on-out" : "on-in"}`}>
            <span className="quote-name">{message.replyTo.senderUsername}</span>
            <span className="quote-text">{message.replyTo.text}</span>
          </div>
        )}

        {message.text}
      </div>

      <div className="msg-tools">
        <button
          className="reply-btn"
          onClick={() => onReply(message)}
          aria-label="Reply to this message"
          title="Reply"
        >
          <ReplyIcon />
        </button>
        <span className="msg-time">{formatClock(message.createdAt)}</span>
      </div>
    </div>
  );
}
