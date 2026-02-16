import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import "./index.css";
import "@mantine/core/styles.css"; // This enables themes, resets, and vars
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MantineProvider>
      <App />
    </MantineProvider>
  </StrictMode>,
);
