"use client";

import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import { useTheme } from "@/context/ThemeContext";
import { useIsMobile } from "@/lib/useIsMobile";
import { formatListTime } from "@/lib/time";
import {
  BellIcon,
  ComposeIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
} from "./Icons";

export default function ChatList({
  conversations,
  selectedUser,
  onSelectUser,
  onlineUserIds,
  currentUser,
  unreadCounts,
  unreadNotifications,
  onSearch,
  onOpenProfile,
  onBellClick,
}) {
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const latestQueryRef = useRef("");

  // wait 300ms after the last keystroke before hitting the server, and throw
  // away any response that comes back for a query the user has moved on from
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

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  // you can't message someone straight from search — you have to follow them
  // first. So clicking a result opens their profile in the main panel, where
  // the Follow button lives.
  const handleResultClick = (user) => {
    setQuery("");
    setResults([]);
    latestQueryRef.current = "";
    onOpenProfile(user._id);
  };

  const isSearching = query.trim().length > 0;

  return (
    <aside className="panel chat-list">
      <header className="list-head">
        {/* on a phone there's no icon rail, so your avatar sits here instead —
            and tapping it opens your profile, same as the rail button does */}
        {isMobile && (
          <button
            onClick={() => onOpenProfile(currentUser._id)}
            aria-label="Your profile"
          >
            <Avatar user={currentUser} size={36} />
          </button>
        )}

        <h1 className="list-title">Chats</h1>

        <div className="head-actions">
          {isMobile && (
            <>
              <button
                className="icon-btn"
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
              >
                {theme === "light" ? <MoonIcon size={18} /> : <SunIcon size={18} />}
              </button>

              <button
                className="icon-btn"
                onClick={onBellClick}
                aria-label="Notifications"
                style={{ position: "relative" }}
              >
                <BellIcon size={18} />
                {unreadNotifications > 0 && (
                  <span className="badge" style={{ top: -2, right: -2 }}>
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
              </button>
            </>
          )}

          <button
            className="icon-btn"
            onClick={() => inputRef.current?.focus()}
            aria-label="New message"
            title="New message"
          >
            <ComposeIcon />
          </button>
        </div>
      </header>

      <div className="search">
        <span className="search-icon">
          <SearchIcon />
        </span>
        <input
          ref={inputRef}
          className="search-input"
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search iychat"
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck="false"
        />
      </div>

      <div className="rows scroll-area">
        {isSearching ? (
          <SearchResults
            searching={searching}
            error={searchError}
            results={results}
            onlineUserIds={onlineUserIds}
            onPick={handleResultClick}
          />
        ) : (
          <Conversations
            conversations={conversations}
            selectedUser={selectedUser}
            onSelectUser={onSelectUser}
            onlineUserIds={onlineUserIds}
            unreadCounts={unreadCounts}
            currentUserId={currentUser?._id}
          />
        )}
      </div>
    </aside>
  );
}

/* ---------------------------------------------------------------- */

function Conversations({
  conversations,
  selectedUser,
  onSelectUser,
  onlineUserIds,
  unreadCounts,
  currentUserId,
}) {
  if (conversations.length === 0) {
    return (
      <div className="empty">
        <p className="empty-title">No chats</p>
        <p className="empty-text">
          Search a username above to start your first conversation.
        </p>
      </div>
    );
  }

  return conversations.map((chat) => {
    const unread = unreadCounts[chat._id] || 0;
    const isSelected = selectedUser?._id === chat._id;
    const sentByMe = chat.lastMessageSender === currentUserId;

    return (
      <button
        key={chat._id}
        onClick={() => onSelectUser(chat)}
        className={[
          "row",
          isSelected ? "is-active" : "",
          unread > 0 ? "is-unread" : "",
        ].join(" ")}
      >
        <Avatar
          user={chat}
          size={48}
          online={onlineUserIds.includes(chat._id)}
        />

        <div className="row-body">
          <div className="row-top">
            <span className="row-name">{chat.username}</span>
            <span className="row-time">{formatListTime(chat.lastMessageAt)}</span>
          </div>

          <div className="row-preview">
            {chat.lastMessageText
              ? `${sentByMe ? "You: " : ""}${chat.lastMessageText}`
              : "Say hi 👋"}
          </div>
        </div>

        {unread > 0 && <span className="unread-dot" />}
      </button>
    );
  });
}

/* ---------------------------------------------------------------- */

function SearchResults({ searching, error, results, onlineUserIds, onPick }) {
  if (searching) {
    return <p className="empty-text" style={{ padding: 16 }}>Searching…</p>;
  }

  if (error) {
    return (
      <p className="empty-text" style={{ padding: 16, color: "var(--danger)" }}>
        {error}
      </p>
    );
  }

  if (results.length === 0) {
    return (
      <p className="empty-text" style={{ padding: 16 }}>
        No one matches that username.
      </p>
    );
  }

  return results.map((user) => (
    <button key={user._id} className="row" onClick={() => onPick(user)}>
      <Avatar user={user} size={48} online={onlineUserIds.includes(user._id)} />
      <div className="row-body">
        <div className="row-name">{user.username}</div>
        <div className="row-preview">{user.email}</div>
      </div>
    </button>
  ));
}
