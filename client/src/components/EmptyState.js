"use client";

// What you see in the big panel before you've opened a conversation.
//
// Plain flat shapes — no gradients, no glow. The fills are CSS variables, so
// the illustration just follows whichever theme is active instead of needing
// a light version and a dark version.
export default function EmptyState() {
  return (
    <section className="panel chat">
      <div className="empty">
        <svg width="170" height="140" viewBox="0 0 170 140" aria-hidden="true">
          {/* a squared-off bubble, same shape language as the logo */}
          <path
            d="M44 18h82a24 24 0 0 1 24 24v40a24 24 0 0 1-24 24H72l-26 16 7-16h-9a24 24 0 0 1-24-24V42a24 24 0 0 1 24-24Z"
            fill="var(--field)"
          />

          {/* the cursor sitting inside it */}
          <path d="M72 42 114 66 94 72 84 90 72 42Z" fill="var(--blue)" />
        </svg>

        <p className="empty-title">No chats selected</p>
        <p className="empty-text">
          Pick a conversation on the left, or search for someone to start a new one.
        </p>
      </div>
    </section>
  );
}
