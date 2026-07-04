import { Check } from "lucide-react";

const FEATURES = [
  "Organize work into shared workspaces",
  "Assign tasks and track them together",
  "Stay in sync with real-time updates",
];

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel — hidden on small screens */}
      <div
        className="hidden flex-1 flex-col justify-between p-12 text-white md:flex"
        style={{
          background: [
            "radial-gradient(at 80% 0%, rgba(255,255,255,0.18) 0px, transparent 50%)",
            "radial-gradient(at 0% 100%, rgba(0,0,0,0.18) 0px, transparent 50%)",
            "var(--tf-auth-gradient)",
          ].join(", "),
        }}
      >
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Check className="size-5" strokeWidth={3} aria-hidden="true" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">Taskflow</span>
        </div>

        <div className="flex max-w-md flex-col gap-5">
          <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight">
            Get your team on the same page.
          </h1>
          <p className="text-lg opacity-85">
            Plan, assign, and track work together — and watch it update live.
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <span className="grid size-[22px] shrink-0 place-items-center rounded-full bg-white/20">
                  <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                </span>
                <span className="opacity-90">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm opacity-65">© {new Date().getFullYear()} TaskFlow</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-background p-6">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <div className="flex items-center gap-2 md:hidden">
            <div className="tf-brandmark size-8 rounded-[9px]">
              <Check className="size-4" strokeWidth={3} aria-hidden="true" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-foreground">
              Taskflow
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
              {title}
            </h2>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthShell;
