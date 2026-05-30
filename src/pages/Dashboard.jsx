import { Container, Title, Button, Group, Text, Paper } from "@mantine/core";
import { useAuth } from "../context/auth-context";

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Dashboard</Title>
        <Button variant="light" color="red" onClick={logout}>
          Logout
        </Button>
      </Group>

      <Paper withBorder shadow="xs" p="lg" radius="md">
        <Text>
          Welcome, <strong>{user?.username}</strong>.
        </Text>
        <Text c="dimmed" size="sm" mt="xs">
          Tasks and workspaces will appear here.
        </Text>
      </Paper>
    </Container>
  );
}

export default Dashboard;
