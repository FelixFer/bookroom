"use client";

import { useTheme } from "../ThemeContext";

export const DarkModeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      className="room-darkmode-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
};
