import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { mockService } from "@/services/mock";
import { PageContainer, PageHeader } from "@/components/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar, PolarAngleAxis, Cell } from "recharts";
import { Download, TrendingUp, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Crime Analytics — SentinelAI" },
      { name: "description", content: "Multi-dimensional crime analytics for Karnataka: trends, categories, district performance and clearance rates." },
      { property: "og:title", content: "Crime Analytics — SentinelAI" },
      { property: "og:description", content: "Multi-dimensional crime analytics and district performance." },
    ],
  }),
  component: AnalyticsPage,
});

const COLORS = ["#2563EB", "#22C55E", "#F59E0B", "#EF4444", "#A855F7", "#06B6D4"];

function AnalyticsPage() {
  const [range, setRange] = useState("30d");
  const { data: trend = [] } = useQuery({ queryKey: ["trend"], queryFn: () => mockService.trendData() });
  const { data: dist = [] } = useQuery({ queryKey: ["dist"], queryFn: () => mockService.crimeDistribution() });
  const { data: risk = [] } = useQuery({ queryKey: ["risk"], queryFn: () => mockService.districtRisk() });

  const clearanceData = risk.map((r, i) => ({ district: r.district, cleared: 40 + (i * 7) % 45, pending: 20 + (i * 3) % 30 }));
  const hourly = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, incidents: Math.floor(5 + Math.sin(h / 3) * 10 + Math.random() * 8) }));
  const clearanceRate = 68;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Analytics"
        title="Crime Analytics"
        description="State-wide crime patterns, district performance, temporal trends and clearance rates."
        actions={
          <>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last quarter</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm"><Download className="size-4" />Export</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total FIRs" value="12,486" delta="+8.2%" up />
        <StatCard label="Clearance Rate" value="68%" delta="+3.1%" up />
        <StatCard label="Avg Response Time" value="14m" delta="-2m" up />
        <StatCard label="Repeat Offender Ratio" value="12.4%" delta="+0.8%" up={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Trend · FIRs vs Arrests vs Closures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer>
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#2563EB" stopOpacity={0.4} /><stop offset="100%" stopColor="#2563EB" stopOpacity={0} /></linearGradient>
                    <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#22C55E" stopOpacity={0.4} /><stop offset="100%" stopColor="#22C55E" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="firs" stroke="#2563EB" fill="url(#g1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="arrests" stroke="#22C55E" fill="url(#g2)" strokeWidth={2} />
                  <Line type="monotone" dataKey="closed" stroke="#F59E0B" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Overall Clearance</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer>
                <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: "Cleared", value: clearanceRate }]} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background dataKey="value" fill="#22C55E" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center -mt-32 pointer-events-none">
              <div className="text-3xl font-semibold">{clearanceRate}%</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Cases Cleared</div>
            </div>
            <div className="mt-24 grid grid-cols-3 gap-2 text-center text-xs">
              <div><div className="font-semibold">8,494</div><div className="text-muted-foreground text-[10px]">Cleared</div></div>
              <div><div className="font-semibold">3,241</div><div className="text-muted-foreground text-[10px]">Pending</div></div>
              <div><div className="font-semibold">751</div><div className="text-muted-foreground text-[10px]">Cold</div></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Crime by Category</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={dist} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={90} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {dist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Incidents by Hour of Day</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={hourly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} interval={2} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="incidents" stroke="#EF4444" strokeWidth={2} dot={{ r: 3, fill: "#EF4444" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">District Performance · Cleared vs Pending</CardTitle></CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={clearanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="district" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="cleared" stackId="a" fill="#22C55E" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function StatCard({ label, value, delta, up }: { label: string; value: string; delta: string; up: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</div>
        <div className="text-2xl font-semibold mt-2 tabular-nums">{value}</div>
        <div className="flex items-center gap-1 mt-1 text-xs">
          {up ? <TrendingUp className="size-3 text-success" /> : <TrendingDown className="size-3 text-destructive" />}
          <span className={up ? "text-success" : "text-destructive"}>{delta}</span>
          <span className="text-muted-foreground">vs prev period</span>
        </div>
      </CardContent>
    </Card>
  );
}
