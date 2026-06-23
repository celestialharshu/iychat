"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
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
