import { Calendar, ChevronDown, MoreHorizontal } from "lucide-react";
import { TASK_STATUSES, statusMeta } from "../constants/tasks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Status dot colors (was Mantine's gray/blue/green-6 palette entries).
const DOT_COLOR = {
  gray: "#868e96",
  blue: "var(--tf-primary)",
  green: "#40c057",
};

function dueMeta(task) {
  if (!task.due_date) return null;
  const due = new Date(task.due_date);
  const overdue = due < new Date() && task.status !== "completed";
  return { label: due.toLocaleDateString(), overdue };
}

// currentUserId + onAssignToggle are only passed in workspace contexts —
// personal tasks aren't assignable, so the assign UI stays hidden there.
function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  currentUserId,
  onAssignToggle,
  membersById,
}) {
  const meta = statusMeta(task.status);
  const due = dueMeta(task);
  const isCompleted = task.status === "completed";
  const isOngoing = task.status === "ongoing";
  // Status-driven accent: the label and due-date pick up the status color.
  const statusColor = isOngoing
    ? "var(--tf-primary)"
    : isCompleted
      ? "var(--tf-done-text)"
      : "var(--tf-text-2)";
  const dueColor = due?.overdue
    ? "var(--destructive)"
    : isOngoing
      ? "var(--tf-primary)"
      : isCompleted
        ? "var(--tf-done-text)"
        : "var(--tf-text-2)";
  const assignedToMe =
    task.assignee_id != null && task.assignee_id === currentUserId;
  // Resolve the assignee's username from the workspace members (when available).
  const assignee =
    task.assignee_id != null ? membersById?.[task.assignee_id] : null;
  const assigneeLabel = assignedToMe
    ? "You"
    : assignee?.username ?? `#${task.assignee_id}`;
  const hasFooter = due || task.assignee_id != null;

  return (
    <div
      className={cn(
        "tf-card rounded-xl border border-border bg-card p-4",
        isCompleted && "opacity-[0.72]"
      )}
    >
      {/* status (clickable) + actions */}
      <div className="mb-2 flex flex-nowrap items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="tf-status-pill flex flex-nowrap items-center gap-1.5">
              <span
                className={cn("size-2 rounded-full", isOngoing && "tf-pulse")}
                style={{ backgroundColor: DOT_COLOR[meta.color] ?? DOT_COLOR.gray }}
              />
              <span
                className="tf-mono text-[10px] font-bold uppercase tracking-[0.08em]"
                style={{ color: statusColor }}
              >
                {meta.label}
              </span>
              <ChevronDown className="size-3" strokeWidth={2.5} style={{ color: statusColor }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Set status</DropdownMenuLabel>
            {TASK_STATUSES.map((s) => (
              <DropdownMenuItem key={s.value} onClick={() => onStatusChange(task, s.value)}>
                {s.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Task actions"
              className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>Edit</DropdownMenuItem>
            {onAssignToggle && (
              <DropdownMenuItem
                onClick={() => onAssignToggle(task, assignedToMe ? null : currentUserId)}
              >
                {assignedToMe ? "Unassign me" : "Assign to me"}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(task)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col gap-1">
        <p
          className={cn(
            "line-clamp-2 text-base font-bold leading-[1.3] tracking-[-0.01em]",
            isCompleted ? "text-muted-foreground line-through" : "text-foreground"
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {task.description}
          </p>
        )}
      </div>

      {hasFooter && (
        <div className="mt-3 flex flex-nowrap items-center justify-between border-t border-border pt-2.5">
          {due ? (
            <div className="flex flex-nowrap items-center gap-[5px]">
              <Calendar className="size-[13px]" style={{ color: dueColor }} />
              <span className="tf-mono text-[11px] font-semibold" style={{ color: dueColor }}>
                {due.label}
              </span>
            </div>
          ) : (
            <span />
          )}

          {task.assignee_id != null && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-nowrap items-center gap-1.5">
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        assignedToMe ? "text-primary" : "text-foreground"
                      )}
                    >
                      {assigneeLabel}
                    </span>
                    <span
                      className="flex size-[22px] items-center justify-center rounded-full text-[10px] font-semibold text-white"
                      style={{
                        background: assignedToMe
                          ? "var(--tf-brand-gradient)"
                          : "#868e96",
                      }}
                    >
                      {(assignee?.username ?? assigneeLabel)?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {assignee
                    ? `Assigned to ${assignee.username}`
                    : assignedToMe
                      ? "Assigned to you"
                      : `Assigned to user #${task.assignee_id}`}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
    </div>
  );
}

export default TaskCard;
