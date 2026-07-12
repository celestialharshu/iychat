"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import Avatar from "./Avatar";
import AvatarPicker from "./AvatarPicker";
import { BackIcon } from "./Icons";

// The profile screen. It fills the same big panel that a conversation would,
// and it renders one of two things depending on whose profile it is:
//
//   your own    -> change your photo, rename yourself
//   someone else -> follow them, or message them if you already do
//
// Both versions show the follower and following counts. The server tells us
// which case we're in via the `isMe` flag, so we never have to guess.
export default function ProfilePanel({
  userId,
  onProfileSaved,
  onOpenChat,
  onBack,
}) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get(`/api/users/${userId}/profile`);
      setProfile(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load this profile.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  // Save a newly picked photo. We show it straight away so it feels instant,
  // and put the old one back if the server says no.
  const savePhoto = async (avatar) => {
    const previous = profile.avatar;

    setError("");
    setProfile((p) => ({ ...p, avatar }));

    try {
      const res = await api.patch("/api/users/me", { avatar });
      onProfileSaved({ avatar: res.data.avatar });
    } catch (err) {
      setProfile((p) => ({ ...p, avatar: previous }));
      setError(err.response?.data?.message || "Couldn't save that photo.");
    }
  };

  if (loading) {
    return (
      <Shell onBack={onBack}>
        <p className="empty-text">Loading…</p>
      </Shell>
    );
  }

  // If the fetch failed we have no profile to draw, so the whole panel becomes
  // the error. A failed *save* is different — the profile is still there, so
  // that error gets shown inline further down instead of wiping the screen.
  if (!profile) {
    return (
      <Shell onBack={onBack}>
        <p className="empty-text" style={{ color: "var(--danger)" }}>
          {error || "Couldn't load this profile."}
        </p>
      </Shell>
    );
  }

  return (
    <Shell title={profile.isMe ? "Your profile" : "Profile"} onBack={onBack}>
      <div className="profile">
        {profile.isMe ? (
          <AvatarPicker
            user={profile}
            size={96}
            onPick={savePhoto}
            onError={setError}
          />
        ) : (
          <Avatar user={profile} size={96} />
        )}

        <h2 className="profile-name">{profile.username}</h2>
        {profile.email && <p className="profile-email">{profile.email}</p>}

        {error && (
          <p className="profile-note" style={{ color: "var(--danger)" }}>
            {error}
          </p>
        )}

        <div className="stats">
          <Stat label="Followers" value={profile.followers} />
          <Stat label="Following" value={profile.following} />
        </div>

        {profile.isMe ? (
          <RenameForm
            username={profile.username}
            onSaved={(username) => {
              setProfile((p) => ({ ...p, username }));
              onProfileSaved({ username });
            }}
          />
        ) : (
          <FollowAction
            profile={profile}
            onFollowed={() => setProfile((p) => ({ ...p, outgoing: "pending" }))}
            onMessage={() => onOpenChat(profile)}
          />
        )}
      </div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* the panel frame, so the loading and error states look like the real thing */

function Shell({ title = "Profile", onBack, children }) {
  return (
    <section className="panel chat">
      <header className="chat-head">
        {onBack && (
          <button className="icon-btn is-plain" onClick={onBack} aria-label="Back">
            <BackIcon />
          </button>
        )}
        <h1 className="chat-head-name" style={{ fontSize: 17 }}>
          {title}
        </h1>
      </header>

      <div className="scroll-area" style={{ flex: 1, overflowY: "auto" }}>
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */

// Your own name, with a Save button that only wakes up once you've actually
// typed something different.
function RenameForm({ username, onSaved }) {
  const [draft, setDraft] = useState(username);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { text, bad }

  // if the name changes from somewhere else, follow along
  useEffect(() => {
    setDraft(username);
  }, [username]);

  const changed = draft.trim() !== username && draft.trim().length >= 3;

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await api.patch("/api/users/me", { username: draft.trim() });
      onSaved(res.data.username);
      setMessage({ text: "Saved", bad: false });
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Couldn't save that name.",
        bad: true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="profile-form" onSubmit={save}>
      <label className="profile-label" htmlFor="username">
        Display name
      </label>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          id="username"
          className="field"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          minLength={3}
          maxLength={20}
          required
        />
        <button
          className="btn btn-primary"
          type="submit"
          disabled={!changed || saving}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {message && (
        <p
          className="profile-note"
          style={{ color: message.bad ? "var(--danger)" : "var(--online)" }}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}

/* ------------------------------------------------------------------ */

// The one button at the bottom of someone else's profile. Which button you
// get depends on the follow request between you.
function FollowAction({ profile, onFollowed, onMessage }) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const follow = async () => {
    setSending(true);
    setError("");

    try {
      await api.post(`/api/follow/send/${profile._id}`);
      onFollowed();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't send that request.");
    } finally {
      setSending(false);
    }
  };

  // they've accepted you, so the conversation is unlocked
  if (profile.outgoing === "accepted") {
    return (
      <div className="profile-form">
        <button className="btn btn-primary btn-block" onClick={onMessage}>
          Message
        </button>
      </div>
    );
  }

  if (profile.outgoing === "pending") {
    return (
      <div className="profile-form">
        <button className="btn btn-ghost btn-block" disabled>
          Requested
        </button>
        <p className="profile-note">Waiting for {profile.username} to confirm.</p>
      </div>
    );
  }

  return (
    <div className="profile-form">
      <button
        className="btn btn-primary btn-block"
        onClick={follow}
        disabled={sending}
      >
        {sending ? "Sending…" : "Follow"}
      </button>

      {profile.incoming === "pending" && (
        <p className="profile-note">
          {profile.username} wants to follow you — confirm it from your
          notifications.
        </p>
      )}

      {error && (
        <p className="profile-note" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
