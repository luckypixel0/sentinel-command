import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Sparkles, Building2, MapPin, TrendingUp, Users, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — SentinelAI" },
      { name: "description", content: "Generate intelligence, district, executive and investigation reports in PDF-ready formats." },
      { property: "og:title", content: "Reports — SentinelAI" },
      { property: "og:description", content: "PDF-ready intelligence reports for command, district and investigation briefs." },
    ],
  }),
  component: ReportsPage,
});

const REPORT_TYPES = [
  { id: "intel", title: "Intelligence Report", description: "AI-generated crime intelligence brief with pattern analysis and recommendations.", icon: Sparkles, color: "text-primary", tone: "primary" },
  { id: "district", title: "District Report", description: "District-wise performance, FIR trends, arrests, clearance and hotspot summary.", icon: MapPin, color: "text-success", tone: "success" },
  { id: "executive", title: "Executive Report", description: "State-wide command summary for senior leadership with KPIs and outlook.", icon: TrendingUp, color: "text-warning", tone: "warning" },
  { id: "investigation", title: "Investigation Brief", description: "Case-specific brief compiling timeline, entities, evidence and next steps.", icon: FileText, color: "text-primary", tone: "primary" },
];

const RECENT = [
  { id: "R-482", title: "Weekly Intelligence Brief · Bengaluru Urban", type: "Intelligence", generated: "2 hours ago", pages: 12, by: "SP Anita Rao" },
  { id: "R-481", title: "District Report · Mysuru · Q3", type: "District", generated: "5 hours ago", pages: 24, by: "Insp. R. Kumar" },
  { id: "R-480", title: "Executive Summary · State-wide", type: "Executive", generated: "Yesterday", pages: 8, by: "Commissioner P. Iyer" },
  { id: "R-479", title: "Investigation Brief · FIR 003/2025/0107", type: "Investigation", generated: "Yesterday", pages: 15, by: "Insp. M. Prakash" },
  { id: "R-478", title: "Cybercrime Analysis · Hubballi-Dharwad", type: "Intelligence", generated: "2 days ago", pages: 18, by: "SHO Suresh Naik" },
];

function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);

  const generate = async (id: string, title: string) => {
    setGenerating(id);
    await new Promise((r) => setTimeout(r, 1500));
    setGenerating(null);
    toast.success("Report generated", { description: `${title} is ready for download.` });
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Reports"
        title="Report Generation"
        description="Generate PDF-ready intelligence and command reports drawn from live case data and AI analysis."
        actions={<Button variant="outline" size="sm"><FileText className="size-4" />All Templates</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {REPORT_TYPES.map((t) => {
          const Icon = t.icon;
          return (
            <Card key={t.id} className="group hover:border-primary/40 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`size-11 rounded-md bg-secondary/60 border border-border flex items-center justify-center ${t.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{t.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t.description}</div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button size="sm" onClick={() => generate(t.id, t.title)} disabled={generating === t.id}>
                        {generating === t.id ? "Generating…" : "Generate"}
                        {generating !== t.id && <ArrowRight className="size-3.5" />}
                      </Button>
                      <Button size="sm" variant="ghost">Preview</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Recent Reports</CardTitle>
          <Badge variant="outline" className="text-[10px]">Last 30 days</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {RECENT.map((r) => (
              <div key={r.id} className="flex items-center gap-4 p-4 hover:bg-secondary/40 transition-colors">
                <div className="size-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <FileText className="size-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.title}</div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                    <span><code className="text-primary">{r.id}</code></span>
                    <span>·</span>
                    <span><Users className="size-3 inline mr-0.5" />{r.by}</span>
                    <span>·</span>
                    <span>{r.pages} pages</span>
                    <span>·</span>
                    <span>{r.generated}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">{r.type}</Badge>
                <Button variant="ghost" size="sm"><Download className="size-4" /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
        <Building2 className="size-3" />
        All reports are watermarked, audit-logged, and marked <span className="text-warning font-semibold">Restricted · For Authorised Use Only</span>.
      </div>
    </PageContainer>
  );
}
