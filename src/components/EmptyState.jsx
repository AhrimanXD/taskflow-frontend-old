import { Paper, Stack, ThemeIcon, Title, Text } from "@mantine/core";

function EmptyState({ icon, title, description, action }) {
  return (
    <Paper
      withBorder
      p="xl"
      style={{ borderStyle: "dashed", background: "transparent" }}
    >
      <Stack align="center" gap="xs" py={48}>
        {icon && (
          <ThemeIcon
            variant="gradient"
            gradient={{ from: "indigo", to: "violet", deg: 150 }}
            size={56}
            radius="xl"
            mb="xs"
            style={{ boxShadow: "0 8px 24px rgba(76, 110, 245, 0.35)" }}
          >
            {icon}
          </ThemeIcon>
        )}
        <Title order={4}>{title}</Title>
        {description && (
          <Text c="dimmed" size="sm" ta="center" maw={360}>
            {description}
          </Text>
        )}
        {action}
      </Stack>
    </Paper>
  );
}

export default EmptyState;
