// Short labels for the chat list — "now", "5m", "3h", "Mon", "12 Jul".
// Messenger keeps these very tight so they never push the name out of the row.
export function formatListTime(date) {
  if (!date) return "";

  const then = new Date(date);
  const minutes = Math.floor((Date.now() - then.getTime()) / 60000);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return then.toLocaleDateString([], { weekday: "short" });

  return then.toLocaleDateString([], { day: "numeric", month: "short" });
}

// The clock time printed next to a bubble on hover — "14:32".
export function formatClock(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// The grey label that splits the thread into days.
export function formatDayLabel(date) {
  const day = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(day, today)) return "Today";
  if (isSameDay(day, yesterday)) return "Yesterday";

  return day.toLocaleDateString([], {
    day: "numeric",
    month: "long",
    year: day.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// `sender` comes back as a plain id most of the time, but as a populated
// object in a couple of places — this flattens both to a string.
export function senderId(message) {
  const sender = message?.sender;
  return typeof sender === "object" && sender !== null ? sender._id : sender;
}

// Two messages belong to the same "group" (stacked with flattened corners)
// when the same person sent them less than 5 minutes apart.
export function isSameGroup(a, b) {
  if (!a || !b) return false;
  if (senderId(a) !== senderId(b)) return false;

  const gap = Math.abs(new Date(a.createdAt) - new Date(b.createdAt));
  return gap < 5 * 60 * 1000;
}
