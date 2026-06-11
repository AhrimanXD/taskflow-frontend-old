import { Center, Stack, Title, Text, Button } from "@mantine/core";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <Center h="100vh" bg="var(--tf-page-bg)">
      <Stack align="center" gap="xs">
        <Text fw={800} fz={64} c="indigo" lh={1}>
          404
        </Text>
        <Title order={3}>Page not found</Title>
        <Text c="dimmed" size="sm" ta="center" maw={340}>
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </Text>
        <Button component={Link} to="/dashboard" mt="sm">
          Back to dashboard
        </Button>
      </Stack>
    </Center>
  );
}

export default NotFound;
