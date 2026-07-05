import { useSyncExternalStore } from "react";

// Standalone light/dark scheme store (replaced Mantine's color-scheme
// management). The `.dark` class on <html> is what Tailwind's dark variant
// and the --tf-* token overrides key off.
const KEY = "taskflow:color-scheme";

const listeners = new Set();

function readStored() {
  const value =
    localStorage.getItem(KEY) ??
    // migrate the preference users saved while Mantine owned the toggle
    localStorage.getItem("mantine-color-scheme-value");
  return value === "dark" ? "dark" : "light";
}

let scheme = readStored();

function apply(value) {
  document.documentElement.classList.toggle("dark", value === "dark");
  document.documentElement.style.colorScheme = value;
}

apply(scheme);

export function setColorScheme(value) {
  scheme = value === "dark" ? "dark" : "light";
  localStorage.setItem(KEY, scheme);
  apply(scheme);
  listeners.forEach((notify) => notify());
}

export function useColorScheme() {
  return useSyncExternalStore(
    (notify) => {
      listeners.add(notify);
      return () => listeners.delete(notify);
    },
    () => scheme
  );
}
