import {
  Box,
  Container,
  Group,
  Text,
  Menu,
  Avatar,
  UnstyledButton,
} from "@mantine/core";
import { useAuth } from "../context/auth-context";

function AppHeader() {
  const { user, logout } = useAuth();
  const initial = user?.username?.[0]?.toUpperCase() ?? "?";

  return (
    <Box
      component="header"
      style={{
        background: "white",
        borderBottom: "1px solid var(--mantine-color-gray-3)",
      }}
    >
      <Container size="lg">
        <Group justify="space-between" h={60}>
          <Group gap="xs">
            <Box
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                display: "grid",
                placeItems: "center",
                background:
                  "linear-gradient(150deg, var(--mantine-color-indigo-6), var(--mantine-color-violet-7))",
                color: "white",
                fontWeight: 800,
              }}
            >
              T
            </Box>
            <Text fw={700}>TaskFlow</Text>
          </Group>

          <Menu position="bottom-end" withinPortal width={200}>
            <Menu.Target>
              <UnstyledButton>
                <Group gap="xs">
                  <Avatar color="indigo" radius="xl" size={32}>
                    {initial}
                  </Avatar>
                  <Text size="sm" fw={500} visibleFrom="xs">
                    {user?.username}
                  </Text>
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>{user?.email}</Menu.Label>
              <Menu.Item color="red" onClick={logout}>
                Log out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Container>
    </Box>
  );
}

export default AppHeader;
