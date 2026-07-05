"use client";

import { useEffect, useState } from "react";

// converts a date to a human-friendly label like "just now", "2m ago",
// "1h ago", etc. — and automatically refreshes once per minute so labels
// stay accurate without the user needing to reload
function getLabel(date) {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function useRelativeTime(date) {
  const [label, setLabel] = useState(() => getLabel(date));

  useEffect(() => {
    if (!date) return;

    setLabel(getLabel(date));

    // refresh every 30 seconds so labels like "1m ago" stay accurate
    const interval = setInterval(() => {
      setLabel(getLabel(date));
    }, 30_000);

    return () => clearInterval(interval);
  }, [date]);

  return label;
}
