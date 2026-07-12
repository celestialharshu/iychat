"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

// The theme is actually applied by a tiny script in layout.js that runs before
// the page paints, so there's no white flash on load. All this provider does is
// read back what that script decided, and let you flip it.
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const applied = document.documentElement.getAttribute("data-theme");
    if (applied === "dark") setTheme("dark");
  }, []);

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("iychat-theme", next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
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
