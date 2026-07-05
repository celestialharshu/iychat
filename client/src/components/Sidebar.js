"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useIsMobile } from "@/lib/useIsMobile";

export default function Sidebar({
  conversations,
  selectedUser,
  onSelectUser,
  onlineUserIds,
  currentUser,
  onLogout,
  onSearch,
  unreadCounts = {},
  notificationCount = 0,
  onBellClick,
  onProfileCardOpen,
}) {
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const debounceRef = useRef(null);
  const latestQueryRef = useRef("");

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setResults([]);
      setSearching(false);
      setSearchError(null);
      latestQueryRef.current = "";
      return;
    }

    setSearching(true);
    setSearchError(null);

    debounceRef.current = setTimeout(async () => {
      const trimmed = value.trim();
      latestQueryRef.current = trimmed;

      const { results: found, error } = await onSearch(trimmed);

      if (latestQueryRef.current === trimmed) {
        setResults(found);
        setSearchError(error);
        setSearching(false);
      }
    }, 300);
  };

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  // clicking a search result opens the profile card, not chat directly
  const handleResultClick = (u) => {
    setQuery("");
    setResults([]);
    latestQueryRef.current = "";
    onProfileCardOpen(u);
  };

  return (
    <div
      style={{
        ...styles.sidebar,
        width: isMobile ? "100%" : "280px",
        minWidth: isMobile ? "100%" : "280px",
      }}
    >
      <div style={styles.header}>
        <h2 style={styles.logo}>iychat</h2>
        <div style={styles.headerActions}>
          <button
            onClick={toggleTheme}
            style={styles.iconBtn}
            aria-label="Toggle dark mode"
            title={theme === "light" ? "Dark mode" : "Light mode"}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {/* notification bell with unread badge */}
          <button
            onClick={onBellClick}
            style={styles.iconBtn}
            aria-label="Notifications"
            title="Follow requests"
          >
            <span style={styles.bellWrap}>
              🔔
              {notificationCount > 0 && (
                <span style={styles.badge}>
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </span>
          </button>

          <button onClick={onLogout} style={styles.logoutBtn}>
            Log out
          </button>
        </div>
      </div>

      <p style={styles.currentUserLabel}>
        Signed in as <strong>{currentUser?.username}</strong>
      </p>

      <div style={styles.searchBox}>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search username…"
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck="false"
        />
      </div>

      {query.trim() && (
        <div style={styles.resultsList}>
          {searching && <p style={styles.emptyText}>Searching…</p>}

          {!searching && searchError && (
            <p style={styles.errorText}>{searchError}</p>
          )}

          {!searching && !searchError && results.length === 0 && (
            <p style={styles.emptyText}>No user found</p>
          )}

          {!searching &&
            !searchError &&
            results.map((u) => (
              <button
                key={u._id}
                onClick={() => handleResultClick(u)}
                style={styles.resultItem}
              >
                {u.username}
              </button>
            ))}
        </div>
      )}

      <div style={styles.userList}>
        {conversations.length === 0 && (
          <p style={styles.emptyText}>
            Search a username above to start a chat
          </p>
        )}

        {conversations.map((u) => {
          const isOnline = onlineUserIds.includes(u._id);
          const isSelected = selectedUser?._id === u._id;
          const unreadCount = unreadCounts[u._id] || 0;

          return (
            <button
              key={u._id}
              onClick={() => onSelectUser(u)}
              style={{
                ...styles.userItem,
                background: isSelected
                  ? "var(--bubble-sent-bg)"
                  : "var(--surface)",
                color: isSelected
                  ? "var(--bubble-sent-text)"
                  : "var(--text)",
              }}
            >
              <span style={styles.userItemLeft}>
                <span
                  style={{
                    ...styles.statusDot,
                    background: isOnline
                      ? "var(--accent-online)"
                      : "var(--accent-offline)",
                  }}
                />
                <span
                  style={{
                    fontWeight: unreadCount > 0 ? "700" : "400",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {u.username}
                </span>
              </span>

              {unreadCount > 0 && (
                <span
                  style={{
                    ...styles.unreadBadge,
                    background: isSelected
                      ? "var(--bubble-sent-text)"
                      : "var(--bubble-sent-bg)",
                    color: isSelected
                      ? "var(--bubble-sent-bg)"
                      : "var(--bubble-sent-text)",
                  }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "280px",
    minWidth: "280px",
    height: "100vh",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    background: "var(--surface)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    borderBottom: "1px solid var(--border)",
  },
  logo: {
    fontSize: "20px",
    fontWeight: "700",
    color: "var(--text)",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  iconBtn: {
    fontSize: "14px",
    background: "var(--surface)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    padding: "6px 8px",
    borderRadius: "8px",
    lineHeight: 1,
    cursor: "pointer",
    position: "relative",
  },
  bellWrap: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: "-8px",
    right: "-10px",
    background: "#e53e3e",
    color: "#fff",
    fontSize: "9px",
    fontWeight: "800",
    borderRadius: "10px",
    minWidth: "16px",
    height: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 3px",
  },
  logoutBtn: {
    fontSize: "12px",
    background: "var(--surface)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    padding: "6px 10px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  currentUserLabel: {
    fontSize: "13px",
    padding: "10px 16px",
    borderBottom: "1px solid var(--border)",
    color: "var(--text)",
  },
  searchBox: {
    padding: "12px 16px",
    borderBottom: "1px solid var(--border)",
  },
  searchInput: {
    width: "100%",
    padding: "10px",
    border: "1px solid var(--input-border)",
    background: "var(--input-bg)",
    color: "var(--text)",
    fontSize: "14px",
    outline: "none",
    borderRadius: "8px",
  },
  resultsList: {
    borderBottom: "1px solid var(--border)",
    maxHeight: "200px",
    overflowY: "auto",
  },
  resultItem: {
    width: "100%",
    textAlign: "left",
    padding: "12px 16px",
    border: "none",
    borderBottom: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
    fontSize: "14px",
    cursor: "pointer",
  },
  userList: {
    flex: 1,
    overflowY: "auto",
  },
  userItem: {
    width: "100%",
    textAlign: "left",
    padding: "14px 16px",
    border: "none",
    borderBottom: "1px solid var(--border)",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    cursor: "pointer",
  },
  userItemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    overflow: "hidden",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    display: "inline-block",
    flexShrink: 0,
  },
  unreadBadge: {
    minWidth: "20px",
    height: "20px",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 6px",
    flexShrink: 0,
  },
  emptyText: {
    padding: "16px",
    fontSize: "13px",
    color: "var(--text-muted)",
  },
  errorText: {
    padding: "16px",
    fontSize: "13px",
    color: "#d32f2f",
  },
};
