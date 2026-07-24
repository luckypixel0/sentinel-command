import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { mockService } from "@/services/mock";
import { PageContainer, PageHeader, StatusDot } from "@/components/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  FileText,
  AlertTriangle,
  Users,
  Gavel,
  MapPin,
  Sparkles,
  Bot,
  ChevronRight,
  Activity,
  ShieldAlert,
  TrendingUp,
  Radio,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Command Intelligence Center — SentinelAI" },
      { name: "description", content: "Realtime crime intelligence, active FIRs and AI-driven operations for Karnataka State Police." },
      { property: "og:title", content: "Command Intelligence Center — SentinelAI" },
      { property: "og:description", content: "Realtime crime intelligence, active FIRs and AI-driven operations." },
    ],
  }),
  component: DashboardPage,
});

const CHART_COLORS = ["#2563EB", "#22C55E", "#F59E0B", "#EF4444", "#A855F7", "#06B6D4", "#EC4899", "#84CC16", "#F97316", "#14B8A6"];

function DashboardPage() {
  const { user } = useAuth();
  const { data: metrics } = useQuery({ queryKey: ["metrics"], queryFn: () => mockService.metrics() });
  const { data: trend = [] } = useQuery({ queryKey: ["trend"], queryFn: () => mockService.trendData() });
  const { data: dist = [] } = useQuery({ queryKey: ["dist"], queryFn: () => mockService.crimeDistribution() });
  const { data: risk = [] } = useQuery({ queryKey: ["risk"], queryFn: () => mockService.districtRisk() });
  const { data: firs = [] } = useQuery({ queryKey: ["firs"], queryFn: () => mockService.listFIRs() });
  const { data: alerts = [] } = useQuery({ queryKey: ["alerts"], queryFn: () => mockService.listAlerts() });
  const { data: hotspots = [] } = useQuery({ queryKey: ["hotspots"], queryFn: () => mockService.listHotspots() });
  const [aiQ, setAiQ] = useState("");

  const recent = firs.slice(0, 6);
  const now = new Date();
  const timeOfDay = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <PageContainer>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-primary font-semibold flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5"><StatusDot tone="success" /> Live · {user?.district}</span>
            <span className="text-muted-foreground">Command Intelligence Center</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mt-1">{timeOfDay}, {user?.name.split(" ").slice(-1)[0]}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {now.toLocaleString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} · Karnataka State Police
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/reports"><FileText className="size-4" />Generate Brief</Link>
          </Button>
          <Button asChild>
            <Link to="/assistant"><Sparkles className="size-4" />Ask AI</Link>
          </Button>
        </div>
      </div>

      {/* AI Search */}
      <Card className="mb-6 border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="size-10 rounded-md bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
            <Bot className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">AI Intelligence Search</div>
            <div className="text-xs text-muted-foreground">Ask in natural language — e.g. "robbery cases in Mysuru with repeat offenders last 6 months"</div>
          </div>
          <form
            className="flex gap-2 w-full md:w-auto md:min-w-[420px]"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/assistant?q=${encodeURIComponent(aiQ)}`;
            }}
          >
            <Input value={aiQ} onChange={(e) => setAiQ(e.target.value)} placeholder="Ask SentinelAI…" className="bg-background/60" />
            <Button type="submit"><Sparkles className="size-4" />Ask</Button>
          </form>
        </CardContent>
      </Card>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-6">
        <Kpi icon={<Activity className="size-4" />} label="Active FIRs" value={metrics?.activeFirs ?? 0} delta="+4.2%" tone="info" />
        <Kpi icon={<AlertTriangle className="size-4" />} label="Crimes (72h)" value={metrics?.crimesToday ?? 0} delta="+12%" tone="danger" />
        <Kpi icon={<ShieldAlert className="size-4" />} label="Pending Investigation" value={metrics?.pendingInvestigation ?? 0} delta="-2.1%" tone="warning" />
        <Kpi icon={<Gavel className="size-4" />} label="Chargesheets Filed" value={metrics?.chargesheeted ?? 0} delta="+8.4%" tone="success" />
        <Kpi icon={<Users className="size-4" />} label="Arrests" value={metrics?.arrests ?? 0} delta="+3.0%" tone="success" />
        <Kpi icon={<Radio className="size-4" />} label="Repeat Offenders" value={metrics?.repeatOffenders ?? 0} delta="+1" tone="warning" />
        <Kpi icon={<TrendingUp className="size-4" />} label="High-Risk Districts" value={risk.filter((r) => r.risk > 70).length} delta="stable" tone="info" />
        <Kpi icon={<Sparkles className="size-4" />} label="AI Alerts" value={alerts.length} delta="live" tone="danger" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Crime Trend · 14 days</CardTitle>
              <div className="text-xs text-muted-foreground">FIRs registered, arrests, cases closed</div>
            </div>
            <Badge variant="outline" className="text-[10px]">Live</Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="firs" stroke="#2563EB" strokeWidth={2} dot={false} name="FIRs" />
                  <Line type="monotone" dataKey="arrests" stroke="#22C55E" strokeWidth={2} dot={false} name="Arrests" />
                  <Line type="monotone" dataKey="closed" stroke="#F59E0B" strokeWidth={2} dot={false} name="Closed" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Crime Distribution</CardTitle>
            <div className="text-xs text-muted-foreground">By category · state-wide</div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={dist} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                    {dist.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {dist.slice(0, 6).map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                  <span className="size-2 rounded-sm" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="truncate">{d.name}</span>
                  <span className="text-muted-foreground ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">High Risk Districts</CardTitle>
            <div className="text-xs text-muted-foreground">Composite risk score</div>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={risk} layout="vertical" margin={{ left: 0 }}>
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis type="category" dataKey="district" stroke="#94a3b8" fontSize={11} width={80} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="risk" radius={[0, 4, 4, 0]}>
                    {risk.map((r, i) => (
                      <Cell key={i} fill={r.risk > 75 ? "#EF4444" : r.risk > 55 ? "#F59E0B" : "#22C55E"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">AI Alerts</CardTitle>
              <div className="text-xs text-muted-foreground">Requires attention</div>
            </div>
            <Badge className="bg-destructive/20 text-destructive border-destructive/30" variant="outline">{alerts.filter(a=>a.level==="critical").length} critical</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.slice(0, 4).map((a) => (
              <div key={a.id} className="flex items-start gap-2 p-2 rounded-md border border-border/50 hover:border-primary/30 hover:bg-secondary/40 transition-colors">
                <StatusDot tone={a.level === "critical" ? "danger" : a.level === "warning" ? "warning" : "info"} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium">{a.title}</div>
                  <div className="text-[11px] text-muted-foreground line-clamp-1">{a.message}</div>
                </div>
                <div className="text-[10px] text-muted-foreground shrink-0">{formatDistanceToNow(new Date(a.timestamp), { addSuffix: false })}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Patrol Recommendations</CardTitle>
              <div className="text-xs text-muted-foreground">Next 8 hours</div>
            </div>
            <Button size="sm" variant="ghost" asChild><Link to="/predictions"><ArrowUpRight className="size-3.5" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {hotspots.slice(0, 4).map((h) => (
              <div key={h.id} className="p-2.5 rounded-md border border-border/60 hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium flex items-center gap-1.5"><MapPin className="size-3 text-primary" />{h.area}</div>
                  <Badge variant="outline" className={h.riskScore > 80 ? "text-destructive border-destructive/30" : "text-warning border-warning/30"}>
                    {h.riskScore}
                  </Badge>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">{h.district} · {h.crimeType}</div>
                <div className="text-[11px] mt-1 line-clamp-1">{h.recommendation}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity + map preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
              <div className="text-xs text-muted-foreground">Latest FIRs & case updates</div>
            </div>
            <Button size="sm" variant="ghost" asChild><Link to="/investigation">View all <ChevronRight className="size-3.5" /></Link></Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {recent.map((f, i) => (
                <motion.div key={f.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link to="/investigation/$firId" params={{ firId: f.id }} className="flex items-center gap-4 p-4 hover:bg-secondary/40 transition-colors">
                    <div className={`size-10 rounded-md flex items-center justify-center shrink-0 ${
                      f.priority === "Critical" ? "bg-destructive/20 text-destructive border border-destructive/30" :
                      f.priority === "High" ? "bg-warning/20 text-warning border border-warning/30" :
                      "bg-primary/10 text-primary border border-primary/25"}`}>
                      <FileText className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <code className="text-primary font-mono">{f.firNumber}</code>
                        <span className="text-muted-foreground">·</span>
                        <Badge variant="outline" className="text-[10px] h-5">{f.crimeType}</Badge>
                      </div>
                      <div className="text-sm truncate mt-0.5">{f.summary}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{f.station.name} · {f.location.district}</div>
                    </div>
                    <StatusBadge status={f.status} />
                    <div className="text-[11px] text-muted-foreground w-24 text-right shrink-0">
                      {formatDistanceToNow(new Date(f.registeredAt), { addSuffix: true })}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Map Preview</CardTitle>
              <div className="text-xs text-muted-foreground">Live incident density</div>
            </div>
            <Button size="sm" variant="ghost" asChild><Link to="/map">Open <ChevronRight className="size-3.5" /></Link></Button>
          </CardHeader>
          <CardContent className="pt-0 pr-4 pb-4">
            <div className="relative rounded-md border border-border/60 h-64 overflow-hidden bg-[radial-gradient(circle_at_30%_40%,rgba(37,99,235,0.15),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(239,68,68,0.2),transparent_50%),radial-gradient(circle_at_50%_20%,rgba(245,158,11,0.15),transparent_50%)]">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
              {hotspots.slice(0, 8).map((h, i) => (
                <div key={h.id} className="absolute" style={{ left: `${20 + (i * 11) % 70}%`, top: `${15 + (i * 17) % 70}%` }}>
                  <div className="relative">
                    <div className={`size-3 rounded-full ${h.riskScore > 80 ? "bg-destructive" : "bg-warning"} animate-ping absolute inset-0`} />
                    <div className={`size-3 rounded-full ${h.riskScore > 80 ? "bg-destructive" : "bg-warning"} relative`} />
                  </div>
                </div>
              ))}
              <div className="absolute bottom-2 left-2 flex gap-2 text-[10px] bg-black/40 backdrop-blur px-2 py-1 rounded">
                <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-destructive" />Critical</span>
                <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-warning" />Elevated</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

function Kpi({ icon, label, value, delta, tone }: { icon: React.ReactNode; label: string; value: number | string; delta: string; tone: "success" | "danger" | "warning" | "info" }) {
  const toneMap = {
    success: "text-success",
    danger: "text-destructive",
    warning: "text-warning",
    info: "text-primary",
  };
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={`size-8 rounded-md bg-secondary/60 border border-border flex items-center justify-center ${toneMap[tone]}`}>
            {icon}
          </div>
          <div className="text-[10px] text-muted-foreground font-mono">{delta}</div>
        </div>
        <div className="text-2xl font-semibold tracking-tight tabular-nums">{typeof value === "number" ? value.toLocaleString() : value}</div>
        <div className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Registered": "bg-primary/15 text-primary border-primary/30",
    "Under Investigation": "bg-warning/15 text-warning border-warning/30",
    "Chargesheeted": "bg-success/15 text-success border-success/30",
    "Closed": "bg-muted text-muted-foreground border-border",
    "Cold Case": "bg-destructive/15 text-destructive border-destructive/30",
  };
  return <Badge variant="outline" className={`text-[10px] shrink-0 ${map[status] ?? ""}`}>{status}</Badge>;
}
