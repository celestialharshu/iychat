"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import AuthArt from "@/components/AuthArt";
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
      setError(
        err.response?.data?.message || "That email and password don't match."
      );
      setSubmitting(false);
    }
  };

  const ThemeIcon = theme === "light" ? MoonIcon : SunIcon;

  return (
    <div className="auth-page">
      <header className="auth-topbar">
        <div className="auth-brand">
          <span className="auth-brand-mark">
            <LogoMark size={19} />
          </span>
          <span className="auth-brand-name">iychat</span>
        </div>

        <button
          className="icon-btn"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
        >
          <ThemeIcon size={18} />
        </button>
      </header>

      <main className="auth-body">
        <div className="auth-form-col">
          <form onSubmit={handleSubmit}>
            <h1 className="auth-heading">Sign in</h1>
            <p className="auth-lead">
              Welcome back. Your chats are where you left them.
            </p>

            {error && <p className="auth-error">{error}</p>}

            <div className="field-group">
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="field"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              className="btn btn-primary btn-block auth-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>

            <p className="auth-foot">
              Don&apos;t have an account? <Link href="/register">Create one</Link>
            </p>
          </form>
        </div>

        <AuthArt />
      </main>
    </div>
  );
}
