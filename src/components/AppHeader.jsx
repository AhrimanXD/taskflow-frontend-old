import { useState } from "react";
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
  Button,
  useMantineColorScheme,
  useComputedColorScheme,
} from "@mantine/core";
import {
  IconChevronDown,
  IconLogout,
  IconMoon,
  IconSun,
  IconSparkles,
} from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { useMyInvitations } from "../hooks/useInvitations";
import FeaturePreviewDrawer from "./FeaturePreviewDrawer";

const NAV = [
  { label: "Tasks", to: "/dashboard" },
  { label: "Workspaces", to: "/workspaces" },
  { label: "Invitations", to: "/invitations" },
];

function BrandMark() {
  return (
    <Box className="tf-brandmark" style={{ width: 30, height: 30, borderRadius: 9 }}>
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
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
  const [previewOpened, setPreviewOpened] = useState(false);
  const initial = user?.username?.[0]?.toUpperCase() ?? "?";

  return (
    <Box component="header" className="tf-header">
      <Container size="lg">
        <Group justify="space-between" h={60}>
          <Group gap="xl">
            <Group gap={10}>
              <BrandMark />
              <Box visibleFrom="xs" style={{ lineHeight: 1.1 }}>
                <Text fw={800} fz={18} style={{ letterSpacing: "-0.02em" }}>
                  Taskflow
                </Text>
                <Text className="tf-mono" fz={10} c="dimmed">
                  realtime · collaborative
                </Text>
              </Box>
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
                    c={active ? "brand" : "dimmed"}
                    fw={active ? 700 : 600}
                    size="sm"
                  >
                    <Group gap={6} wrap="nowrap">
                      {item.label}
                      {showBadge && (
                        <Badge size="sm" circle variant="filled" color="brand">
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
            <Button
              size="xs"
              variant="gradient"
              gradient={{ from: "#f59e0b", to: "#d97706" }}
              leftSection={<IconSparkles size={14} />}
              onClick={() => setPreviewOpened(true)}
              style={{ borderRadius: 10, fontWeight: 700 }}
            >
              Beta Features
            </Button>

            <ColorSchemeToggle />

            <Menu position="bottom-end" withinPortal width={200}>
              <Menu.Target>
                <UnstyledButton>
                  <Group gap={6}>
                    <Avatar
                      variant="gradient"
                      gradient={{ from: "#2f6cf6", to: "#5b8bff", deg: 135 }}
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
      <FeaturePreviewDrawer opened={previewOpened} onClose={() => setPreviewOpened(false)} />
    </Box>
  );
}
export default AppHeader;
