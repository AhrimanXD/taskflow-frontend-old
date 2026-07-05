# Taskflow — UI redesign handoff

Taskflow is a real-time collaborative task manager (personal task board + shared workspace boards with invitations). The app is **fully functional but deliberately unstyled** — every page is plain JSX with browser-default rendering. Your job is **visual design only**: layout, styling, componentry, responsiveness, accessibility, polish.

## Hard rules

1. **A working backend already exists** (FastAPI at `http://localhost:8000/api/`, WebSocket at `ws://localhost:8000/ws/workspaces/{id}`). Do NOT create a backend, API routes, server actions, mock servers, or fake data layers. All data access already works through the files listed under "Do not modify".
2. **Do not invent features.** The complete feature list is below. If it's not listed, it doesn't exist — see the explicit "does NOT exist" list at the bottom. Do not add settings pages, profile pages, notification centers, comments, priorities, labels, avatars-upload, password reset, etc.
3. **Do not change behavior.** Keep every handler, validation rule, navigation target, and state transition exactly as-is. You may reorganize markup and split/merge presentational components freely, as long as props flow and logic stay identical.

### Do not modify (logic layer — import and use as-is)
- `src/services/api.js` — axios instance + all API service functions
- `src/hooks/useTasks.js`, `src/hooks/useWorkspaces.js`, `src/hooks/useInvitations.js` — React Query hooks (they also fire sonner toasts on success/error)
- `src/hooks/useWorkspaceSocket.js` — WebSocket with auth frame, reconnect/backoff, live cache patching
- `src/context/AuthContext.jsx`, `src/context/auth-context.js` — auth provider
- `src/utils/tasks.js` — search/sort/grouping helpers
- `src/constants/tasks.js` — task status definitions
- `src/App.jsx` — routing table

### Free to restyle (presentation layer)
Everything in `src/pages/` and `src/components/` (AppHeader, PageShell, ProtectedRoute, TaskBoard, TaskColumn, TaskCard, TaskFormModal, TaskSkeleton, EmptyState, ConfirmDialog, WorkspaceTasks), plus `index.html` and `src/main.jsx` (keep `QueryClientProvider`, `BrowserRouter`, sonner `<Toaster />`, and `AuthProvider` wiring intact).

## Tech stack (current)

- Vite 7 + React 19, **JSX only (no TypeScript)**
- react-router-dom 7, TanStack Query 5, axios, sonner (toasts)
- No CSS framework installed. You may add Tailwind/shadcn or write CSS — your choice.
- Auth: JWT in `localStorage("token")`, sent as `Authorization: Bearer` by an axios interceptor.

## Routes

| Path | Page | Guard |
|---|---|---|
| `/` | redirect → `/dashboard` | — |
| `/login` | Login | public |
| `/register` | Register | public |
| `/dashboard` | Personal tasks | ProtectedRoute |
| `/workspaces` | Workspace list | ProtectedRoute |
| `/workspaces/:id` | Workspace detail (board + members) | ProtectedRoute |
| `/invitations` | My pending invitations | ProtectedRoute |
| `/onboarding` | 2-step: create workspace → invite team | ProtectedRoute |
| `*` | 404 | — |

`ProtectedRoute`: shows a loading state while auth initializes, redirects to `/login` if not logged in.

## Feature inventory (complete)

