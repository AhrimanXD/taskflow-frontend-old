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
