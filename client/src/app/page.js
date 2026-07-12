"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BubbleMark } from "@/components/Icons";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/chat" : "/login");
  }, [user, loading, router]);

  return (
    <div className="auth">
      <div style={{ textAlign: "center" }}>
        <div className="auth-logo">
          <BubbleMark size={32} />
        </div>
        <p style={{ marginTop: 14, color: "var(--text-muted)", fontSize: 14 }}>
          Opening iychat…
        </p>
      </div>
    </div>
  );
}
