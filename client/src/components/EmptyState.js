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
              <stop offset="0%" stopColor="#e9e6ff" />
              <stop offset="55%" stopColor="#f6f4ff" />
              <stop offset="100%" stopColor="#ffeef6" />
            </linearGradient>

            <linearGradient id="cursorFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0099ff" />
              <stop offset="50%" stopColor="#a033ff" />
              <stop offset="100%" stopColor="#ff5280" />
            </linearGradient>

            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow
                dx="0"
                dy="8"
                stdDeviation="10"
                floodColor="#a033ff"
                floodOpacity="0.18"
              />
            </filter>
          </defs>

          {/* the speech bubble */}
          <g filter="url(#glow)">
            <path
              d="M90 18c34 0 62 21 62 47 0 26-28 47-62 47-6 0-12-.6-17.6-1.8L54 124a3 3 0 0 1-4.4-3.3l3.4-15.6C37 96.6 28 82.6 28 65 28 39 56 18 90 18Z"
              fill="url(#bubbleFill)"
            />
          </g>

          {/* the cursor sitting inside it */}
          <path
            d="M78 44 116 66 98 71 89 90 78 44Z"
            fill="url(#cursorFill)"
          />
        </svg>

        <p className="empty-title">No chats selected</p>
        <p className="empty-text">
          Pick a conversation on the left, or search for someone to start a new one.
        </p>
      </div>
    </section>
  );
}
