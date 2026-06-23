"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(username, email, password);
      router.push("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <button
        onClick={toggleTheme}
        style={styles.themeToggle}
        aria-label="Toggle dark mode"
        title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>

      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>iychat</h1>
        <p style={styles.subtitle}>Create an account</p>

        {error && <p style={styles.error}>{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          minLength={3}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          minLength={6}
          required
        />

        <button type="submit" disabled={submitting} style={styles.button}>
          {submitting ? "Creating account..." : "Sign up"}
        </button>

        <p style={styles.footerText}>
          Already have an account?{" "}
          <Link href="/login" style={styles.link}>
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg)",
    position: "relative",
  },
  themeToggle: {
    position: "absolute",
    top: "20px",
    right: "20px",
    fontSize: "14px",
    background: "var(--surface)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    padding: "8px 11px",
    borderRadius: "8px",
    lineHeight: 1,
  },
  form: {
    width: "100%",
    maxWidth: "360px",
    padding: "32px",
    border: "1px solid var(--border)",
    borderRadius: "14px",
    boxShadow: "var(--shadow-md)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    background: "var(--surface)",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "var(--text)",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "14px",
    color: "var(--text-muted)",
    textAlign: "center",
    marginBottom: "8px",
  },
  input: {
    padding: "12px",
    border: "1px solid var(--input-border)",
    background: "var(--input-bg)",
    color: "var(--text)",
    fontSize: "14px",
    outline: "none",
    borderRadius: "8px",
  },
  button: {
    padding: "12px",
    background: "var(--bubble-sent-bg)",
    color: "var(--bubble-sent-text)",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    marginTop: "8px",
    borderRadius: "8px",
  },
  error: {
    color: "var(--text)",
    background: "var(--bubble-received-bg)",
    border: "1px solid var(--border)",
    padding: "8px",
    fontSize: "13px",
    textAlign: "center",
    borderRadius: "8px",
  },
  footerText: {
    fontSize: "13px",
    textAlign: "center",
    color: "var(--text-muted)",
    marginTop: "8px",
  },
  link: {
    fontWeight: "700",
    textDecoration: "underline",
    color: "var(--text)",
  },
};
