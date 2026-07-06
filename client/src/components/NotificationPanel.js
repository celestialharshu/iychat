"use client";

import { useRef, useState } from "react";
import api from "@/lib/api";
import { useRelativeTime } from "@/lib/useRelativeTime";

// a single notification row — handles its own accept/reject action state
// so the rest of the list doesn't re-render during an in-progress action
function NotificationRow({ notification, onUpdate }) {
  const [acting, setActing] = useState(false);
  const timeLabel = useRelativeTime(notification.createdAt);

  const actor = notification.actor;
  const type = notification.type;
  // locally overridden status after the user acts in this session
  const [localStatus, setLocalStatus] = useState(null);

  const handleAccept = async () => {
    if (!notification.followRequestId) return;
    setActing(true);
    try {
      await api.post(`/api/follow/accept/${notification.followRequestId}`);
      setLocalStatus("accepted");
      // tell parent to update this notification so it persists correctly
      // if the panel is closed and reopened
      onUpdate(notification._id, { _localStatus: "accepted" });
    } catch (err) {
      console.error("Failed to accept", err);
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    if (!notification.followRequestId) return;
    setActing(true);
    try {
      await api.post(`/api/follow/reject/${notification.followRequestId}`);
      setLocalStatus("rejected");
      onUpdate(notification._id, { _localStatus: "rejected" });
    } catch (err) {
      console.error("Failed to reject", err);
    } finally {
      setActing(false);
    }
  };

  // decide what to render based on type + current action state
  const renderContent = () => {
    if (type === "request_accepted") {
      return (
        <p style={styles.notifText}>
          <strong>{actor?.username}</strong> accepted your follow request
        </p>
      );
    }

    // type === "follow_request"
    // localStatus = acted in this session
    // _localStatus = persisted in parent state from a previous action this session
    // _requestStatus = loaded from the server on page load (real db status)
    const status = localStatus || notification._localStatus || notification._requestStatus;

    if (status === "accepted") {
      return (
        <p style={styles.notifText}>
          <strong>{actor?.username}</strong> started following you
        </p>
      );
    }

    if (status === "rejected") {
      return (
        <p style={{ ...styles.notifText, opacity: 0.5 }}>
          <strong>{actor?.username}</strong> — request declined
        </p>
      );
    }

    // still pending — show accept / reject buttons
    return (
      <>
        <p style={styles.notifText}>
          <strong>{actor?.username}</strong> wants to follow you
        </p>
        <div style={styles.actionRow}>
          <button
            onClick={handleAccept}
            disabled={acting}
            style={{ ...styles.actionBtn, ...styles.acceptBtn }}
          >
            {acting ? "…" : "Accept"}
          </button>
          <button
            onClick={handleReject}
            disabled={acting}
            style={{ ...styles.actionBtn, ...styles.rejectBtn }}
          >
            {acting ? "…" : "Reject"}
          </button>
        </div>
      </>
    );
  };

  return (
    <div
      style={{
        ...styles.row,
        background: notification.read
          ? "transparent"
          : "var(--bubble-received-bg)",
      }}
    >
      <div style={styles.avatar}>
        {actor?.username?.slice(0, 1).toUpperCase() || "?"}
      </div>
      <div style={styles.rowContent}>
        {renderContent()}
        <span style={styles.timeLabel}>{timeLabel}</span>
      </div>
    </div>
  );
}

export default function NotificationPanel({ notifications, onClose, onNotificationUpdate }) {
  const panelRef = useRef(null);

  return (
    <div ref={panelRef} style={styles.panel}>
      <div style={styles.header}>
        <h3 style={styles.title}>Notifications</h3>
        <button onClick={onClose} style={styles.closeBtn} aria-label="Close">
          ✕
        </button>
      </div>

      <div style={styles.list}>
        {notifications.length === 0 && (
          <p style={styles.emptyText}>No notifications yet</p>
        )}

        {notifications.map((notif) => (
          <NotificationRow
            key={notif._id}
            notification={notif}
            onUpdate={onNotificationUpdate}
          />
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
  },
  emptyText: {
    padding: "24px 16px",
    fontSize: "13px",
    color: "var(--text-muted)",
    textAlign: "center",
  },
  row: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "14px 16px",
    borderBottom: "1px solid var(--border)",
    transition: "background 0.2s ease",
  },
  avatar: {
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
  rowContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  notifText: {
    fontSize: "13.5px",
    color: "var(--text)",
    margin: 0,
    lineHeight: 1.4,
  },
  timeLabel: {
    fontSize: "11px",
    color: "var(--text-muted)",
  },
  actionRow: {
    display: "flex",
    gap: "8px",
  },
  actionBtn: {
    padding: "5px 14px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
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
