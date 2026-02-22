"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  const applyThemeToDocument = (nextTheme: Theme) => {
    document.documentElement.setAttribute("data-theme", nextTheme);
    document.documentElement.setAttribute("data-bs-theme", nextTheme);
  };

  // Initialize theme on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

    const initialTheme = stored || systemTheme;
    setTheme(initialTheme);
    applyThemeToDocument(initialTheme);
    setMounted(true);
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      applyThemeToDocument(newTheme);
      return newTheme;
    });
  };

  // Set theme explicitly
  const setThemeExplicit = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyThemeToDocument(newTheme);
  };

  return {
    theme,
    toggleTheme,
    setTheme: setThemeExplicit,
    isDark: theme === "dark",
    mounted,
  };
}
