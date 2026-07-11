import { useMemo, useRef, useState } from "react";
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

// Highlight @handles that match a real workspace member.
function renderBody(text, memberNames) {
  return text.split(/(@\w+)/g).map((part, i) =>
    part[0] === "@" && memberNames.has(part.slice(1).toLowerCase()) ? (
      <span key={i} className="font-semibold text-primary">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// If the caret sits right after an "@handle" token, return the in-progress
// mention so the composer can offer suggestions.
function getMentionContext(text, cursor) {
  const upto = text.slice(0, cursor);
  const m = upto.match(/(?:^|\s)@(\w*)$/);
  if (!m) return null;
  const query = m[1];
  return { query, start: cursor - query.length - 1, cursor };
}

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

function CommentRow({ comment, canDelete, onDelete, memberNames }) {
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
          {renderBody(comment.body, memberNames)}
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
  const [mention, setMention] = useState(null);
  const textareaRef = useRef(null);
  const memberList = useMemo(() => Object.values(membersById || {}), [membersById]);
  const memberNames = useMemo(
    () => new Set(memberList.map((u) => u.username?.toLowerCase()).filter(Boolean)),
    [memberList]
  );

  if (!task) return null;

  const suggestions = mention
    ? memberList
        .filter((u) =>
          u.username?.toLowerCase().startsWith(mention.query.toLowerCase())
        )
        .slice(0, 6)
    : [];

  function onBodyChange(e) {
    setBody(e.currentTarget.value);
    setMention(
      getMentionContext(e.currentTarget.value, e.currentTarget.selectionStart)
    );
  }

  function insertMention(username) {
    if (!mention) return;
    const before = body.slice(0, mention.start);
    const after = body.slice(mention.cursor);
    const insert = `@${username} `;
    setBody(before + insert + after);
    setMention(null);
    const caret = (before + insert).length;
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(caret, caret);
      }
    });
  }

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
      setMention(null);
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
                  memberNames={memberNames}
                />
              ))}
            </div>
          )}
        </div>

        <form onSubmit={submit} className="mt-1 border-t border-border pt-3">
          <div className="flex items-end gap-2">
            <div className="relative flex-1">
              {mention && suggestions.length > 0 && (
                <div className="absolute bottom-full left-0 z-50 mb-1 w-56 overflow-hidden rounded-md border border-border bg-popover shadow-md">
                  {suggestions.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      // onMouseDown (not onClick) so the textarea keeps focus.
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertMention(u.username);
                      }}
                      className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-secondary"
                    >
                      <span
                        className="flex size-5 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                        style={{ background: "var(--tf-brand-gradient)" }}
                      >
                        {u.username?.[0]?.toUpperCase() ?? "?"}
                      </span>
                      {u.username}
                    </button>
                  ))}
                </div>
              )}
              <Textarea
                ref={textareaRef}
                placeholder="Write a comment…  use @ to mention"
                rows={2}
                value={body}
                onChange={onBodyChange}
                onKeyDown={(e) => {
                  if (e.key === "Escape" && mention) {
                    setMention(null);
                    return;
                  }
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e);
                }}
                className="min-h-[44px] w-full resize-none"
              />
            </div>
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TaskDetailModal;
