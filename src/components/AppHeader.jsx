import { Link, useLocation } from "react-router-dom";
import {
  useMantineColorScheme,
  useComputedColorScheme,
} from "@mantine/core";
import { Check, ChevronDown, LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { useMyInvitations } from "../hooks/useInvitations";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Tasks", to: "/dashboard" },
  { label: "Workspaces", to: "/workspaces" },
  { label: "Invitations", to: "/invitations" },
];

function BrandMark() {
  return (
    <div className="tf-brandmark size-[30px] rounded-[9px]">
      <Check className="size-[17px]" strokeWidth={3} aria-hidden="true" />
    </div>
  );
}

function ColorSchemeToggle() {
  // Mantine still owns the color-scheme attribute both styling systems key
  // off of; swap this to a standalone mechanism once Mantine is removed.
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme("light");
  const dark = computed === "dark";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Toggle color scheme"
            onClick={() => setColorScheme(dark ? "light" : "dark")}
            className="flex size-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-secondary"
          >
            {dark ? (
              <Sun className="size-[18px]" />
            ) : (
              <Moon className="size-[18px]" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>{dark ? "Light mode" : "Dark mode"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function AppHeader() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const { data: pendingInvites = [] } = useMyInvitations("pending");
  const initial = user?.username?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="tf-header">
      <div className="mx-auto flex h-[60px] w-full max-w-[1140px] items-center justify-between px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-4 md:gap-8">
          <Link to="/dashboard" className="flex shrink-0 items-center gap-2.5 no-underline">
            <BrandMark />
            <div className="hidden leading-[1.1] sm:block">
              <p className="text-lg font-extrabold tracking-tight text-foreground">
                Taskflow
              </p>
              <p className="tf-mono text-[10px] text-muted-foreground">
                realtime · collaborative
              </p>
            </div>
          </Link>

          <nav className="tf-scroll flex items-center gap-1 overflow-x-auto">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.to);
              const showBadge =
                item.to === "/invitations" && pendingInvites.length > 0;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  data-active={active || undefined}
                  className={cn(
                    "tf-nav-link flex shrink-0 items-center gap-1.5 text-sm no-underline transition-colors",
                    active
                      ? "font-bold text-primary"
                      : "font-semibold text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                  {showBadge && (
                    <Badge className="size-5 justify-center rounded-full p-0 tabular-nums">
                      {pendingInvites.length}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <ColorSchemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-md py-1 pl-1 pr-1.5 transition-colors hover:bg-secondary"
              >
                <Avatar className="size-8">
                  <AvatarFallback
                    className="text-sm font-semibold text-white"
                    style={{ background: "var(--tf-brand-gradient)" }}
                  >
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium text-foreground sm:block">
                  {user?.username}
                </span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
                {user?.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={logout}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