### Auth
- **Login** (`/login`): email + password. Client validation: email regex → "Invalid email". On submit: loading state, on failure shows server `detail` or "Login failed. Please try again." On success → `/dashboard` (replace). Link to `/register`. Note: users sign in with **email** (the auth API's form field is named `username` but receives the email).
- **Register** (`/register`): email, username, password. Validation: email regex → "Invalid email format"; username ≥ 3 chars; password ≥ 6 chars. On success auto-logs-in → `/onboarding` (replace). Link to `/login`.

### App shell (all protected pages)
- Header: brand "Taskflow" (links to `/dashboard`), nav — Tasks `/dashboard`, Workspaces `/workspaces`, Invitations `/invitations` (active state = pathname prefix match). Invitations link shows a **pending-invite count badge** when > 0 (from `useMyInvitations("pending")`).
- User area: username + email display, **Log out** button (clears token, lands on login via guard).

### Dashboard — personal tasks (`/dashboard`)
- Heading "My Tasks" / "Everything on your plate." + **New task** button.
- Toolbar: **search input** (filters by title + description, live), **sort select** (Newest first / Oldest first / Title A–Z), **view switch** (Board / Grid) persisted to `localStorage("taskflow:view")`.
- States: loading (skeleton placeholder), error ("Could not load tasks…"), empty ("No tasks yet" + create CTA), no-search-results ("No matching tasks" + clear-search CTA).
- **Board view**: 3 columns by status — Pending, Ongoing, Completed — each with a task count and "No tasks" placeholder when empty. **No drag-and-drop** — status changes happen via a control on the card.
- **Grid view**: flat list/grid of the same cards.
- **Task card**: title, optional description, status (changeable via select/menu with the 3 statuses), due date with **overdue indication** (overdue = past due AND not completed), Edit button, Delete button. Personal tasks have **no assignee UI**.
- **Task form modal** (create + edit share it): Title (required — "Title is required"), Description (optional), Status select, Due date (native date input, optional, clearable). Edit mode pre-fills from the task. Submit label: "Create task" / "Save changes". Cancel closes. On API failure the modal stays open (error surfaces as toast from the hook).
- **Delete** always goes through a confirm dialog: "Delete task" / `Delete "{title}"? This can't be undone.` with Cancel / Delete.

### Workspaces (`/workspaces`)
- Heading "Workspaces" / "Shared spaces for collaborating on tasks." + **New workspace** button.
- List of workspaces: name (links to detail), description or "No description", **Owner/Member badge** (owner = `workspace.owner_id === user.id`). Owners get a Delete action (confirm dialog: "…Its tasks and invitations will be removed too.").
- Create dialog: Name (required — "Name is required"), Description (optional). Stays open on API failure.
- States: loading, empty ("No workspaces yet" + create CTA).

### Workspace detail (`/workspaces/:id`)
- "Back to workspaces" link. Workspace name + Owner/Member badge + optional description.
- Error state: 403/404 → "This workspace doesn't exist or you don't have access to it."; otherwise "Could not load this workspace."
- **Two tabs**: "Tasks" and "Members & invitations".
- **Tasks tab** = the shared board. Same as Dashboard board except:
  - Sort is fixed to newest (no sort control). Search + Board/Grid switch (persisted to `localStorage("taskflow:ws-view")`) + New task button.
  - **Live connection indicator** from the WebSocket: `connected` ("Live — realtime updates are on"), `connecting`, `reconnecting` ("Connection dropped — retrying"). Board updates in real time when teammates create/update/delete tasks.
  - Cards additionally show **assignee** (resolved to username via members; "You" when it's the current user) and an **Assign to me / Unassign me** action.
  - Task form additionally has an **Assignee select**: "Unassigned" + every member (falls back to `User #{id}` if the current assignee isn't in the member list).
  - Any member can create/edit/assign. Deleting someone else's task is **rejected by the server** (creator or owner/admin only) and surfaces as an error toast — the UI does not pre-hide the button.
- **Members & invitations tab**:
  - Members list: username + role (owner / admin / member).
  - Invite manager (owner/admin only — a plain member gets a 403 and sees "Only the workspace owner or admins can manage invitations."): email input (regex-validated — "Enter a valid email") + role select (Member/Admin) + Send. Server errors (e.g. user not found, already a member) show inline on the email field. Below: pending invitations list — invitee username, role, status, **Revoke** button per row.

### Invitations (`/invitations`)
- Heading "Invitations" / "Workspace invitations waiting for your response."
- Pending invitations received: workspace name, role, "**{inviter}** invited you to join." with **Accept** / **Decline** buttons (per-invite busy state). Accepting also refreshes the workspace list. Empty state: "No pending invitations…"

### Onboarding (`/onboarding`) — standalone page, no app header
- Step indicator: "Workspace" → "Invite team".
- **Step 1**: create workspace — name (required — "Workspace name is required") + optional description → Continue.
- **Step 2**: invite rows (email + role select + remove-row button; min 1 row; "Add another" appends). "Send N invite(s)" validates each email, sends sequentially, marks successes (row becomes disabled/sent), shows per-row server errors. All succeeded → success toast → workspace. Partial failure → warning toast "Some invites need attention", failed rows stay editable. "Skip for now" / "Go to workspace" (when nothing pending) → `/workspaces/{id}` (replace).

### 404
- "404 — Page not found" + link back to `/dashboard`.

### Global feedback (sonner toasts — already wired inside hooks, do not re-implement)
Success: "Task created", "Workspace created", "Invitation sent", "Invitation accepted", "N invite(s) sent". Neutral: "Task deleted", "Workspace deleted", "Invitation declined", "Invitation revoked". Errors show the server's `detail` string when present, else generic ("Could not create task", etc.).

## Data shapes (what components receive)

```
user        { id, username, email }
task        { id, title, description|null, status: "pending"|"ongoing"|"completed",
              due_date: ISO|null, assignee_id: number|null, created_at, updated_at }
workspace   { id, name, description|null, owner_id }
member      { user_id, role: "owner"|"admin"|"member", user: { id, username } }
invitation (received)  { id, role, status, workspace: { id, name }, inviter: { username } }
invitation (sent)      { id, role, status: "pending"|"accepted"|"declined"|"revoked",
                         invitee: { username } }
```

Task statuses (from `src/constants/tasks.js`): `pending` → "Pending", `ongoing` → "Ongoing", `completed` → "Completed".

## localStorage keys
`token` (JWT), `taskflow:view` (dashboard Board/Grid), `taskflow:ws-view` (workspace Board/Grid).

## Explicitly does NOT exist — do not design or stub these
- No drag-and-drop on the board (status changes via control on the card)
- No settings, profile, or account pages; no password reset / change / email verification
- No notifications center (only the invitation count badge + toasts)
- No comments, attachments, labels, priorities, subtasks, or activity feeds
- No pagination or infinite scroll (lists render fully)
- No workspace edit/rename UI (the API supports PATCH but no UI calls it — leave it that way)
- No member removal or role-change UI
- No search on workspaces/invitations pages (search exists only on task boards)
- No dark-mode toggle (add one only if you also implement it fully; there is currently none)
