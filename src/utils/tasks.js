import { TASK_STATUSES } from "../constants/tasks";

export function filterAndSortTasks(tasks, { query, sort }) {
  const q = query.trim().toLowerCase();

  let result = tasks;
  if (q) {
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q)
    );
  }

  const sorted = [...result];
  switch (sort) {
    case "oldest":
      sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      break;
    case "title":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "newest":
    default:
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  return sorted;
}

// Returns a Map of status -> tasks, with the known statuses first (in their
// defined order) and any unexpected status values appended after.
export function groupByStatus(tasks) {
  const groups = new Map(TASK_STATUSES.map((s) => [s.value, []]));
  for (const task of tasks) {
    if (!groups.has(task.status)) groups.set(task.status, []);
    groups.get(task.status).push(task);
  }
  return groups;
}
