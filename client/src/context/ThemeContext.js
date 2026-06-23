"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  // on first load, read saved preference (or fall back to system preference)
  useEffect(() => {
    const saved = localStorage.getItem("iychat-theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
    setMounted(true);
  }, []);

  // apply the theme to <html data-theme="..."> so CSS variables switch
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("iychat-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {/* hidden until mounted, so there's no flash of the wrong theme —
          but children always have access to ThemeContext, even during
          server-side rendering / static export */}
      <div style={{ visibility: mounted ? "visible" : "hidden" }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
