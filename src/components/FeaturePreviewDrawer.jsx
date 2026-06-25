import { useState } from "react";
import {
  Drawer,
  Tabs,
  Badge,
  Text,
  Title,
  Group,
  Stack,
  Avatar,
  Button,
  Select,
  TextInput,
  Progress,
  ActionIcon,
  Timeline,
  Card,
  Tooltip,
  Menu,
  ThemeIcon,
  Divider,
  Box,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconArrowUpRight,
  IconMessage,
  IconUsers,
  IconChartBar,
  IconSend,
  IconUserMinus,
  IconChevronDown,
  IconDots,
  IconAlertCircle,
  IconActivity,
  IconCheck,
} from "@tabler/icons-react";

export default function FeaturePreviewDrawer({ opened, onClose }) {
  const [activeTab, setActiveTab] = useState("dashboard");

  // --- Task Priority Tab State ---
  const [priorityTasks, setPriorityTasks] = useState([
    { id: 1, title: "Database migration script", priority: "High", status: "ongoing" },
    { id: 2, title: "Redesign landing page layout", priority: "Medium", status: "pending" },
    { id: 3, title: "Draft product release notes", priority: "Low", status: "completed" },
  ]);
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [prioritySort, setPrioritySort] = useState("priority-high");

  // --- Live Comments Tab State ---
  const [selectedTaskId, setSelectedTaskId] = useState(1);
  const [comments, setComments] = useState({
    1: [
      { id: 1, author: "Sarah Connor", text: "Are we on track with the PostgreSQL migrations?", time: "10m ago" },
      { id: 2, author: "You", text: "Yes, currently testing the Alembic upgrade scripts.", time: "5m ago" },
    ],
    2: [
      { id: 1, author: "John Doe", text: "I put together the initial wireframe specs. What do you think?", time: "2h ago" },
    ],
    3: [],
  });
  const [commentInput, setCommentInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // --- Member Management Tab State ---
  const [members, setMembers] = useState([
    { id: 1, name: "AhrimanXD", role: "owner" },
    { id: 2, name: "Sarah Connor", role: "admin" },
    { id: 3, name: "John Doe", role: "member" },
  ]);

  // Handle Comment Submission
  const handleSendComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment = {
      id: Date.now(),
      author: "You",
      text: commentInput.trim(),
      time: "Just now",
    };

    setComments((prev) => ({
      ...prev,
      [selectedTaskId]: [...(prev[selectedTaskId] || []), newComment],
    }));
    setCommentInput("");

    // Simulate real-time websocket reply after 1.5 seconds
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply = {
        id: Date.now() + 1,
        author: "Sarah Connor",
        text: "Awesome work! Let me know if you run into any schema lock issues. ⚡",
        time: "Just now",
      };
      setComments((prev) => ({
        ...prev,
        [selectedTaskId]: [...(prev[selectedTaskId] || []), reply],
      }));
      notifications.show({
        title: "New Live Comment",
        message: "Sarah Connor commented on your task",
        color: "brand",
        icon: <IconMessage size={16} />,
      });
    }, 1500);
  };

  // Handle member role change
  const handleRoleChange = (memberId, newRole) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    const memberName = members.find((m) => m.id === memberId)?.name;
    notifications.show({
      title: "Role Updated",
      message: `${memberName}'s role was updated to ${newRole}`,
      color: "teal",
    });
  };

  // Handle member removal
  const handleRemoveMember = (memberId) => {
    const memberName = members.find((m) => m.id === memberId)?.name;
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    notifications.show({
      title: "Member Removed",
      message: `${memberName} has been removed from the workspace.`,
      color: "red",
      icon: <IconUserMinus size={16} />,
    });
  };

  // Sort and filter priority tasks
  const processedTasks = [...priorityTasks]
    .filter((t) => priorityFilter === "All" || t.priority === priorityFilter)
    .sort((a, b) => {
      if (prioritySort === "priority-high") {
        const order = { High: 3, Medium: 2, Low: 1 };
        return order[b.priority] - order[a.priority];
      }
      if (prioritySort === "priority-low") {
        const order = { High: 1, Medium: 2, Low: 3 };
        return order[b.priority] - order[a.priority];
      }
      return a.title.localeCompare(b.title);
    });

  const getPriorityColor = (p) => {
    if (p === "High") return { text: "var(--tf-priority-high-text)", bg: "var(--tf-priority-high-bg)" };
    if (p === "Medium") return { text: "var(--tf-priority-medium-text)", bg: "var(--tf-priority-medium-bg)" };
    return { text: "var(--tf-priority-low-text)", bg: "var(--tf-priority-low-bg)" };
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      title={
        <Group gap="xs">
          <Title order={3} style={{ letterSpacing: "-0.02em" }}>Next-Gen Features Preview</Title>
          <span className="tf-future-badge">Exploratory</span>
        </Group>
      }
      styles={{
        header: {
          borderBottom: "1px solid var(--tf-border)",
          paddingBottom: 15,
        },
      }}
    >
      <Stack gap="md" h="100%">
        <Card withBorder variant="light" bg="var(--tf-primary-soft)" radius="md" p="md">
          <Group gap="xs" wrap="nowrap" align="flex-start">
            <IconAlertCircle size={20} color="var(--tf-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
            <Text size="xs" c="var(--tf-text-2)">
              These features are planned and represent the future design direction of Taskflow. 
              Enjoy this fully interactive demo simulating live real-time feedback!
            </Text>
          </Group>
        </Card>

        <Tabs value={activeTab} onChange={setActiveTab} variant="outline" radius="md">
          <Tabs.List style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
            <Tabs.Tab value="dashboard" style={{ padding: "8px 0" }}>
              <Stack gap={2} align="center">
                <IconChartBar size={18} />
                <Text size="10px" fw={600}>Stats</Text>
              </Stack>
            </Tabs.Tab>
            <Tabs.Tab value="priority" style={{ padding: "8px 0" }}>
              <Stack gap={2} align="center">
                <IconArrowUpRight size={18} />
                <Text size="10px" fw={600}>Priority</Text>
              </Stack>
            </Tabs.Tab>
            <Tabs.Tab value="comments" style={{ padding: "8px 0" }}>
              <Stack gap={2} align="center">
                <IconMessage size={18} />
                <Text size="10px" fw={600}>Comments</Text>
              </Stack>
            </Tabs.Tab>
            <Tabs.Tab value="members" style={{ padding: "8px 0" }}>
              <Stack gap={2} align="center">
                <IconUsers size={18} />
                <Text size="10px" fw={600}>Members</Text>
              </Stack>
            </Tabs.Tab>
          </Tabs.List>

          {/* ===================== DASHBOARD & WORKLOADS ===================== */}
          <Tabs.Panel value="dashboard" pt="md">
            <Stack gap="lg">
              <Stack gap="xs">
                <Title order={5}>Workspace Task Distribution</Title>
                <Progress.Root size="xl">
                  <Tooltip label="Pending: 40%">
                    <Progress.Section value={40} color="yellow">
                      <Progress.Label>40%</Progress.Label>
                    </Progress.Section>
                  </Tooltip>
                  <Tooltip label="Ongoing: 35%">
                    <Progress.Section value={35} color="blue">
                      <Progress.Label>35%</Progress.Label>
                    </Progress.Section>
                  </Tooltip>
                  <Tooltip label="Completed: 25%">
                    <Progress.Section value={25} color="green">
                      <Progress.Label>25%</Progress.Label>
                    </Progress.Section>
                  </Tooltip>
                </Progress.Root>
                <Group gap="xs" justify="center">
                  <Badge variant="dot" color="yellow" size="xs">Pending</Badge>
                  <Badge variant="dot" color="blue" size="xs">Ongoing</Badge>
                  <Badge variant="dot" color="green" size="xs">Completed</Badge>
                </Group>
              </Stack>

              <Divider />

              <Stack gap="xs">
                <Title order={5}>Member Workload</Title>
                <Stack gap="sm">
                  <div>
                    <Group justify="space-between" mb={4}>
                      <Group gap="xs">
                        <Avatar size="xs" radius="xl" color="brand">A</Avatar>
                        <Text size="xs" fw={600}>You (AhrimanXD)</Text>
                      </Group>
                      <Text size="xs" c="dimmed">3 Tasks (1 ongoing, 2 pending)</Text>
                    </Group>
                    <Progress value={33} color="blue" size="sm" radius="xl" />
                  </div>

                  <div>
                    <Group justify="space-between" mb={4}>
                      <Group gap="xs">
                        <Avatar size="xs" radius="xl" color="teal">S</Avatar>
                        <Text size="xs" fw={600}>Sarah Connor</Text>
                      </Group>
                      <Text size="xs" c="dimmed">5 Tasks (2 ongoing, 1 completed)</Text>
                    </Group>
                    <Progress value={60} color="indigo" size="sm" radius="xl" />
                  </div>

                  <div>
                    <Group justify="space-between" mb={4}>
                      <Group gap="xs">
                        <Avatar size="xs" radius="xl" color="violet">J</Avatar>
                        <Text size="xs" fw={600}>John Doe</Text>
                      </Group>
                      <Text size="xs" c="dimmed">2 Tasks (1 completed)</Text>
                    </Group>
                    <Progress value={100} color="green" size="sm" radius="xl" />
                  </div>
                </Stack>
              </Stack>

              <Divider />

              <Stack gap="xs">
                <Title order={5}>Recent Activity</Title>
                <Timeline active={1} bulletSize={22} lineWidth={2}>
                  <Timeline.Item bullet={<IconCheck size={12} />} title="Task Completed">
                    <Text c="dimmed" size="xs">John Doe completed <Text span fw={700}>Setup PostgreSQL migration</Text></Text>
                    <Text size="10px" mt={4}>1 hour ago</Text>
                  </Timeline.Item>

                  <Timeline.Item bullet={<IconActivity size={12} />} title="Status Changed">
                    <Text c="dimmed" size="xs">Sarah Connor moved <Text span fw={700}>Refactor auth routes</Text> to Ongoing</Text>
                    <Text size="10px" mt={4}>2 hours ago</Text>
                  </Timeline.Item>

                  <Timeline.Item bullet={<IconMessage size={12} />} title="Comment Posted">
                    <Text c="dimmed" size="xs">Sarah Connor commented on <Text span fw={700}>Database migration script</Text></Text>
                    <Text size="10px" mt={4}>4 hours ago</Text>
                  </Timeline.Item>
                </Timeline>
              </Stack>
            </Stack>
          </Tabs.Panel>

          {/* ===================== TASK PRIORITY ===================== */}
          <Tabs.Panel value="priority" pt="md">
            <Stack gap="md">
              <Group justify="space-between" gap="xs">
                <Select
                  label="Filter"
                  w={120}
                  size="xs"
                  value={priorityFilter}
                  onChange={(val) => setPriorityFilter(val || "All")}
                  data={["All", "High", "Medium", "Low"]}
                  allowDeselect={false}
                />
                <Select
                  label="Sort"
                  w={160}
                  size="xs"
                  value={prioritySort}
                  onChange={(val) => setSortOption(val)}
                  data={[
                    { value: "priority-high", label: "Priority (High → Low)" },
                    { value: "priority-low", label: "Priority (Low → High)" },
                    { value: "name", label: "Name A-Z" },
                  ]}
                  allowDeselect={false}
                />
              </Group>

              <Stack gap="xs">
                {processedTasks.map((task) => {
                  const pColors = getPriorityColor(task.priority);
                  return (
                    <Card key={task.id} withBorder p="sm" radius="md">
                      <Group justify="space-between" wrap="nowrap">
                        <Stack gap={2} style={{ flex: 1 }}>
                          <Text size="sm" fw={700}>{task.title}</Text>
                          <Text size="xs" c="dimmed" tt="capitalize">Status: {task.status}</Text>
                        </Stack>
                        <Menu position="bottom-end">
                          <Menu.Target>
                            <Button
                              size="compact-xs"
                              variant="light"
                              styles={{
                                root: {
                                  background: pColors.bg,
                                  color: pColors.text,
                                  fontWeight: 700,
                                },
                              }}
                              rightSection={<IconChevronDown size={10} />}
                            >
                              {task.priority}
                            </Button>
                          </Menu.Target>
                          <Menu.Dropdown>
                            {["High", "Medium", "Low"].map((p) => (
                              <Menu.Item
                                key={p}
                                onClick={() => {
                                  setPriorityTasks((tasks) =>
                                    tasks.map((t) => (t.id === task.id ? { ...t, priority: p } : t))
                                  );
                                  notifications.show({
                                    title: "Priority Updated",
                                    message: `Task priority changed to ${p}`,
                                    color: "indigo",
                                  });
                                }}
                              >
                                {p}
                              </Menu.Item>
                            ))}
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </Card>
                  );
                })}
              </Stack>
            </Stack>
          </Tabs.Panel>

          {/* ===================== TASK COMMENTS ===================== */}
          <Tabs.Panel value="comments" pt="md">
            <Stack gap="sm">
              <Select
                label="Select Task"
                size="xs"
                value={String(selectedTaskId)}
                onChange={(val) => setSelectedTaskId(Number(val))}
                data={priorityTasks.map((t) => ({ value: String(t.id), label: t.title }))}
                allowDeselect={false}
              />

              <Box
                style={{
                  height: 250,
                  overflowY: "auto",
                  border: "1px solid var(--tf-border)",
                  borderRadius: 12,
                  padding: 12,
                  background: "var(--tf-surface-2)",
                }}
              >
                <Stack gap="xs">
                  {comments[selectedTaskId]?.length === 0 ? (
                    <Text size="xs" c="dimmed" ta="center" py={40}>No comments yet. Say something below!</Text>
                  ) : (
                    comments[selectedTaskId]?.map((c) => {
                      const isMe = c.author === "You";
                      return (
                        <div key={c.id} style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                          <Group gap="xs" justify={isMe ? "flex-end" : "flex-start"} mb={2}>
                            {!isMe && <Avatar size="xs" radius="xl" color="teal">{c.author[0]}</Avatar>}
                            <Text size="10px" fw={600} c="dimmed">{c.author}</Text>
                            <Text size="9px" c="dimmed">{c.time}</Text>
                          </Group>
                          <Box
                            style={{
                              background: isMe ? "var(--tf-primary)" : "var(--tf-surface)",
                              color: isMe ? "#fff" : "var(--tf-text)",
                              padding: "6px 12px",
                              borderRadius: 12,
                              fontSize: 12,
                              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            }}
                          >
                            {c.text}
                          </Box>
                        </div>
                      );
                    })
                  )}
                  {isTyping && (
                    <Group gap="xs">
                      <Avatar size="xs" radius="xl" color="teal">S</Avatar>
                      <Box style={{ background: "var(--tf-surface)", padding: "6px 12px", borderRadius: 12 }}>
                        <Text size="xs" c="dimmed" className="tf-pulse">Sarah is typing...</Text>
                      </Box>
                    </Group>
                  )}
                </Stack>
              </Box>

              <form onSubmit={handleSendComment}>
                <Group gap="xs" align="flex-end">
                  <TextInput
                    placeholder="Type your comment..."
                    style={{ flex: 1 }}
                    size="xs"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.currentTarget.value)}
                  />
                  <ActionIcon type="submit" size="md" color="brand" variant="filled" disabled={!commentInput.trim()}>
                    <IconSend size={14} />
                  </ActionIcon>
                </Group>
              </form>
            </Stack>
          </Tabs.Panel>

          {/* ===================== MEMBER MANAGEMENT ===================== */}
          <Tabs.Panel value="members" pt="md">
            <Stack gap="md">
              <Text size="xs" c="dimmed">
                Manage who has access to this workspace and control their roles. Owners cannot be edited or removed.
              </Text>

              <Stack gap="xs">
                {members.map((member) => (
                  <Card key={member.id} withBorder p="sm" radius="md">
                    <Group justify="space-between" align="center">
                      <Group gap="xs">
                        <Avatar size="sm" radius="xl" color={member.role === "owner" ? "brand" : "gray"}>
                          {member.name[0]}
                        </Avatar>
                        <div>
                          <Text size="sm" fw={600}>{member.name}</Text>
                          <Badge size="xs" variant="light" color={member.role === "owner" ? "red" : member.role === "admin" ? "violet" : "gray"}>
                            {member.role}
                          </Badge>
                        </div>
                      </Group>

                      {member.role !== "owner" ? (
                        <Group gap="xs">
                          <Select
                            w={100}
                            size="xs"
                            value={member.role}
                            onChange={(val) => handleRoleChange(member.id, val || "member")}
                            data={["admin", "member"]}
                            allowDeselect={false}
                          />
                          <Tooltip label="Remove from workspace">
                            <ActionIcon
                              color="red"
                              variant="light"
                              size="md"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <IconUserMinus size={14} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      ) : (
                        <Text size="xs" c="dimmed">Primary Owner</Text>
                      )}
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Drawer>
  );

  function setSortOption(val) {
    setPrioritySort(val || "priority-high");
  }
}
