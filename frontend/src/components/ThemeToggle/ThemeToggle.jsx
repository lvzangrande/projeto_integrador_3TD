"use client";

import "./ThemeToggle.css";

export default function ThemeToggle({ theme, onToggle }) {
  const temaClaro = theme === "Claro";

  return (
    <button
      type="button"
      className="app-theme-toggle"
      onClick={onToggle}
      aria-label={`Modo ${temaClaro ? "claro" : "escuro"}`}
      aria-pressed={temaClaro}
      title={`Alternar para modo ${temaClaro ? "escuro" : "claro"}`}
    >
      {temaClaro ? (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.2 15.4A8.5 8.5 0 0 1 8.6 3.8 8.5 8.5 0 1 0 20.2 15.4Z" />
          <path d="M16 3v4M14 5h4" />
        </svg>
      )}
      <span>Modo {temaClaro ? "claro" : "escuro"}</span>
    </button>
  );
}
