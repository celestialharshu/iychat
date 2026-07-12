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
  PersonIcon,
  SunIcon,
} from "./Icons";

// The narrow strip on the far left. Desktop only — on a phone these controls
// move into the chat list header instead, because 72px of icons on a 360px
// screen is a waste of space.
//
// `activeView` is whatever the big panel is currently showing, so the matching
// icon can light up.
export default function NavRail({
  currentUser,
  activeView,
  unreadNotifications,
  notificationsOpen,
  onChatsClick,
  onProfileClick,
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

  const onProfile = activeView === "profile";

  return (
    <nav className="rail">
      <div className="logo-mark">
        <LogoMark size={22} />
      </div>

      <button
        className={`rail-btn ${!onProfile ? "is-active" : ""}`}
        onClick={onChatsClick}
        title="Chats"
        aria-label="Chats"
      >
        <ChatIcon size={24} filled={!onProfile} />
      </button>

      <button
        className={`rail-btn ${onProfile ? "is-active" : ""}`}
        onClick={onProfileClick}
        title="Your profile"
        aria-label="Your profile"
      >
        <PersonIcon size={24} filled={onProfile} />
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
          <div className="account-menu">
            <div className="account-menu-head">
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {currentUser?.username}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {currentUser?.email}
              </div>
            </div>

            <button
              className="row"
              onClick={() => {
                setMenuOpen(false);
                onProfileClick();
              }}
              style={{ gap: 10, padding: 10 }}
            >
              <PersonIcon size={18} />
              <span style={{ fontSize: 14, fontWeight: 500 }}>View profile</span>
            </button>

            <button
              className="row"
              onClick={onLogout}
              style={{ gap: 10, padding: 10 }}
            >
              <LogoutIcon size={18} />
              <span style={{ fontSize: 14, fontWeight: 500 }}>Log out</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
