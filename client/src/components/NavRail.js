"use client";

import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import { useTheme } from "@/context/ThemeContext";
import {
  BellIcon,
  ChatIcon,
  LogoMark,
  LogoutIcon,
  MoonIcon,
  SunIcon,
} from "./Icons";

// The narrow strip on the far left. Desktop only — on a phone these controls
// move into the chat list header instead, because 72px of icons on a 360px
// screen is a waste of space.
export default function NavRail({
  currentUser,
  unreadNotifications,
  notificationsOpen,
  onBellClick,
  onLogout,
}) {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // close the account menu when you click anywhere else
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <nav className="rail">
      <div className="logo-mark">
        <LogoMark size={22} />
      </div>

      <button className="rail-btn is-active" title="Chats" aria-label="Chats">
        <ChatIcon size={24} filled />
      </button>

      <button
        className={`rail-btn ${notificationsOpen ? "is-active" : ""}`}
        onClick={onBellClick}
        title="Notifications"
        aria-label={`Notifications (${unreadNotifications} unread)`}
      >
        <BellIcon size={24} filled={notificationsOpen} />
        {unreadNotifications > 0 && (
          <span className="badge">
            {unreadNotifications > 9 ? "9+" : unreadNotifications}
          </span>
        )}
      </button>

      <div className="rail-spacer" />

      <button
        className="rail-btn"
        onClick={toggleTheme}
        title={theme === "light" ? "Dark mode" : "Light mode"}
        aria-label="Toggle dark mode"
      >
        {theme === "light" ? <MoonIcon /> : <SunIcon />}
      </button>

      <div ref={menuRef} style={{ position: "relative" }}>
        <button
          className="rail-btn"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Your account"
        >
          <Avatar user={currentUser} size={36} />
        </button>

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "calc(100% + 8px)",
              width: 200,
              padding: 8,
              background: "var(--panel)",
              borderRadius: 12,
              boxShadow: "var(--shadow-lg)",
              zIndex: 50,
            }}
          >
            <div style={{ padding: "8px 10px 10px" }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {currentUser?.username}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {currentUser?.email}
              </div>
            </div>

            <button
              className="row"
              onClick={onLogout}
              style={{ gap: 10, padding: "10px" }}
            >
              <LogoutIcon />
              <span style={{ fontSize: 14, fontWeight: 500 }}>Log out</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
