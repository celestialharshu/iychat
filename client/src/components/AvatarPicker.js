"use client";

import { useRef, useState } from "react";
import Avatar from "./Avatar";
import { CameraIcon } from "./Icons";
import { resizeImage } from "@/lib/resizeImage";

// A big avatar with a camera button stuck to its corner. Clicking the button
// opens the file picker, shrinks whatever they chose, and hands the result
// back to the parent through onPick.
//
// This component doesn't save anything itself — it just produces the image
// string. The profile page and the welcome page each decide what to do with
// it, which keeps this piece reusable.
export default function AvatarPicker({ user, size = 96, onPick, onError }) {
  const fileInputRef = useRef(null);
  const [working, setWorking] = useState(false);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setWorking(true);

    try {
      const dataUrl = await resizeImage(file);
      onPick(dataUrl);
    } catch (err) {
      onError?.(err.message);
    } finally {
      setWorking(false);
      // reset the input so picking the same file twice still fires onChange
      event.target.value = "";
    }
  };

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <Avatar user={user} size={size} />

      <button
        type="button"
        className="camera-btn"
        onClick={() => fileInputRef.current?.click()}
        disabled={working}
        aria-label="Change profile photo"
        title="Change profile photo"
      >
        <CameraIcon size={16} />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: "none" }}
      />
    </div>
  );
}
