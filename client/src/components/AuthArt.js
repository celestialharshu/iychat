"use client";

import Typewriter from "./Typewriter";

// The right-hand panel of the sign in / sign up pages: a flat illustration
// with a line of text that types itself out underneath.
//
// The illustration is drawn from the same shapes the logo uses — a bubble with
// message bars in it — so it belongs to the app rather than looking like stock
// art. Fills come from CSS variables, so it repaints itself in dark mode.
// Flat colours only: no gradients anywhere.
//
// The bubbles are nudged a degree or two off square. That's what stops it
// reading as a screenshot of the UI and makes it read as a drawing.

const PHRASES = [
  "Messages land the moment you send them.",
  "See when someone is typing, live.",
  "Follow someone, and start talking.",
];

export default function AuthArt() {
  return (
    <aside className="auth-aside">
      <div className="auth-aside-inner">
        <svg
          className="auth-aside-art"
          viewBox="0 0 460 260"
          aria-hidden="true"
        >
          {/* their message */}
          <g transform="rotate(-1.5 188 47)">
            <circle cx="28" cy="46" r="22" fill="#6b4dff" />
            <rect
              x="62"
              y="20"
              width="252"
              height="54"
              rx="18"
              fill="var(--bubble-in)"
            />
            <rect x="86" y="35" width="166" height="8" rx="4" fill="var(--text-muted)" opacity="0.32" />
            <rect x="86" y="51" width="110" height="8" rx="4" fill="var(--text-muted)" opacity="0.2" />
          </g>

          {/* yours, in the app's blue */}
          <g transform="rotate(1.2 294 125)">
            <rect
              x="148"
              y="94"
              width="292"
              height="62"
              rx="18"
              fill="var(--bubble-out)"
            />
            <rect x="172" y="111" width="206" height="8" rx="4" fill="#fff" opacity="0.6" />
            <rect x="172" y="129" width="142" height="8" rx="4" fill="#fff" opacity="0.38" />
          </g>

          {/* they're typing back — these three actually bounce */}
          <g transform="rotate(-1 108 210)">
            <rect
              x="62"
              y="186"
              width="92"
              height="48"
              rx="18"
              fill="var(--bubble-in)"
            />
            <circle className="art-dot" cx="88" cy="210" r="6" fill="var(--text-muted)" />
            <circle className="art-dot" cx="108" cy="210" r="6" fill="var(--text-muted)" />
            <circle className="art-dot" cx="128" cy="210" r="6" fill="var(--text-muted)" />
          </g>
        </svg>

        <p className="auth-typed">
          <Typewriter phrases={PHRASES} />
        </p>
      </div>
    </aside>
  );
}
