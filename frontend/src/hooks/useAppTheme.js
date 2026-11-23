"use client";

import { useCallback, useEffect, useState } from "react";

const THEME_STORAGE_KEY = "watercontrol-ui-theme";

export default function useAppTheme() {
  const [theme, setTheme] = useState("Escuro");

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === "Claro" || savedTheme === "Escuro") setTheme(savedTheme);
    } catch {
      // Mantém o tema em memória quando o navegador bloqueia o armazenamento local.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "Claro" ? "Escuro" : "Claro";
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch {
        // A preferência continua ativa nesta sessão mesmo sem armazenamento local.
      }
      return nextTheme;
    });
  }, []);

  return { theme, toggleTheme };
}
