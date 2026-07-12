"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import AvatarPicker from "@/components/AvatarPicker";

// The first thing you see after signing up. Pick a photo and the name you
// want people to see, or skip it and go straight to your chats.
//
// Nothing here is required — we already created the account on the register
// page. This screen just gives it a face.
export default function WelcomePage() {
  const { user, applyProfile } = useAuth();
  const router = useRouter();

  const [avatar, setAvatar] = useState("");
  const [name, setName] = useState(user?.username || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // the picker hands us the shrunk image, we just hold onto it until they
  // press Continue — that way nothing is saved if they change their mind
  const preview = { username: name || user?.username, avatar };

  const finish = async () => {
    setSaving(true);
    setError("");

    // only send the fields they actually touched
    const changes = {};
    if (avatar) changes.avatar = avatar;
    if (name.trim() && name.trim() !== user?.username) {
      changes.username = name.trim();
    }

    if (Object.keys(changes).length === 0) {
      router.push("/chat");
      return;
    }

    try {
      const res = await api.patch("/api/users/me", changes);
      applyProfile(res.data);
      router.push("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save that. Try again.");
      setSaving(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <h1 className="auth-title">Welcome to iychat</h1>
        <p className="auth-sub">Add a photo and pick the name people will see.</p>

        <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 20px" }}>
          <AvatarPicker
            user={preview}
            size={96}
            onPick={setAvatar}
            onError={setError}
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <input
          className="field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Display name"
          minLength={3}
          maxLength={20}
        />

        <button
          className="btn btn-primary btn-block"
          onClick={finish}
          disabled={saving}
          style={{ height: 46, marginTop: 6 }}
        >
          {saving ? "Saving…" : "Continue"}
        </button>

        <button
          className="btn btn-ghost btn-block"
          onClick={() => router.push("/chat")}
          disabled={saving}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
