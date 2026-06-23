"use client";

export default function Sidebar({
  users,
  selectedUser,
  onSelectUser,
  onlineUserIds,
  currentUser,
  onLogout,
}) {
  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <h2 style={styles.logo}>iychat</h2>
        <button onClick={onLogout} style={styles.logoutBtn}>
          Log out
        </button>
      </div>

      <p style={styles.currentUserLabel}>
        Signed in as <strong>{currentUser?.username}</strong>
      </p>

      <div style={styles.userList}>
        {users.length === 0 && (
          <p style={styles.emptyText}>No other users yet</p>
        )}

        {users.map((u) => {
          const isOnline = onlineUserIds.includes(u._id);
          const isSelected = selectedUser?._id === u._id;

          return (
            <button
              key={u._id}
              onClick={() => onSelectUser(u)}
              style={{
                ...styles.userItem,
                background: isSelected ? "#000000" : "#ffffff",
                color: isSelected ? "#ffffff" : "#000000",
              }}
            >
              <span style={styles.userItemLeft}>
                <span
                  style={{
                    ...styles.statusDot,
                    background: isOnline ? "#00c853" : "#bdbdbd",
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
    borderRight: "1px solid #000000",
    display: "flex",
    flexDirection: "column",
    background: "#ffffff",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    borderBottom: "1px solid #000000",
  },
  logo: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#000000",
  },
  logoutBtn: {
    fontSize: "12px",
    background: "#ffffff",
    color: "#000000",
    border: "1px solid #000000",
    padding: "6px 10px",
  },
  currentUserLabel: {
    fontSize: "13px",
    padding: "10px 16px",
    borderBottom: "1px solid #000000",
    color: "#000000",
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
    borderBottom: "1px solid #000000",
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
    color: "#666666",
  },
};
