import { Box, Container } from "@mantine/core";
import AppHeader from "./AppHeader";

function PageShell({ children, size = "lg" }) {
  return (
    <Box mih="100vh" bg="var(--tf-page-bg)">
      <AppHeader />
      <Container size={size} py="xl" className="tf-page">
        {children}
      </Container>
    </Box>
  );
}

export default PageShell;
