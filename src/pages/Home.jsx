import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CircleAlert,
  ClipboardList,
  Layers,
  Loader2,
  UserCheck,
} from "lucide-react";
import { useOverview } from "../hooks/useStats";
import { useAuth } from "../context/auth-context";
import { TASK_PRIORITIES } from "../constants/tasks";
import { timeAgo } from "../utils/time";
import PageShell from "../components/PageShell";
import { Alert, AlertDescription } from "@/components/ui/alert";

const STATUS_UI = {
  pending: { label: "Pending", color: "#868e96" },
  ongoing: { label: "Ongoing", color: "var(--tf-primary)" },
  completed: { label: "Completed", color: "#40c057" },
};

function StatTile({ icon, label, value, accent }) {
  return (
    <div className="tf-card flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-lg"
        style={{ color: accent, backgroundColor: `${accent}1a` }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold leading-none tracking-tight text-foreground">
          {value}
        </p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function StatusMeter({ byStatus, total }) {
  const order = ["pending", "ongoing", "completed"];
  if (total === 0) {
    return <p className="text-sm text-muted-foreground">No tasks yet.</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-3 overflow-hidden rounded-full bg-secondary">
        {order.map((s) => {
          const pct = (byStatus[s] / total) * 100;
          if (!pct) return null;
          return (
            <div
              key={s}
              style={{ width: `${pct}%`, backgroundColor: STATUS_UI[s].color }}
              title={`${STATUS_UI[s].label}: ${byStatus[s]}`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {order.map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: STATUS_UI[s].color }}
            />
            <span className="text-sm text-foreground">{STATUS_UI[s].label}</span>
            <span className="text-sm font-semibold text-muted-foreground">
              {byStatus[s]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PriorityBars({ byPriority, total }) {
  const denom = total || 1;
  return (
    <div className="flex flex-col gap-3">
      {TASK_PRIORITIES.map((p) => {
        const count = byPriority[p.value] ?? 0;
        return (
          <div key={p.value} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-sm capitalize text-muted-foreground">
              {p.label}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full"
                style={{ width: `${(count / denom) * 100}%`, backgroundColor: p.color }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-sm font-semibold text-foreground">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ActivityInitial({ name }) {
  return (
    <span
      className="flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
      style={{ background: "var(--tf-brand-gradient)" }}
    >
      {name?.[0]?.toUpperCase() ?? "?"}
    </span>
  );
}

function Panel({ title, children }) {
  return (
    <section className="tf-card rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-base font-bold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Home() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useOverview();

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Welcome back{user?.username ? `, ${user.username}` : ""}
        </h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s on your plate.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-7 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>Could not load your dashboard.</AlertDescription>
        </Alert>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile
              icon={<ClipboardList className="size-5" />}
              label="My tasks"
              value={data.total}
              accent="var(--tf-primary)"
            />
            <StatTile
              icon={<UserCheck className="size-5" />}
              label="Assigned to me"
              value={data.assigned_to_me}
              accent="#16b364"
            />
            <StatTile
              icon={<AlertTriangle className="size-5" />}
              label="Overdue"
              value={data.overdue}
              accent="#e03131"
            />
            <StatTile
              icon={<Layers className="size-5" />}
              label="Workspaces"
              value={data.workspace_count}
              accent="#6a5bf6"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Panel title="Tasks by status">
              <StatusMeter byStatus={data.by_status} total={data.total} />
            </Panel>
            <Panel title="Tasks by priority">
              <PriorityBars byPriority={data.by_priority} total={data.total} />
            </Panel>
          </div>

          <Panel title="Recent activity">
            {data.recent_activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent activity in your workspaces.{" "}
                <Link to="/workspaces" className="text-primary no-underline hover:underline">
                  Open a workspace
                </Link>{" "}
                to get started.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {data.recent_activity.map((a) => (
                  <div key={a.id} className="flex gap-3">
                    <ActivityInitial name={a.actor?.username} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">{a.actor?.username}</span>{" "}
                        <span className="text-foreground/80">{a.summary}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {timeAgo(a.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      )}
    </PageShell>
  );
}

export default Home;
