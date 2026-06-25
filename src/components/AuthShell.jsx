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
    <Flex mih="100vh" style={{ background: "var(--tf-bg)" }}>
      {/* Brand panel — hidden on small screens */}
      <Box
        visibleFrom="md"
        p={64}
        style={{
          flex: 1.2,
          color: "white",
          background: [
            "radial-gradient(at 100% 0%, rgba(99, 102, 241, 0.2) 0px, transparent 50%)",
            "radial-gradient(at 0% 100%, rgba(47, 108, 246, 0.15) 0px, transparent 50%)",
            "var(--tf-auth-gradient)",
          ].join(", "),
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative subtle ambient lights */}
        <Box
          style={{
            position: "absolute",
            top: "-15%",
            right: "-15%",
            width: "50%",
            height: "50%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />
        <Box
          style={{
            position: "absolute",
            bottom: "-15%",
            left: "-15%",
            width: "50%",
            height: "50%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(47, 108, 246, 0.2) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        <Group gap="sm" style={{ zIndex: 2 }}>
          <LogoMark size={44} radius={14} />
          <Text fw={900} fz="22px" style={{ letterSpacing: "-0.03em" }}>
            Taskflow
          </Text>
        </Group>

        <Stack gap="xl" style={{ zIndex: 2 }}>
          <Stack gap="md" maw={480}>
            <Title order={1} fz={44} lh={1.1} style={{ letterSpacing: "-0.03em" }}>
              Get your team on the same page.
            </Title>
            <Text opacity={0.8} fz="lg" fw={500}>
              Plan, assign, and track work together — and watch it update live.
            </Text>
          </Stack>

          <Card
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 20,
              padding: 24,
            }}
            maw={480}
          >
            <Stack gap="md">
              {FEATURES.map((feature) => (
                <Group key={feature} gap="sm" wrap="nowrap">
                  <Box
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 8,
                      background: "rgba(255, 255, 255, 0.12)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      fontSize: 12,
                      fontWeight: 800,
                      color: "#fff",
                    }}
                  >
                    ✓
                  </Box>
                  <Text opacity={0.9} fw={600} fz="sm">
                    {feature}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Card>
        </Stack>

        <Text opacity={0.5} fz="xs" style={{ zIndex: 2 }}>
          © {new Date().getFullYear()} Taskflow. All rights reserved.
        </Text>
      </Box>

      {/* Form panel */}
      <Flex
        style={{
          flex: 1,
          background: "var(--tf-mesh-gradient)",
          position: "relative",
        }}
        align="center"
        justify="center"
        p="xl"
      >
        <Card
          withBorder
          padding={40}
          radius={24}
          shadow="lg"
          style={{
            width: "100%",
            maw: 460,
            background: "var(--tf-surface)",
            borderColor: "var(--tf-border)",
            boxShadow: "var(--tf-shadow-lg)",
          }}
        >
          <Stack w="100%" gap="xl">
            <Group gap="xs" hiddenFrom="md" justify="center">
              <Box className="tf-brandmark" style={{ width: 36, height: 36, borderRadius: 10 }}>
                <svg
                  width="20"
                  height="20"
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
              <Text fw={800} fz="xl" style={{ letterSpacing: "-0.02em" }}>
                Taskflow
              </Text>
            </Group>

            <Stack gap={6}>
              <Title order={2} fz={28} style={{ letterSpacing: "-0.02em" }}>
                {title}
              </Title>
              {subtitle && (
                <Text c="dimmed" fz="sm" fw={500}>
                  {subtitle}
                </Text>
              )}
            </Stack>

            {children}
          </Stack>
        </Card>
      </Flex>
    </Flex>
  );
}

export default AuthShell;
