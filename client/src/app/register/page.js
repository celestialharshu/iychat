"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
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
      router.push("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't create that account.");
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

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">It takes about ten seconds.</p>

        {error && <p className="auth-error">{error}</p>}

        <input
          className="field"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          minLength={3}
          maxLength={20}
          autoComplete="username"
          required
        />

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
          placeholder="Password (at least 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          autoComplete="new-password"
          required
        />

        <button
          className="btn btn-primary btn-block"
          type="submit"
          disabled={submitting}
          style={{ height: 46, marginTop: 6 }}
        >
          {submitting ? "Creating account…" : "Sign up"}
        </button>

        <p className="auth-foot">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
