// Every icon in the app lives here so they all share the same stroke weight
// and sizing. They inherit colour from the parent via `currentColor`, which
// is what makes them work in both light and dark mode without any extra CSS.

function Svg({ size = 20, children, fill = "none", ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function ChatIcon({ size, filled }) {
  return (
    <Svg size={size} fill={filled ? "currentColor" : "none"}>
      <path d="M12 3c5 0 9 3.6 9 8s-4 8-9 8a10 10 0 0 1-2.6-.34L4 21l1.1-3.5A7.6 7.6 0 0 1 3 11c0-4.4 4-8 9-8Z" />
    </Svg>
  );
}

export function BellIcon({ size, filled }) {
  return (
    <Svg size={size} fill={filled ? "currentColor" : "none"}>
      <path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7Z" />
      <path d="M13.7 20a2 2 0 0 1-3.4 0" />
    </Svg>
  );
}

export function SearchIcon({ size = 16 }) {
  return (
    <Svg size={size}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Svg>
  );
}

export function ComposeIcon({ size = 18 }) {
  return (
    <Svg size={size}>
      <path d="M17 3.5a2.1 2.1 0 0 1 3 3L8 18.5l-4 1 1-4Z" />
      <path d="m14.5 6 3 3" />
    </Svg>
  );
}

export function SendIcon({ size = 20 }) {
  return (
    <Svg size={size} fill="currentColor" stroke="none">
      <path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12 2-12 2z" />
    </Svg>
  );
}

export function ThumbIcon({ size = 20 }) {
  return (
    <Svg size={size} fill="currentColor" stroke="none">
      <path d="M13 3a1 1 0 0 1 1 1v1.6c0 .9-.2 1.7-.6 2.5L13 9h5.2a2 2 0 0 1 2 2.3l-1 6a2 2 0 0 1-2 1.7H9a3 3 0 0 1-3-3v-5a3 3 0 0 1 1.1-2.3l2.4-2A4 4 0 0 0 11 3.6V4a1 1 0 0 1 1-1ZM4.5 9A1.5 1.5 0 0 1 6 10.5v7a1.5 1.5 0 0 1-3 0v-7A1.5 1.5 0 0 1 4.5 9Z" />
    </Svg>
  );
}

export function BackIcon({ size = 22 }) {
  return (
    <Svg size={size}>
      <path d="M15 19 8 12l7-7" />
    </Svg>
  );
}

export function CloseIcon({ size = 18 }) {
  return (
    <Svg size={size}>
      <path d="M6 6 18 18M18 6 6 18" />
    </Svg>
  );
}

export function ReplyIcon({ size = 15 }) {
  return (
    <Svg size={size}>
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h7a6 6 0 0 1 6 6v4" />
    </Svg>
  );
}

export function MoonIcon({ size = 20 }) {
  return (
    <Svg size={size}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
    </Svg>
  );
}

export function SunIcon({ size = 20 }) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Svg>
  );
}

export function LogoutIcon({ size = 18 }) {
  return (
    <Svg size={size}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </Svg>
  );
}

// The iychat logo mark.
//
// A squared-off speech bubble with two message bars knocked out of it — the
// top one pushed left, the bottom one pushed right. It's a tiny picture of
// the app itself: one person's message, then the other's. Drawn as a single
// path with fill-rule="evenodd", so the bars are cut straight out of the
// bubble and show the solid tile behind it.
export function LogoMark({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 3H17A5 5 0 0 1 22 8V13A5 5 0 0 1 17 18H11L5 21.8L7 18A5 5 0 0 1 2 13V8A5 5 0 0 1 7 3ZM8.3 6.8H12.5A1.5 1.5 0 0 1 12.5 9.8H8.3A1.5 1.5 0 0 1 8.3 6.8ZM11.5 11.8H16A1.5 1.5 0 0 1 16 14.8H11.5A1.5 1.5 0 0 1 11.5 11.8Z"
      />
    </svg>
  );
}
