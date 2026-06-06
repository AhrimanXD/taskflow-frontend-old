import { Box, Container } from "@mantine/core";
import AppHeader from "./AppHeader";

function PageShell({ children, size = "lg" }) {
  return (
    <Box mih="100vh" bg="var(--mantine-color-gray-0)">
      <AppHeader />
      <Container size={size} py="xl">
        {children}
      </Container>
    </Box>
  );
}

export default PageShell;
