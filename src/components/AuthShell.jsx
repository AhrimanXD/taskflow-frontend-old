import { Box, Flex, Stack, Group, Title, Text } from "@mantine/core";

const FEATURES = [
  "Organize work into shared workspaces",
  "Assign tasks and track them together",
  "Stay in sync with real-time updates",
];

function LogoMark({ size = 40, radius = 12 }) {
  return (
    <Box
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        display: "grid",
        placeItems: "center",
        background: "rgba(255, 255, 255, 0.16)",
        backdropFilter: "blur(4px)",
      }}
    >
      <svg
        width={size * 0.5}
        height={size * 0.5}
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

function AuthShell({ title, subtitle, children }) {
  return (
    <Flex mih="100vh">
      {/* Brand panel — hidden on small screens */}
      <Box
        visibleFrom="md"
        p={48}
        style={{
          flex: 1,
          color: "white",
          background: [
            "radial-gradient(at 80% 0%, rgba(255,255,255,0.18) 0px, transparent 50%)",
            "radial-gradient(at 0% 100%, rgba(0,0,0,0.18) 0px, transparent 50%)",
            "var(--tf-auth-gradient)",
          ].join(", "),
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Group gap="sm">
          <LogoMark />
          <Text fw={800} fz="xl" style={{ letterSpacing: "-0.02em" }}>
            Taskflow
          </Text>
        </Group>

        <Stack gap="lg" maw={420}>
          <Title order={1} fz={36} lh={1.15}>
            Get your team on the same page.
          </Title>
          <Text opacity={0.85} fz="lg">
            Plan, assign, and track work together — and watch it update live.
          </Text>
          <Stack gap="sm" mt="md">
            {FEATURES.map((feature) => (
              <Group key={feature} gap="sm" wrap="nowrap">
                <Box
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    fontSize: 13,
                  }}
                >
                  ✓
                </Box>
                <Text opacity={0.9}>{feature}</Text>
              </Group>
            ))}
          </Stack>
        </Stack>

        <Text opacity={0.65} fz="sm">
          © {new Date().getFullYear()} TaskFlow
        </Text>
      </Box>

      {/* Form panel */}
      <Flex
        style={{ flex: 1 }}
        align="center"
        justify="center"
        p="xl"
        bg="var(--tf-page-bg)"
      >
        <Stack w="100%" maw={400} gap="xl">
          <Group gap="xs" hiddenFrom="md">
            <Box className="tf-brandmark" style={{ width: 32, height: 32, borderRadius: 9 }}>
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
            <Text fw={800} fz="lg" style={{ letterSpacing: "-0.02em" }}>
              Taskflow
            </Text>
          </Group>

          <Stack gap={4}>
            <Title order={2}>{title}</Title>
            {subtitle && (
              <Text c="dimmed" fz="sm">
                {subtitle}
              </Text>
            )}
          </Stack>

          {children}
        </Stack>
      </Flex>
    </Flex>
  );
}

export default AuthShell;
