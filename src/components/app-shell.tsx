import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import {
  LayoutDashboard,
  FolderSearch,
  BarChart3,
  Map as MapIcon,
  Network,
  Bot,
  TrendingUp,
  FileText,
  ShieldCheck,
  Settings,
  Bell,
  Search,
  LogOut,
  ChevronRight,
  Shield,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ROLE_NAV_VISIBILITY } from "@/services/mock";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { mockService } from "@/services/mock";
import { formatDistanceToNow } from "date-fns";

interface NavItem {
  key: string;
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: "main" | "admin";
}

const NAV: NavItem[] = [
  { key: "dashboard", label: "Dashboard", to: "/", icon: LayoutDashboard },
  { key: "investigation", label: "Investigation", to: "/investigation", icon: FolderSearch },
  { key: "analytics", label: "Crime Analytics", to: "/analytics", icon: BarChart3 },
  { key: "map", label: "Crime Map", to: "/map", icon: MapIcon },
  { key: "intelligence", label: "Criminal Intelligence", to: "/intelligence", icon: Network },
  { key: "assistant", label: "AI Assistant", to: "/assistant", icon: Bot },
  { key: "predictions", label: "Predictions", to: "/predictions", icon: TrendingUp },
  { key: "reports", label: "Reports", to: "/reports", icon: FileText },
  { key: "administration", label: "Administration", to: "/administration", icon: ShieldCheck, section: "admin" },
  { key: "settings", label: "Settings", to: "/settings", icon: Settings, section: "admin" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [globalQ, setGlobalQ] = useState("");

  if (!user) return <>{children}</>;

  const allowedKeys = ROLE_NAV_VISIBILITY[user.role];
  const items = NAV.filter((n) => allowedKeys.includes(n.key));
  const mainItems = items.filter((i) => i.section !== "admin");
  const adminItems = items.filter((i) => i.section === "admin");

  const crumbs = buildCrumbs(pathname);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-sidebar-border">
          <div className="size-9 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Shield className="size-5 text-primary" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">SentinelAI</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Karnataka State Police</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <SidebarGroup label="Operations" items={mainItems} pathname={pathname} />
          {adminItems.length > 0 && <SidebarGroup label="System" items={adminItems} pathname={pathname} />}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="rounded-md bg-sidebar-accent/60 border border-sidebar-border p-3">
            <div className="text-xs text-muted-foreground">System Status</div>
            <div className="mt-1 flex items-center gap-2">
              <div className="size-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-medium">Operational</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 shrink-0 border-b border-border bg-card/40 backdrop-blur flex items-center gap-3 px-4 lg:px-6">
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={globalQ}
              onChange={(e) => setGlobalQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && globalQ.trim()) {
                  navigate({ to: "/investigation", search: { q: globalQ } as never });
                }
              }}
              placeholder="Search FIRs, suspects, locations, or ask AI…"
              className="pl-9 bg-background/60 border-border h-10"
            />
            <kbd className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">⌘K</kbd>
          </div>

          <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 pl-3 pr-2 h-10 rounded-md hover:bg-secondary/60 transition-colors">
                <div className="size-8 rounded-full bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center border border-primary/30">
                  {user.avatarInitials}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-medium leading-tight">{user.name}</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">{user.role} · {user.badgeNumber}</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="text-xs font-medium">{user.name}</div>
                <div className="text-[10px] text-muted-foreground font-normal">{user.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
                <UserIcon className="size-4 mr-2" /> Profile & Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  navigate({ to: "/login" });
                }}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="size-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Breadcrumbs */}
        <div className="px-4 lg:px-6 py-3 border-b border-border/60 bg-background/40">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {crumbs.map((c, i) => (
              <div key={c.href} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="size-3" />}
                {i === crumbs.length - 1 ? (
                  <span className="text-foreground font-medium">{c.label}</span>
                ) : (
                  <Link to={c.href} className="hover:text-foreground">{c.label}</Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarGroup({ label, items, pathname }: { label: string; items: NavItem[]; pathname: string }) {
  return (
    <div>
      <div className="px-3 pb-2 text-[10px] uppercase tracking-widest text-muted-foreground/70 font-semibold">{label}</div>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <li key={item.key}>
              <Link
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-primary/15 text-foreground border border-primary/25"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-foreground border border-transparent",
                )}
              >
                <Icon className={cn("size-4", active ? "text-primary" : "text-muted-foreground")} />
                <span className="flex-1">{item.label}</span>
                {active && <div className="size-1.5 rounded-full bg-primary" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function NotificationBell() {
  const { data: alerts = [] } = useQuery({ queryKey: ["alerts"], queryFn: () => mockService.listAlerts() });
  const critical = alerts.filter((a) => a.level === "critical").length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {critical > 0 && (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Notifications</div>
            <div className="text-xs text-muted-foreground">{alerts.length} active alerts</div>
          </div>
          <Badge variant="outline" className="text-[10px]">Live</Badge>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {alerts.map((a) => (
            <div key={a.id} className="p-4 border-b border-border/60 last:border-0 hover:bg-secondary/40">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "size-2 rounded-full mt-1.5",
                  a.level === "critical" && "bg-destructive",
                  a.level === "warning" && "bg-warning",
                  a.level === "info" && "bg-primary",
                )} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{a.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{a.message}</div>
                  <div className="text-[10px] text-muted-foreground/70 mt-1">
                    {formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function buildCrumbs(pathname: string): Array<{ label: string; href: string }> {
  const map: Record<string, string> = {
    "": "Command Center",
    investigation: "Investigation",
    analytics: "Crime Analytics",
    map: "Crime Map",
    intelligence: "Criminal Intelligence",
    assistant: "AI Assistant",
    predictions: "Predictions",
    reports: "Reports",
    administration: "Administration",
    settings: "Settings",
  };
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: Array<{ label: string; href: string }> = [{ label: "Command Center", href: "/" }];
  let acc = "";
  for (const p of parts) {
    acc += "/" + p;
    crumbs.push({ label: map[p] ?? decodeURIComponent(p), href: acc });
  }
  return crumbs;
}
