"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      router.push("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>iychat</h1>
        <p style={styles.subtitle}>Log in to start chatting</p>

        {error && <p style={styles.error}>{error}</p>}

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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />

        <button type="submit" disabled={submitting} style={styles.button}>
          {submitting ? "Logging in..." : "Log in"}
        </button>

        <p style={styles.footerText}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={styles.link}>
            Sign up
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
    background: "#ffffff",
  },
  form: {
    width: "100%",
    maxWidth: "360px",
    padding: "32px",
    border: "1px solid #000000",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "14px",
    color: "#000000",
    textAlign: "center",
    marginBottom: "8px",
  },
  input: {
    padding: "12px",
    border: "1px solid #000000",
    background: "#ffffff",
    color: "#000000",
    fontSize: "14px",
    outline: "none",
  },
  button: {
    padding: "12px",
    background: "#000000",
    color: "#ffffff",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    marginTop: "8px",
  },
  error: {
    color: "#000000",
    background: "#f0f0f0",
    border: "1px solid #000000",
    padding: "8px",
    fontSize: "13px",
    textAlign: "center",
  },
  footerText: {
    fontSize: "13px",
    textAlign: "center",
    color: "#000000",
    marginTop: "8px",
  },
  link: {
    fontWeight: "700",
    textDecoration: "underline",
  },
};
