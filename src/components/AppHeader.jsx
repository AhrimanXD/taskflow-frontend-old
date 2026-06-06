import {
  Box,
  Container,
  Group,
  Text,
  Menu,
  Avatar,
  UnstyledButton,
  Anchor,
  Badge,
} from "@mantine/core";
import { IconChevronDown, IconLogout } from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { useMyInvitations } from "../hooks/useInvitations";

const NAV = [
  { label: "Tasks", to: "/dashboard" },
  { label: "Workspaces", to: "/workspaces" },
  { label: "Invitations", to: "/invitations" },
];

function BrandMark() {
  return (
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
  );
}

function AppHeader() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const { data: pendingInvites = [] } = useMyInvitations("pending");
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
          <Group gap="xl">
            <Group gap="xs">
              <BrandMark />
              <Text fw={700} visibleFrom="xs">
                TaskFlow
              </Text>
            </Group>

            <Group gap="lg">
              {NAV.map((item) => {
                const active = pathname.startsWith(item.to);
                const showBadge =
                  item.to === "/invitations" && pendingInvites.length > 0;
                return (
                  <Anchor
                    key={item.to}
                    component={Link}
                    to={item.to}
                    underline="never"
                    c={active ? "indigo" : "dimmed"}
                    fw={active ? 600 : 500}
                    size="sm"
                  >
                    <Group gap={6} wrap="nowrap">
                      {item.label}
                      {showBadge && (
                        <Badge size="sm" circle variant="filled" color="indigo">
                          {pendingInvites.length}
                        </Badge>
                      )}
                    </Group>
                  </Anchor>
                );
              })}
            </Group>
          </Group>

          <Menu position="bottom-end" withinPortal width={200}>
            <Menu.Target>
              <UnstyledButton>
                <Group gap={6}>
                  <Avatar color="indigo" radius="xl" size={32}>
                    {initial}
                  </Avatar>
                  <Text size="sm" fw={500} visibleFrom="sm">
                    {user?.username}
                  </Text>
                  <IconChevronDown size={16} stroke={1.5} />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>{user?.email}</Menu.Label>
              <Menu.Item
                color="red"
                leftSection={<IconLogout size={16} />}
                onClick={logout}
              >
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
