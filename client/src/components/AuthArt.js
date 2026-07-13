"use client";

// The illustration on the right of the sign in / sign up pages.
//
// A chat window drawn as flat bars, with two labelled carets in it — one for
// you, one for them — and a follow notification sliding in over the corner.
// Everything is a flat fill from a CSS variable, so it repaints itself in dark
// mode. No gradients.

const HEADLINE = "Type. Send. Seen.";

const THEM = "#6b4dff"; // their accent, same as their avatar in the app

export default function AuthArt() {
  return (
    <div className="auth-art-inner">
      <svg className="auth-art" viewBox="0 0 560 400" aria-hidden="true">
        <defs>
          {/* lifts the notification card off the window behind it */}
          <filter id="lift" x="-20%" y="-20%" width="150%" height="160%">
            <feDropShadow
              dx="0"
              dy="6"
              stdDeviation="10"
              floodColor="#000"
              floodOpacity="0.14"
            />
          </filter>
        </defs>

        {/* ---------- the chat window ---------- */}
        <rect
          x="20"
          y="20"
          width="440"
          height="300"
          rx="14"
          fill="var(--panel)"
          stroke="var(--divider)"
        />

        {/* its title bar */}
        <circle cx="44" cy="44" r="5" fill="var(--blue)" />
        <rect x="60" y="39" width="90" height="10" rx="5" fill="var(--divider)" />
        <line x1="20" y1="68" x2="460" y2="68" stroke="var(--divider)" />

        {/* theirs, on the left */}
        <rect x="48" y="96" width="156" height="18" rx="9" fill="var(--bubble-in)" />
        <rect x="48" y="122" width="108" height="18" rx="9" fill="var(--bubble-in)" />

        {/* yours, on the right — with your caret sitting on it */}
        <rect x="270" y="158" width="162" height="18" rx="9" fill="var(--bubble-out)" />
        <rect x="348" y="130" width="44" height="20" rx="10" fill="var(--blue)" />
        <text
          x="370"
          y="144"
          textAnchor="middle"
          fill="#fff"
          fontSize="11"
          fontWeight="600"
        >
          you
        </text>
        <rect x="369" y="150" width="2" height="14" fill="var(--blue)" />

        <rect x="322" y="184" width="110" height="18" rx="9" fill="var(--bubble-out)" />

        {/* theirs, with their caret */}
        <rect x="48" y="220" width="132" height="18" rx="9" fill="var(--bubble-in)" />
        <rect x="188" y="194" width="60" height="20" rx="10" fill={THEM} />
        <text
          x="218"
          y="208"
          textAnchor="middle"
          fill="#fff"
          fontSize="11"
          fontWeight="600"
        >
          aditya
        </text>
        <rect x="196" y="214" width="2" height="14" fill={THEM} />

        {/* they're typing back — these three actually bounce */}
        <rect x="48" y="252" width="74" height="24" rx="12" fill="var(--bubble-in)" />
        <circle className="art-dot" cx="66" cy="264" r="4" fill="var(--text-muted)" />
        <circle className="art-dot" cx="85" cy="264" r="4" fill="var(--text-muted)" />
        <circle className="art-dot" cx="104" cy="264" r="4" fill="var(--text-muted)" />

        {/* ---------- a follow request landing over the corner ---------- */}
        <g filter="url(#lift)">
          <rect
            x="300"
            y="250"
            width="240"
            height="110"
            rx="14"
            fill="var(--panel)"
            stroke="var(--divider)"
          />
          <circle cx="330" cy="284" r="16" fill={THEM} />
          <rect x="356" y="274" width="152" height="10" rx="5" fill="var(--divider)" />
          <rect
            x="356"
            y="290"
            width="104"
            height="8"
            rx="4"
            fill="var(--divider)"
            opacity="0.6"
          />
          <rect x="322" y="320" width="58" height="12" rx="6" fill="var(--blue)" />
          <rect x="390" y="320" width="118" height="12" rx="6" fill="var(--divider)" />
        </g>
      </svg>

      <h2 className="auth-headline">{HEADLINE}</h2>

      <p className="auth-para">
        Follow someone, open a thread, and your messages land the moment you send
        them — typing dots, read receipts and all.
      </p>
    </div>
  );
}
