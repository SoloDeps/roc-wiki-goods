// Anti-FOUC - Assurance zero flash
(() => {
  const theme = localStorage.getItem("theme");
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  const finalTheme = !theme || theme === "system" ? systemTheme : theme;

  if (finalTheme === "dark") {
    document.documentElement.classList.add("dark");
  }
})();

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@/assets/style.css";
import { ThemeProvider } from "@/components/theme-provider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
