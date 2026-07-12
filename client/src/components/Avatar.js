"use client";

// Nobody has uploaded a photo yet, so we draw a coloured circle with their
// first letter. The colour is picked from the username, which means the same
// person always gets the same colour instead of a random one on every render.
const COLORS = [
  "#0a84ff", // blue
  "#6b4dff", // indigo
  "#00b8d4", // cyan
  "#8e5cf7", // violet
  "#12b76a", // green
  "#e0457b", // rose
  "#f0932b", // amber
];

function colorFor(name = "") {
  let sum = 0;
  for (const char of name) {
    sum += char.charCodeAt(0);
  }
  return COLORS[sum % COLORS.length];
}

export default function Avatar({ user, size = 48, online = false }) {
  const name = user?.username || "?";
  const dotSize = Math.max(10, Math.round(size * 0.26));

  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.4),
        // the quotes matter: an uploaded photo is a base64 data URL, and
        // unquoted url(...) chokes on the characters inside it
        background: user?.avatar
          ? `url("${user.avatar}") center/cover`
          : colorFor(name),
      }}
      title={name}
    >
      {!user?.avatar && name.charAt(0).toUpperCase()}

      {online && (
        <span
          className="avatar-dot"
          style={{ width: dotSize, height: dotSize }}
        />
      )}
    </div>
  );
}
