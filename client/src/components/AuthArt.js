"use client";

import Typewriter from "./Typewriter";

// The illustration on the right of the sign in / sign up pages.
//
// It's a collage, not a screenshot: bubbles scattered at slight angles, a
// couple of avatars, and some floating accent shapes. The angles are what stop
// it reading as a picture of the UI — a real interface never sits crooked.
//
// Everything is a flat fill pulled from a CSS variable, so it repaints itself
// in dark mode and there are no gradients anywhere.

const PHRASES = [
  "Messages land the moment you send them.",
  "See when someone is typing, live.",
  "Follow someone, and start talking.",
];

// the same person all the way through, so they keep the same avatar colour
const THEM = "#6b4dff";

export default function AuthArt() {
  return (
    <div className="auth-art-col">
      <svg className="auth-art" viewBox="0 0 560 440" aria-hidden="true">
        {/* --- floating accents, just to fill the corners --- */}
        <circle cx="520" cy="48" r="12" fill="var(--blue)" opacity="0.2" />
        <circle cx="548" cy="88" r="6" fill="var(--blue)" opacity="0.12" />
        <circle cx="498" cy="374" r="9" fill={THEM} opacity="0.18" />
        <circle
          cx="538"
          cy="336"
          r="17"
          fill="none"
          stroke="var(--divider)"
          strokeWidth="3"
        />
        <circle cx="18" cy="170" r="5" fill="var(--divider)" />
        <circle cx="38" cy="192" r="3.5" fill="var(--divider)" />

        {/* --- them --- */}
        <circle cx="36" cy="52" r="26" fill={THEM} />
        <g transform="rotate(-2 221 56)">
          <rect x="76" y="24" width="290" height="64" rx="22" fill="var(--bubble-in)" />
          <rect x="102" y="42" width="200" height="9" rx="4.5" fill="var(--text-muted)" opacity="0.3" />
          <rect x="102" y="61" width="130" height="9" rx="4.5" fill="var(--text-muted)" opacity="0.18" />
        </g>

        {/* --- you --- */}
        <g transform="rotate(1.5 387 161)">
          <rect x="234" y="124" width="306" height="74" rx="22" fill="var(--bubble-out)" />
          <rect x="260" y="145" width="218" height="9" rx="4.5" fill="#fff" opacity="0.6" />
          <rect x="260" y="165" width="152" height="9" rx="4.5" fill="#fff" opacity="0.38" />
        </g>

        {/* --- them again --- */}
        <circle cx="30" cy="272" r="22" fill={THEM} />
        <g transform="rotate(-1 189 270)">
          <rect x="64" y="240" width="250" height="60" rx="22" fill="var(--bubble-in)" />
          <rect x="90" y="265" width="170" height="9" rx="4.5" fill="var(--text-muted)" opacity="0.28" />
        </g>

        {/* --- you, short one --- */}
        <g transform="rotate(2 438 275)">
          <rect x="336" y="246" width="204" height="58" rx="22" fill="var(--bubble-out)" />
          <rect x="362" y="270" width="136" height="9" rx="4.5" fill="#fff" opacity="0.55" />
        </g>

        {/* --- they're typing back; these three actually bounce --- */}
        <circle cx="30" cy="380" r="22" fill={THEM} />
        <g transform="rotate(-2 120 380)">
          <rect x="64" y="352" width="112" height="56" rx="22" fill="var(--bubble-in)" />
          <circle className="art-dot" cx="92" cy="380" r="7" fill="var(--text-muted)" />
          <circle className="art-dot" cx="120" cy="380" r="7" fill="var(--text-muted)" />
          <circle className="art-dot" cx="148" cy="380" r="7" fill="var(--text-muted)" />
        </g>
      </svg>

      <p className="auth-typed">
        <Typewriter phrases={PHRASES} />
      </p>
    </div>
  );
}
