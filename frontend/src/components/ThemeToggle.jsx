import React from "react";
import { sound } from "../utils/audio";

export default function ThemeToggle({ theme, onToggleTheme }) {
  const isDark = theme === "dark";

  const handleToggle = () => {
    sound.playClick();
    onToggleTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      onClick={handleToggle}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle Theme"
    >
      <span className="toggle-icon">{isDark ? "🌙" : "☀️"}</span>
      <span className="toggle-label">{isDark ? "Dark Mode" : "Light Mode"}</span>
    </button>
  );
}
