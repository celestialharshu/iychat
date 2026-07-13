"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import AuthArt from "@/components/AuthArt";
import { LogoMark, MoonIcon, SunIcon } from "@/components/Icons";

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
      // brand new account, so send them through setup before the chats
      router.push("/welcome");
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't create that account.");
      setSubmitting(false);
    }
  };

  const ThemeIcon = theme === "light" ? MoonIcon : SunIcon;

  return (
    <div className="auth-two">
      <button
        className="icon-btn auth-toggle"
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
      >
        <ThemeIcon size={18} />
      </button>

      <div className="auth-form-side">
        <form className="auth-box" onSubmit={handleSubmit}>
          <span className="auth-brand-mark">
            <LogoMark size={24} />
          </span>

          <h1 className="auth-heading">Create your account</h1>
          <p className="auth-lead">
            You&apos;ll pick a photo and a display name next.
          </p>

          {error && <p className="auth-error">{error}</p>}

          <div className="field-group">
            <label className="field-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className="field"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              maxLength={20}
              autoComplete="username"
              required
            />
          </div>

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
              minLength={6}
              autoComplete="new-password"
              required
            />
          </div>

          <button
            className="btn btn-primary btn-block auth-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>

          <p className="auth-foot">
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </form>
      </div>

      <div className="auth-art-side">
        <AuthArt />
      </div>
    </div>
  );
}
