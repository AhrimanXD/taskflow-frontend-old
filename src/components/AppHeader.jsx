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
  ActionIcon,
  Tooltip,
  useMantineColorScheme,
  useComputedColorScheme,
} from "@mantine/core";
import {
  IconChevronDown,
  IconLogout,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";
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
        borderRadius: 9,
        display: "grid",
        placeItems: "center",
        background: "var(--tf-brand-gradient)",
        color: "white",
        fontWeight: 800,
        boxShadow: "0 2px 8px rgba(76, 110, 245, 0.35)",
      }}
    >
      T
    </Box>
  );
}

function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme("light");
  const dark = computed === "dark";

  return (
    <Tooltip label={dark ? "Light mode" : "Dark mode"}>
      <ActionIcon
        variant="default"
        size="lg"
        radius="md"
        aria-label="Toggle color scheme"
        onClick={() => setColorScheme(dark ? "light" : "dark")}
      >
        {dark ? <IconSun size={18} /> : <IconMoon size={18} />}
      </ActionIcon>
    </Tooltip>
  );
}

function AppHeader() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const { data: pendingInvites = [] } = useMyInvitations("pending");
  const initial = user?.username?.[0]?.toUpperCase() ?? "?";

  return (
    <Box component="header" className="tf-header">
      <Container size="lg">
        <Group justify="space-between" h={60}>
          <Group gap="xl">
            <Group gap="xs">
              <BrandMark />
              <Text fw={700} visibleFrom="xs" style={{ letterSpacing: "-0.02em" }}>
                TaskFlow
              </Text>
            </Group>

            <Group gap={4}>
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
                    className="tf-nav-link"
                    data-active={active || undefined}
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

          <Group gap="sm">
            <ColorSchemeToggle />

            <Menu position="bottom-end" withinPortal width={200}>
              <Menu.Target>
                <UnstyledButton>
                  <Group gap={6}>
                    <Avatar
                      variant="gradient"
                      gradient={{ from: "indigo", to: "violet", deg: 150 }}
                      radius="xl"
                      size={32}
                    >
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
        </Group>
      </Container>
    </Box>
  );
}

export default AppHeader;
