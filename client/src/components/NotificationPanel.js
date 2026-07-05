"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";

export default function NotificationPanel({ onClose, onCountChange }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef(null);

  useEffect(() => {
    loadRequests();
  }, []);

  // close when clicking outside the panel
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  async function loadRequests() {
    setLoading(true);
    try {
      const res = await api.get("/api/follow/pending");
      setRequests(res.data);
      onCountChange(res.data.length);
    } catch (err) {
      console.error("Failed to load requests", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(requestId) {
    try {
      await api.post(`/api/follow/accept/${requestId}`);
      const updated = requests.filter((r) => r._id !== requestId);
      setRequests(updated);
      onCountChange(updated.length);
    } catch (err) {
      console.error("Failed to accept request", err);
    }
  }

  async function handleReject(requestId) {
    try {
      await api.post(`/api/follow/reject/${requestId}`);
      const updated = requests.filter((r) => r._id !== requestId);
      setRequests(updated);
      onCountChange(updated.length);
    } catch (err) {
      console.error("Failed to reject request", err);
    }
  }

  return (
    <div ref={panelRef} style={styles.panel}>
      <div style={styles.header}>
        <h3 style={styles.title}>Follow Requests</h3>
        <button onClick={onClose} style={styles.closeBtn} aria-label="Close">
          ✕
        </button>
      </div>

      <div style={styles.list}>
        {loading && (
          <p style={styles.emptyText}>Loading…</p>
        )}

        {!loading && requests.length === 0 && (
          <p style={styles.emptyText}>No pending requests</p>
        )}

        {!loading &&
          requests.map((req) => (
            <div key={req._id} style={styles.requestItem}>
              <div style={styles.senderAvatar}>
                {req.sender.username.slice(0, 1).toUpperCase()}
              </div>
              <div style={styles.senderInfo}>
                <span style={styles.senderName}>{req.sender.username}</span>
                <span style={styles.senderSub}>wants to follow you</span>
              </div>
              <div style={styles.actionBtns}>
                <button
                  onClick={() => handleAccept(req._id)}
                  style={{ ...styles.actionBtn, ...styles.acceptBtn }}
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(req._id)}
                  style={{ ...styles.actionBtn, ...styles.rejectBtn }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

const styles = {
  panel: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "320px",
    maxWidth: "100vw",
    height: "100vh",
    background: "var(--surface)",
    borderLeft: "1px solid var(--border)",
    boxShadow: "var(--shadow-md)",
    display: "flex",
    flexDirection: "column",
    zIndex: 300,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 16px",
    borderBottom: "1px solid var(--border)",
  },
  title: {
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--text)",
    margin: 0,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    fontSize: "16px",
    cursor: "pointer",
    padding: "4px",
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: "8px 0",
  },
  emptyText: {
    padding: "24px 16px",
    fontSize: "13px",
    color: "var(--text-muted)",
    textAlign: "center",
  },
  requestItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    borderBottom: "1px solid var(--border)",
  },
  senderAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "var(--bubble-sent-bg)",
    color: "var(--bubble-sent-text)",
    fontSize: "16px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  senderInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    overflow: "hidden",
  },
  senderName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--text)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  senderSub: {
    fontSize: "12px",
    color: "var(--text-muted)",
  },
  actionBtns: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flexShrink: 0,
  },
  actionBtn: {
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    width: "64px",
  },
  acceptBtn: {
    background: "var(--bubble-sent-bg)",
    color: "var(--bubble-sent-text)",
  },
  rejectBtn: {
    background: "var(--bubble-received-bg)",
    color: "var(--text)",
    border: "1px solid var(--border)",
  },
};
