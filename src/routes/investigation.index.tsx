import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { mockService } from "@/services/mock";
import { PageContainer, PageHeader } from "@/components/page";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download, X, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { CrimeType, CaseStatus, Priority } from "@/types";

export const Route = createFileRoute("/investigation/")({
  head: () => ({
    meta: [
      { title: "Investigation · Case Explorer — SentinelAI" },
      { name: "description", content: "Search, filter and open FIR case files with linked victims, accused, officers, evidence and court status." },
      { property: "og:title", content: "Case Explorer — SentinelAI" },
      { property: "og:description", content: "Search FIRs across Karnataka with advanced filters and AI investigation summaries." },
    ],
  }),
  component: InvestigationIndex,
});

function InvestigationIndex() {
  const [q, setQ] = useState("");
  const [district, setDistrict] = useState<string>("all");
  const [crimeType, setCrimeType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q");
    if (initial) setQ(initial);
  }, []);

  const { data: firs = [], isLoading } = useQuery({ queryKey: ["firs"], queryFn: () => mockService.listFIRs() });

  const filtered = useMemo(() => {
    return firs.filter((f) => {
      if (q) {
        const s = q.toLowerCase();
        const hit = f.firNumber.toLowerCase().includes(s) ||
          f.summary.toLowerCase().includes(s) ||
          f.location.district.toLowerCase().includes(s) ||
          f.accused.some((a) => a.name.toLowerCase().includes(s));
        if (!hit) return false;
      }
      if (district !== "all" && f.location.district !== district) return false;
      if (crimeType !== "all" && f.crimeType !== crimeType) return false;
      if (status !== "all" && f.status !== status) return false;
      if (priority !== "all" && f.priority !== priority) return false;
      return true;
    });
  }, [firs, q, district, crimeType, status, priority]);

  const activeFilters = [district !== "all", crimeType !== "all", status !== "all", priority !== "all"].filter(Boolean).length;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Investigation"
        title="Case Explorer"
        description="Search and filter FIRs across Karnataka. Open a case for the full investigation file, timeline and AI intelligence."
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="size-4" />Export</Button>
          </>
        }
      />

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search FIR number, suspect, location, keywords…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <Select value={district} onValueChange={setDistrict}>
                <SelectTrigger><SelectValue placeholder="District" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All districts</SelectItem>
                  {mockService.DISTRICTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={crimeType} onValueChange={setCrimeType}>
                <SelectTrigger><SelectValue placeholder="Crime type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {mockService.CRIME_TYPES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {mockService.STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  {(["Low","Medium","High","Critical"] as Priority[]).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {activeFilters > 0 && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/60">
              <Filter className="size-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{activeFilters} active filter{activeFilters > 1 ? "s" : ""} · {filtered.length} results</span>
              <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs" onClick={() => { setDistrict("all"); setCrimeType("all"); setStatus("all"); setPriority("all"); }}>
                <X className="size-3" />Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border/60 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            <div className="col-span-2">FIR</div>
            <div className="col-span-4">Summary</div>
            <div className="col-span-2">Location</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Priority</div>
            <div className="col-span-1 text-right">Registered</div>
          </div>
          {isLoading && <div className="p-8 text-center text-sm text-muted-foreground">Loading cases…</div>}
          {!isLoading && filtered.length === 0 && (
            <div className="p-16 text-center">
              <div className="text-sm font-medium">No matching cases</div>
              <div className="text-xs text-muted-foreground mt-1">Adjust filters or clear the search.</div>
            </div>
          )}
          <div className="divide-y divide-border/60 max-h-[600px] overflow-y-auto">
            {filtered.map((f) => (
              <Link
                key={f.id}
                to="/investigation/$firId"
                params={{ firId: f.id }}
                className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-secondary/40 items-center text-sm group"
              >
                <div className="col-span-2">
                  <code className="text-[11px] text-primary font-mono">{f.firNumber}</code>
                  <div className="text-[10px] text-muted-foreground">{f.crimeType}</div>
                </div>
                <div className="col-span-4">
                  <div className="line-clamp-1 group-hover:text-primary transition-colors">{f.summary}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{f.accused.length} accused · {f.victims.length} victim · {f.evidenceCount} evidence</div>
                </div>
                <div className="col-span-2 text-xs">
                  <div>{f.location.district}</div>
                  <div className="text-muted-foreground text-[11px]">{f.station.name}</div>
                </div>
                <div className="col-span-2"><StatusBadge status={f.status} /></div>
                <div className="col-span-1"><PriorityBadge p={f.priority} /></div>
                <div className="col-span-1 text-right text-[11px] text-muted-foreground flex items-center justify-end gap-1">
                  {formatDistanceToNow(new Date(f.registeredAt), { addSuffix: false })}
                  <ChevronRight className="size-3 opacity-40 group-hover:opacity-100" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function StatusBadge({ status }: { status: CaseStatus }) {
  const map: Record<CaseStatus, string> = {
    "Registered": "bg-primary/15 text-primary border-primary/30",
    "Under Investigation": "bg-warning/15 text-warning border-warning/30",
    "Chargesheeted": "bg-success/15 text-success border-success/30",
    "Closed": "bg-muted text-muted-foreground border-border",
    "Cold Case": "bg-destructive/15 text-destructive border-destructive/30",
  };
  return <Badge variant="outline" className={`text-[10px] ${map[status]}`}>{status}</Badge>;
}
function PriorityBadge({ p }: { p: Priority }) {
  const map: Record<Priority, string> = {
    "Low": "text-muted-foreground border-border",
    "Medium": "text-primary border-primary/30",
    "High": "text-warning border-warning/30",
    "Critical": "text-destructive border-destructive/30",
  };
  return <Badge variant="outline" className={`text-[10px] ${map[p]}`}>{p}</Badge>;
}

// Silence unused type
void ({} as CrimeType);
