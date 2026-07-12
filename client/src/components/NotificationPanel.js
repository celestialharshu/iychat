"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Avatar from "./Avatar";
import { CloseIcon } from "./Icons";
import { useRelativeTime } from "@/lib/useRelativeTime";

export default function NotificationPanel({
  notifications,
  onClose,
  onNotificationUpdate,
}) {
  // Escape closes the drawer — same as every other panel on the web
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <>
      <div className="scrim" onClick={onClose} />

      <aside className="panel drawer">
        <header className="drawer-head">
          <h2 className="list-title">Notifications</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </header>

        <div className="rows scroll-area">
          {notifications.length === 0 ? (
            <div className="empty">
              <p className="empty-title">All caught up</p>
              <p className="empty-text">
                Follow requests and accepts will land here.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationRow
                key={notification._id}
                notification={notification}
                onUpdate={onNotificationUpdate}
              />
            ))
          )}
        </div>
      </aside>
    </>
  );
}

/* ---------------------------------------------------------------- */

// Each row owns its own "busy" state so accepting one request doesn't put
// every other button in the list into a loading state.
function NotificationRow({ notification, onUpdate }) {
  const [busy, setBusy] = useState(false);
  const timeAgo = useRelativeTime(notification.createdAt);

  const actor = notification.actor;

  const answer = async (decision) => {
    if (!notification.followRequestId) return;

    setBusy(true);
    try {
      await api.post(`/api/follow/${decision}/${notification.followRequestId}`);
      // tell the page so the row keeps its new state if you close the drawer
      onUpdate(notification._id, { _localStatus: `${decision}ed` });
    } catch (err) {
      console.error(`Failed to ${decision} follow request`, err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`notif ${notification.read ? "" : "is-unread"}`}>
      <Avatar user={actor} size={44} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <Body notification={notification} actor={actor} />
        <span className="notif-time">{timeAgo}</span>

        {isStillPending(notification) && (
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              className="btn btn-primary"
              onClick={() => answer("accept")}
              disabled={busy}
              style={{ padding: "6px 16px", fontSize: 13 }}
            >
              Confirm
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => answer("reject")}
              disabled={busy}
              style={{ padding: "6px 16px", fontSize: 13 }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// A follow request only still needs an answer if nothing has settled it —
// not this session (_localStatus), and not before we loaded (_requestStatus).
function isStillPending(notification) {
  if (notification.type !== "follow_request") return false;

  const status = notification._localStatus || notification._requestStatus;
  return !status || status === "pending";
}

function Body({ notification, actor }) {
  const name = <strong>{actor?.username || "Someone"}</strong>;
  const status = notification._localStatus || notification._requestStatus;

  if (notification.type === "request_accepted") {
    return <p className="notif-text">{name} accepted your follow request</p>;
  }

  if (status === "accepted") {
    return <p className="notif-text">{name} started following you</p>;
  }

  if (status === "rejected") {
    return (
      <p className="notif-text" style={{ opacity: 0.5 }}>
        You declined {actor?.username}&apos;s request
      </p>
    );
  }

  return <p className="notif-text">{name} wants to follow you</p>;
}
