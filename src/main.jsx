import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider, createTheme } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@mantine/core/styles.css"; // This enables themes, resets, and vars
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

// Brand blue scale anchored on #2f6cf6 (Mantine uses index 6 as the filled shade).
const brand = [
  "#eef3ff",
  "#dce6ff",
  "#b6c9ff",
  "#8da9fc",
  "#5b8bff",
  "#3f78f8",
  "#2f6cf6",
  "#2459d9",
  "#1c49b4",
  "#163c93",
];

// Neutral slate dark scale so dark surfaces read like the reference (#171a1f).
const dark = [
  "#c9ccd1",
  "#a6abb3",
  "#7c828b",
  "#565c66",
  "#363b43",
  "#262b32",
  "#1f242b",
  "#171a1f",
  "#121519",
  "#0c0e11",
];

const theme = createTheme({
  primaryColor: "brand",
  primaryShade: { light: 6, dark: 5 },
  colors: { brand, dark },
  defaultRadius: "md",
  fontFamily:
    "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontFamilyMonospace: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
  headings: { fontWeight: "800" },
  cursorType: "pointer",
  components: {
    Title: {
      styles: { root: { letterSpacing: "-0.02em" } },
    },
    Card: {
      defaultProps: { radius: "lg" },
    },
    Paper: {
      defaultProps: { radius: "lg" },
    },
    Modal: {
      defaultProps: {
        radius: "lg",
        overlayProps: { backgroundOpacity: 0.5, blur: 3 },
      },
    },
    Badge: {
      styles: { root: { textTransform: "none", fontWeight: 600 } },
    },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30_000,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <ModalsProvider>
          <Notifications position="top-right" />
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>,
);
