import { Card, Group, Skeleton, Stack } from "@mantine/core";

function TaskSkeleton() {
  return (
    <Card withBorder radius="md" padding="md">
      <Stack gap={8}>
        <Skeleton height={14} width="70%" radius="sm" />
        <Skeleton height={10} radius="sm" />
        <Skeleton height={10} width="55%" radius="sm" />
        <Group justify="space-between" mt="sm">
          <Skeleton height={20} width={84} radius="xl" />
          <Skeleton height={10} width={48} radius="sm" />
        </Group>
      </Stack>
    </Card>
  );
}

export default TaskSkeleton;
