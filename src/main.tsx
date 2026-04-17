// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css"; // Donde vive Tailwind 4

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);