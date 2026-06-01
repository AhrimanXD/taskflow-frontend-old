import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider, createTheme } from "@mantine/core";
import "./index.css";
import "@mantine/core/styles.css"; // This enables themes, resets, and vars
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

const theme = createTheme({
  primaryColor: "indigo",
  defaultRadius: "md",
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  headings: { fontWeight: "700" },
  cursorType: "pointer",
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>,
);
