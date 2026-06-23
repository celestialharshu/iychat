"use client";

import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function Sidebar({
  conversations,
  selectedUser,
  onSelectUser,
  onlineUserIds,
  currentUser,
  onLogout,
  onSearch,
}) {
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    const found = await onSearch(value.trim());
    setResults(found);
    setSearching(false);
  };

  const handlePick = (u) => {
    onSelectUser(u);
    setQuery("");
    setResults([]);
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <h2 style={styles.logo}>iychat</h2>
        <div style={styles.headerActions}>
          <button
            onClick={toggleTheme}
            style={styles.themeBtn}
            aria-label="Toggle dark mode"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? "🌙" : "☀️"}
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
          placeholder="Search username..."
          style={styles.searchInput}
        />
      </div>

      {/* search results dropdown — only shows while typing */}
      {query.trim() && (
        <div style={styles.resultsList}>
          {searching && <p style={styles.emptyText}>Searching...</p>}

          {!searching && results.length === 0 && (
            <p style={styles.emptyText}>No user found</p>
          )}

          {!searching &&
            results.map((u) => (
              <button
                key={u._id}
                onClick={() => handlePick(u)}
                style={styles.resultItem}
              >
                {u.username}
              </button>
            ))}
        </div>
      )}

      {/* conversations you've already opened, so they don't disappear after searching */}
      <div style={styles.userList}>
        {conversations.length === 0 && (
          <p style={styles.emptyText}>
            Search a username above to start a chat
          </p>
        )}

        {conversations.map((u) => {
          const isOnline = onlineUserIds.includes(u._id);
          const isSelected = selectedUser?._id === u._id;

          return (
            <button
              key={u._id}
              onClick={() => onSelectUser(u)}
              style={{
                ...styles.userItem,
                background: isSelected ? "var(--bubble-sent-bg)" : "var(--surface)",
                color: isSelected ? "var(--bubble-sent-text)" : "var(--text)",
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
                {u.username}
              </span>
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
    gap: "8px",
  },
  themeBtn: {
    fontSize: "14px",
    background: "var(--surface)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    padding: "6px 9px",
    borderRadius: "8px",
    lineHeight: 1,
  },
  logoutBtn: {
    fontSize: "12px",
    background: "var(--surface)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    padding: "6px 10px",
    borderRadius: "8px",
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
  },
  userItemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    display: "inline-block",
  },
  emptyText: {
    padding: "16px",
    fontSize: "13px",
    color: "var(--text-muted)",
  },
};
