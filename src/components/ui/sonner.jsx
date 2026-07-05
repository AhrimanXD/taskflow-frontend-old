import { useComputedColorScheme } from "@mantine/core";
import { Toaster as Sonner } from "sonner";

// Mantine still owns the color-scheme attribute; read it so toasts match.
// Swap to the standalone scheme mechanism once Mantine is removed.
function Toaster(props) {
  const computed = useComputedColorScheme("light");

  return (
    <Sonner
      theme={computed}
      position="top-right"
      richColors
      toastOptions={{
        style: {
          fontFamily: "var(--font-sans)",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
