"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

// shown when you click on a user in search results —
// lets you see follow status and send/manage a follow request
// before being allowed to open a chat
export default function ProfileCard({ user, currentUser, onClose, onOpenChat }) {
  const [status, setStatus] = useState(null); // { outgoing, incoming }
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchStatus = async () => {
      try {
        const res = await api.get(`/api/follow/status/${user._id}`);
        setStatus(res.data);
      } catch (err) {
        console.error("Failed to fetch follow status", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [user]);

  const sendRequest = async () => {
    setActing(true);
    try {
      await api.post(`/api/follow/send/${user._id}`);
      setStatus((prev) => ({ ...prev, outgoing: "pending" }));
    } catch (err) {
      console.error("Failed to send request", err);
    } finally {
      setActing(false);
    }
  };

  // render the right action button based on relationship state
  const renderFollowButton = () => {
    if (loading) {
      return <button style={{ ...styles.btn, ...styles.btnGhost }}>Loading…</button>;
    }

    const out = status?.outgoing;
    const inc = status?.incoming;

    // they accepted your request — you're following them, can open chat
    if (out === "accepted") {
      return (
        <div style={styles.buttonRow}>
          <span style={styles.followingBadge}>✓ Following</span>
          <button
            onClick={() => onOpenChat(user)}
            style={{ ...styles.btn, ...styles.btnPrimary }}
          >
            Open Chat
          </button>
        </div>
      );
    }

    // you sent a request and it's still pending
    if (out === "pending") {
      return (
        <button disabled style={{ ...styles.btn, ...styles.btnGhost }}>
          Requested
        </button>
      );
    }

    // they sent you a request — show accept/reject in the notification panel
    // but also show a note here so the context is clear
    if (inc === "pending") {
      return (
        <p style={styles.incomingNote}>
          This user sent you a follow request — check your notifications.
        </p>
      );
    }

    if (inc === "accepted") {
      return (
        <div style={styles.buttonRow}>
          <span style={styles.followingBadge}>Follows you</span>
          <button
            onClick={sendRequest}
            disabled={acting}
            style={{ ...styles.btn, ...styles.btnPrimary }}
          >
            {acting ? "Sending…" : "Follow Back"}
          </button>
        </div>
      );
    }

    // no relationship yet — show Follow button
    return (
      <button
        onClick={sendRequest}
        disabled={acting}
        style={{ ...styles.btn, ...styles.btnPrimary }}
      >
        {acting ? "Sending…" : "Follow"}
      </button>
    );
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={styles.closeBtn} aria-label="Close">
          ✕
        </button>

        <div style={styles.avatar}>
          {user.username.slice(0, 1).toUpperCase()}
        </div>

        <h2 style={styles.username}>{user.username}</h2>
        <p style={styles.email}>{user.email}</p>

        <div style={styles.actions}>{renderFollowButton()}</div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 200,
  },
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "32px 28px",
    width: "320px",
    maxWidth: "90vw",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    boxShadow: "var(--shadow-md)",
  },
  closeBtn: {
    position: "absolute",
    top: "14px",
    right: "16px",
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    fontSize: "16px",
    cursor: "pointer",
  },
  avatar: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    background: "var(--bubble-sent-bg)",
    color: "var(--bubble-sent-text)",
    fontSize: "28px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "8px",
  },
  username: {
    fontSize: "20px",
    fontWeight: "700",
    color: "var(--text)",
    margin: 0,
  },
  email: {
    fontSize: "13px",
    color: "var(--text-muted)",
    margin: 0,
  },
  actions: {
    marginTop: "16px",
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },
  buttonRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  btn: {
    padding: "10px 22px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
  },
  btnPrimary: {
    background: "var(--bubble-sent-bg)",
    color: "var(--bubble-sent-text)",
  },
  btnGhost: {
    background: "var(--bubble-received-bg)",
    color: "var(--text-muted)",
    border: "1px solid var(--border)",
    cursor: "default",
  },
  followingBadge: {
    fontSize: "13px",
    color: "var(--accent-online)",
    fontWeight: "600",
  },
  incomingNote: {
    fontSize: "13px",
    color: "var(--text-muted)",
    textAlign: "center",
    lineHeight: 1.5,
  },
};
