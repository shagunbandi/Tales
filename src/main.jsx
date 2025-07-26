import { initThemeMode } from "flowbite-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { ThemeConfig } from "flowbite-react";
import { ThemeInit } from "../.flowbite-react/init.js";
import App from "./App.jsx";
import "./index.css";

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeConfig dark={false} />
    <ThemeInit />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
initThemeMode();
