import { useState } from "react";
import { Calendar, Loader2, Send, Trash2, User } from "lucide-react";
import {
  useComments,
  useCreateComment,
  useDeleteComment,
} from "../hooks/useComments";
import { priorityMeta, statusMeta } from "../constants/tasks";
import { timeAgo } from "../utils/time";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function Initial({ name }) {
  return (
    <span
      className="flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
      style={{ background: "var(--tf-brand-gradient)" }}
    >
      {name?.[0]?.toUpperCase() ?? "?"}
    </span>
  );
}

function CommentRow({ comment, canDelete, onDelete }) {
  return (
    <div className="flex gap-2.5">
      <Initial name={comment.author?.username} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-nowrap items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {comment.author?.username ?? "Unknown"}
          </span>
          <span className="text-xs text-muted-foreground">
            {timeAgo(comment.created_at)}
          </span>
          {canDelete && (
            <button
              type="button"
              aria-label="Delete comment"
              onClick={() => onDelete(comment.id)}
              className="ml-auto text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
        <p className="whitespace-pre-wrap break-words text-sm text-foreground/90">
          {comment.body}
        </p>
      </div>
    </div>
  );
}

function TaskDetailModal({
  opened,
  onClose,
  task,
  workspaceId,
  currentUserId,
  canModerate,
  membersById,
}) {
  const taskId = opened ? (task?.id ?? null) : null;
  const { data: comments = [], isLoading } = useComments(workspaceId, taskId);
  const createComment = useCreateComment(workspaceId, taskId);
  const deleteComment = useDeleteComment(workspaceId, taskId);
  const [body, setBody] = useState("");

  if (!task) return null;

  const status = statusMeta(task.status);
  const priority = priorityMeta(task.priority);
  const assignee =
    task.assignee_id != null ? membersById?.[task.assignee_id] : null;
  const due = task.due_date ? new Date(task.due_date).toLocaleDateString() : null;

  async function submit(e) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    try {
      await createComment.mutateAsync(text);
      setBody("");
    } catch {
      /* toast handled in the hook */
    }
  }

  return (
    <Dialog open={opened} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="pr-6 leading-snug">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-y-auto">
          {/* meta */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="capitalize">{status.label}</Badge>
            <span
              className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold capitalize"
              style={{ color: priority.color, backgroundColor: `${priority.color}1a` }}
            >
              {priority.label} priority
            </span>
            {due && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3.5" /> {due}
              </span>
            )}
            {assignee && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="size-3.5" /> {assignee.username}
              </span>
            )}
          </div>

          {task.description && (
            <p className="whitespace-pre-wrap text-sm text-foreground/90">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Comments
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="size-5 animate-spin text-primary" />
            </div>
          ) : comments.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">
              No comments yet. Start the conversation.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {comments.map((c) => (
                <CommentRow
                  key={c.id}
                  comment={c}
                  canDelete={canModerate || c.author_id === currentUserId}
                  onDelete={(id) => deleteComment.mutate(id)}
                />
              ))}
            </div>
          )}
        </div>

        <form onSubmit={submit} className="mt-1 flex items-end gap-2 border-t border-border pt-3">
          <Textarea
            placeholder="Write a comment…"
            rows={2}
            value={body}
            onChange={(e) => setBody(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e);
            }}
            className="min-h-[44px] flex-1 resize-none"
          />
          <Button
            type="submit"
            size="icon"
            disabled={createComment.isPending || !body.trim()}
            className={cn("shrink-0")}
            aria-label="Post comment"
          >
            {createComment.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Send />
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TaskDetailModal;
