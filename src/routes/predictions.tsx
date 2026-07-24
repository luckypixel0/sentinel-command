import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { mockService } from "@/services/mock";
import { PageContainer, PageHeader } from "@/components/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, AlertTriangle, MapPin, Shield, Sparkles } from "lucide-react";

export const Route = createFileRoute("/predictions")({
  head: () => ({
    meta: [
      { title: "Predictions — SentinelAI" },
      { name: "description", content: "Predictive operations: 7-day crime forecast, risk scoring, hotspot predictions and patrol recommendations." },
      { property: "og:title", content: "Predictive Operations Center — SentinelAI" },
      { property: "og:description", content: "AI forecasting for hotspots, patrol allocation and crime trend prediction." },
    ],
  }),
  component: PredictionsPage,
});

const FORECAST = Array.from({ length: 14 }, (_, i) => {
  const past = i < 7;
  return {
    day: past ? `D-${7 - i}` : `D+${i - 6}`,
    predicted: 20 + Math.round(Math.sin(i / 2) * 8 + i * 0.5),
    actual: past ? 18 + Math.round(Math.sin(i / 2) * 8 + i * 0.5 + (Math.random() * 4 - 2)) : null,
    upper: 28 + Math.round(Math.sin(i / 2) * 8 + i * 0.5),
    lower: 12 + Math.round(Math.sin(i / 2) * 8 + i * 0.5),
  };
});

function PredictionsPage() {
  const { data: hotspots = [] } = useQuery({ queryKey: ["hotspots"], queryFn: () => mockService.listHotspots() });

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Predictive Operations"
        title="Predictive Operations Center"
        description="AI-driven crime forecasting, risk scoring, hotspot prediction and patrol recommendations for the next operational cycle."
        actions={<Button size="sm"><Sparkles className="size-4" />Regenerate Forecast</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <ForecastCard label="Forecast Accuracy" value="87%" tone="success" />
        <ForecastCard label="Predicted FIRs (7d)" value="284" tone="info" />
        <ForecastCard label="High-Risk Zones" value="6" tone="warning" />
        <ForecastCard label="Recommended Patrols" value="18" tone="info" />
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm">7-Day Crime Forecast</CardTitle>
            <div className="text-xs text-muted-foreground">Historical (solid) vs predicted (dashed) with confidence band</div>
          </div>
          <Badge variant="outline" className="text-[10px] text-success border-success/30 bg-success/10">87% confidence</Badge>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={FORECAST}>
                <defs>
                  <linearGradient id="conf" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="upper" stroke="none" fill="url(#conf)" />
                <Area type="monotone" dataKey="lower" stroke="none" fill="#17233A" />
                <Area type="monotone" dataKey="actual" stroke="#22C55E" strokeWidth={2} fill="none" />
                <Area type="monotone" dataKey="predicted" stroke="#2563EB" strokeWidth={2} strokeDasharray="4 4" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="size-4 text-warning" />High-Risk Areas</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {hotspots.map((h) => (
              <div key={h.id} className="p-3 rounded-md border border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium flex items-center gap-1.5"><MapPin className="size-3.5 text-primary" />{h.area}</div>
                    <div className="text-[11px] text-muted-foreground">{h.district} · {h.crimeType}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold tabular-nums ${h.riskScore > 80 ? "text-destructive" : "text-warning"}`}>{h.riskScore}</div>
                    <div className="text-[10px] text-muted-foreground">risk score</div>
                  </div>
                </div>
                <Progress value={h.riskScore} className="h-1.5" />
                <div className="mt-2 text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>Confidence: {h.confidence}%</span>
                  <span>Updated 12m ago</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="size-4 text-primary" />Patrol Recommendations</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {hotspots.map((h, i) => (
              <div key={h.id} className="p-3 rounded-md border border-border/60 hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Unit {String.fromCharCode(65 + i)}</div>
                  <Badge variant="outline" className="text-[10px]">
                    {["22:00–02:00", "20:00–00:00", "18:00–22:00", "00:00–04:00", "16:00–20:00", "14:00–18:00"][i % 6]}
                  </Badge>
                </div>
                <div className="text-xs text-foreground/90 mb-2">{h.recommendation}</div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span><MapPin className="size-3 inline mr-0.5" />{h.area}, {h.district}</span>
                  <span>·</span>
                  <span>{h.crimeType} priority</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs">Assign</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs">Details</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="size-4" />Trend Forecast · Category-wise</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { name: "Theft", change: 8, dir: "up" },
              { name: "Robbery", change: -3, dir: "down" },
              { name: "Cybercrime", change: 22, dir: "up" },
              { name: "Assault", change: 5, dir: "up" },
              { name: "Narcotics", change: 12, dir: "up" },
            ].map((c) => (
              <div key={c.name} className="p-3 rounded-md border border-border/60">
                <div className="text-xs text-muted-foreground">{c.name}</div>
                <div className={`text-lg font-semibold ${c.dir === "up" ? "text-destructive" : "text-success"}`}>
                  {c.dir === "up" ? "+" : ""}{c.change}%
                </div>
                <div className="text-[10px] text-muted-foreground">7-day forecast</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function ForecastCard({ label, value, tone }: { label: string; value: string; tone: "success" | "info" | "warning" }) {
  const map = { success: "text-success", info: "text-primary", warning: "text-warning" };
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</div>
        <div className={`text-3xl font-semibold mt-2 tabular-nums ${map[tone]}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
