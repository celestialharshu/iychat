"use client";

// Nobody has uploaded a photo yet, so we draw a coloured circle with their
// first letter. The colour is picked from the username, which means the same
// person always gets the same colour instead of a random one on every render.
const COLORS = [
  "#0084ff", // messenger blue
  "#a033ff", // violet
  "#ff5280", // pink
  "#ff7061", // coral
  "#f5a623", // amber
  "#31a24c", // green
  "#00c6c0", // teal
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
        background: user?.avatar ? `url(${user.avatar}) center/cover` : colorFor(name),
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
