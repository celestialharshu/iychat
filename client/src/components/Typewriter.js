"use client";

import { useEffect, useState } from "react";

// Types a phrase out one character at a time, holds it, deletes it, then moves
// on to the next phrase and starts over.
//
// It's driven by a single timeout that reschedules itself: on every render we
// work out what the next frame should be and how long to wait before it. That's
// much easier to follow than juggling setInterval and trying to cancel it at
// the right moment.
export default function Typewriter({
  phrases,
  typeSpeed = 55, // ms per character while typing
  deleteSpeed = 25, // ms per character while deleting
  pause = 2000, // ms to sit still on a finished phrase
}) {
  const [index, setIndex] = useState(0); // which phrase we're on
  const [length, setLength] = useState(0); // how much of it is showing
  const [deleting, setDeleting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // some people turn animation off at the OS level — respect that and just
  // show the first phrase, finished, instead of typing at them
  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  const phrase = phrases[index];

  useEffect(() => {
    if (reducedMotion) return;

    // finished typing -> hold for a beat, then start deleting
    if (!deleting && length === phrase.length) {
      const timer = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(timer);
    }

    // finished deleting -> move on to the next phrase
    if (deleting && length === 0) {
      setDeleting(false);
      setIndex((current) => (current + 1) % phrases.length);
      return;
    }

    // otherwise add or remove exactly one character
    const timer = setTimeout(
      () => setLength((n) => n + (deleting ? -1 : 1)),
      deleting ? deleteSpeed : typeSpeed
    );

    return () => clearTimeout(timer);
  }, [
    length,
    deleting,
    phrase,
    phrases.length,
    typeSpeed,
    deleteSpeed,
    pause,
    reducedMotion,
  ]);

  return (
    <span>
      {reducedMotion ? phrase : phrase.slice(0, length)}
      <span className="caret" aria-hidden="true" />
    </span>
  );
}
