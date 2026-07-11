export const TASK_STATUSES = [
  { value: "pending", label: "Pending", color: "gray" },
  { value: "ongoing", label: "Ongoing", color: "blue" },
  { value: "completed", label: "Completed", color: "green" },
];

export function statusMeta(value) {
  return (
    TASK_STATUSES.find((s) => s.value === value) ?? {
      value,
      label: value,
      color: "gray",
    }
  );
}

// Priority uses a traffic-light mapping: low = muted, medium = amber, high = red.
// `color` is a raw hex so cards can tint a soft background with `${color}1a`.
export const TASK_PRIORITIES = [
  { value: "low", label: "Low", color: "#868e96" },
  { value: "medium", label: "Medium", color: "#f59e0b" },
  { value: "high", label: "High", color: "#e03131" },
];

export function priorityMeta(value) {
  return (
    TASK_PRIORITIES.find((p) => p.value === value) ?? {
      value: value ?? "medium",
      label: value ?? "Medium",
      color: "#868e96",
    }
  );
}
