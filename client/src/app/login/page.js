"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { LogoMark, MoonIcon, SunIcon } from "@/components/Icons";

export default function LoginPage() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
      setError(err.response?.data?.message || "That email and password don't match.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth">
      <button
        className="icon-btn"
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        style={{ position: "absolute", top: 20, right: 20 }}
      >
        {theme === "light" ? <MoonIcon size={18} /> : <SunIcon size={18} />}
      </button>

      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-logo">
          <LogoMark size={30} />
        </div>

        <h1 className="auth-title">Log in to iychat</h1>
        <p className="auth-sub">Pick up right where you left off.</p>

        {error && <p className="auth-error">{error}</p>}

        <input
          className="field"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <input
          className="field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        <button
          className="btn btn-primary btn-block"
          type="submit"
          disabled={submitting}
          style={{ height: 46, marginTop: 6 }}
        >
          {submitting ? "Logging in…" : "Log in"}
        </button>

        <p className="auth-foot">
          New here? <Link href="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
