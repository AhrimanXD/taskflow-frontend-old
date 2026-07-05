import { Toaster as Sonner } from "sonner";
import { useColorScheme } from "@/hooks/useColorScheme";

function Toaster(props) {
  const scheme = useColorScheme();

  return (
    <Sonner
      theme={scheme}
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
