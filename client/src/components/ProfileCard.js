"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Avatar from "./Avatar";
import { CloseIcon } from "./Icons";

// You can't message a stranger straight away — you follow them, they confirm,
// and then the chat opens. This card is where that happens.
export default function ProfileCard({ user, onClose, onOpenChat }) {
  const [status, setStatus] = useState(null); // { outgoing, incoming }
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api
      .get(`/api/follow/status/${user._id}`)
      .then((res) => setStatus(res.data))
      .catch((err) => console.error("Failed to load follow status", err))
      .finally(() => setLoading(false));
  }, [user._id]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const follow = async () => {
    setSending(true);
    try {
      await api.post(`/api/follow/send/${user._id}`);
      setStatus((prev) => ({ ...prev, outgoing: "pending" }));
    } catch (err) {
      console.error("Failed to send follow request", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-cover" />

        <button
          className="icon-btn"
          onClick={onClose}
          aria-label="Close"
          style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.25)", color: "#fff" }}
        >
          <CloseIcon />
        </button>

        <div className="modal-body">
          <div style={{ borderRadius: "50%", border: "4px solid var(--panel)" }}>
            <Avatar user={user} size={76} />
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>
            {user.username}
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{user.email}</p>

          <div style={{ marginTop: 18, width: "100%" }}>
            <Action
              user={user}
              loading={loading}
              status={status}
              sending={sending}
              onFollow={follow}
              onOpenChat={() => onOpenChat(user)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function Action({ user, loading, status, sending, onFollow, onOpenChat }) {
  if (loading) {
    return (
      <button className="btn btn-ghost btn-block" disabled>
        Loading…
      </button>
    );
  }

  const outgoing = status?.outgoing;
  const incoming = status?.incoming;

  // they confirmed you — the chat is unlocked
  if (outgoing === "accepted") {
    return (
      <button className="btn btn-primary btn-block" onClick={onOpenChat}>
        Message
      </button>
    );
  }

  if (outgoing === "pending") {
    return (
      <button className="btn btn-ghost btn-block" disabled>
        Request sent
      </button>
    );
  }

  // they asked to follow you first — answer it from the notifications drawer
  if (incoming === "pending") {
    return (
      <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
        {user.username} sent you a follow request. Open your notifications to
        confirm it.
      </p>
    );
  }

  return (
    <button
      className="btn btn-primary btn-block"
      onClick={onFollow}
      disabled={sending}
    >
      {sending ? "Sending…" : incoming === "accepted" ? "Follow back" : "Follow"}
    </button>
  );
}
