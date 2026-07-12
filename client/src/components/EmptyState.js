"use client";

// What you see in the big panel before you've opened a conversation.
// The bubble is a plain SVG so it stays crisp and picks up the theme —
// no image file to ship.
export default function EmptyState() {
  return (
    <section className="panel chat">
      <div className="empty">
        <svg width="180" height="150" viewBox="0 0 180 150" aria-hidden="true">
          <defs>
            <linearGradient id="bubbleFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#dff3ff" />
              <stop offset="55%" stopColor="#eef4ff" />
              <stop offset="100%" stopColor="#e7e3ff" />
            </linearGradient>

            <linearGradient id="cursorFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="45%" stopColor="#0a84ff" />
              <stop offset="100%" stopColor="#6b4dff" />
            </linearGradient>

            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow
                dx="0"
                dy="8"
                stdDeviation="10"
                floodColor="#4d6bff"
                floodOpacity="0.2"
              />
            </filter>
          </defs>

          {/* a squared-off bubble, same shape language as the logo */}
          <g filter="url(#glow)">
            <path
              d="M46 20h88a26 26 0 0 1 26 26v42a26 26 0 0 1-26 26H74l-27 17 8-17h-9a26 26 0 0 1-26-26V46a26 26 0 0 1 26-26Z"
              fill="url(#bubbleFill)"
            />
          </g>

          {/* the cursor sitting inside it */}
          <path d="M76 44 118 68 98 74 88 92 76 44Z" fill="url(#cursorFill)" />
        </svg>

        <p className="empty-title">No chats selected</p>
        <p className="empty-text">
          Pick a conversation on the left, or search for someone to start a new one.
        </p>
      </div>
    </section>
  );
}
