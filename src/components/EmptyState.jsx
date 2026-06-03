import { Paper, Stack, ThemeIcon, Title, Text } from "@mantine/core";

function EmptyState({ icon, title, description, action }) {
  return (
    <Paper withBorder radius="md" p="xl">
      <Stack align="center" gap="xs" py={48}>
        {icon && (
          <ThemeIcon
            variant="light"
            color="indigo"
            size={56}
            radius="xl"
            mb="xs"
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
