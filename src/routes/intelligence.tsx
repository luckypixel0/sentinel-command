import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/page";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, useState, useMemo, useEffect } from "react";
import { Network, Search, User as UserIcon, Shield, Building2, Landmark, FileText, MapPin } from "lucide-react";

export const Route = createFileRoute("/intelligence")({
  head: () => ({
    meta: [
      { title: "Criminal Intelligence — SentinelAI" },
      { name: "description", content: "Interactive relationship graph linking people, cases, officers, courts, stations and locations." },
      { property: "og:title", content: "Criminal Intelligence — SentinelAI" },
      { property: "og:description", content: "Interactive relationship graph across the crime intelligence network." },
    ],
  }),
  component: IntelligencePage,
});

type NodeType = "person" | "victim" | "accused" | "officer" | "court" | "station" | "fir" | "location";
interface Node { id: string; label: string; type: NodeType; x: number; y: number; }
interface Edge { from: string; to: string; label?: string }

const NODE_STYLE: Record<NodeType, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
  person: { color: "#94a3b8", icon: UserIcon },
  victim: { color: "#22C55E", icon: UserIcon },
  accused: { color: "#EF4444", icon: Shield },
  officer: { color: "#2563EB", icon: Shield },
  court: { color: "#A855F7", icon: Landmark },
  station: { color: "#F59E0B", icon: Building2 },
  fir: { color: "#06B6D4", icon: FileText },
  location: { color: "#EC4899", icon: MapPin },
};

const NODES: Node[] = [
  { id: "n1", label: "Ramesh Kumar", type: "accused", x: 40, y: 45 },
  { id: "n2", label: "FIR 003/2025/0089", type: "fir", x: 50, y: 30 },
  { id: "n3", label: "FIR 003/2025/0107", type: "fir", x: 60, y: 50 },
  { id: "n4", label: "Suresh Naik", type: "accused", x: 30, y: 60 },
  { id: "n5", label: "Priya Rao", type: "victim", x: 50, y: 65 },
  { id: "n6", label: "Insp. M. Prakash", type: "officer", x: 70, y: 30 },
  { id: "n7", label: "Devaraja PS", type: "station", x: 75, y: 50 },
  { id: "n8", label: "Mysuru Sessions Court", type: "court", x: 78, y: 68 },
  { id: "n9", label: "MG Road, Mysuru", type: "location", x: 40, y: 20 },
  { id: "n10", label: "Anita Rao", type: "victim", x: 20, y: 45 },
  { id: "n11", label: "FIR 003/2024/0231", type: "fir", x: 20, y: 30 },
  { id: "n12", label: "Vikram Patil", type: "accused", x: 55, y: 78 },
];

const EDGES: Edge[] = [
  { from: "n1", to: "n2", label: "named in" },
  { from: "n1", to: "n3", label: "named in" },
  { from: "n1", to: "n11", label: "prior" },
  { from: "n4", to: "n2" },
  { from: "n4", to: "n3" },
  { from: "n5", to: "n2", label: "victim" },
  { from: "n10", to: "n11", label: "victim" },
  { from: "n2", to: "n7", label: "registered at" },
  { from: "n3", to: "n7", label: "registered at" },
  { from: "n11", to: "n7" },
  { from: "n6", to: "n7", label: "assigned" },
  { from: "n6", to: "n2", label: "IO" },
  { from: "n7", to: "n8", label: "jurisdiction" },
  { from: "n2", to: "n9", label: "location" },
  { from: "n3", to: "n9" },
  { from: "n12", to: "n3", label: "co-accused" },
  { from: "n12", to: "n1", label: "associate" },
];

function IntelligencePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [selected, setSelected] = useState<Node | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const filteredNodes = useMemo(() => NODES.filter((n) => !q || n.label.toLowerCase().includes(q.toLowerCase())), [q]);
  const visibleIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = EDGES.filter(e => visibleIds.has(e.from) && visibleIds.has(e.to));

  return (
    <PageContainer className="max-w-none">
      <PageHeader
        eyebrow="Intelligence"
        title="Criminal Intelligence Graph"
        description="Cross-jurisdictional relationship network linking suspects, victims, cases, officers, courts and locations."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 space-y-3">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input placeholder="Search node…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 h-9 text-sm" />
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Node Types</div>
              <div className="space-y-1.5">
                {Object.entries(NODE_STYLE).map(([k, s]) => {
                  const Icon = s.icon;
                  return (
                    <div key={k} className="flex items-center gap-2 text-xs">
                      <div className="size-5 rounded flex items-center justify-center" style={{ backgroundColor: `${s.color}25`, border: `1px solid ${s.color}55` }}>
                        <Icon className="size-3" />
                      </div>
                      <span className="capitalize">{k}</span>
                      <span className="ml-auto text-muted-foreground text-[10px]">{NODES.filter(n => n.type === k).length}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {selected && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-md flex items-center justify-center" style={{ backgroundColor: `${NODE_STYLE[selected.type].color}25`, border: `1px solid ${NODE_STYLE[selected.type].color}55` }}>
                    <Network className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{selected.label}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{selected.type}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground pt-2 border-t border-border/60">
                  Connections: {EDGES.filter(e => e.from === selected.id || e.to === selected.id).length}
                </div>
                <Button size="sm" variant="outline" className="w-full">Open profile</Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div ref={containerRef} className="h-[calc(100vh-16rem)] min-h-[500px] relative bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.05),transparent_70%)]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />
                <svg width={size.w} height={size.h} className="absolute inset-0">
                  {filteredEdges.map((e, i) => {
                    const from = NODES.find(n => n.id === e.from);
                    const to = NODES.find(n => n.id === e.to);
                    if (!from || !to) return null;
                    const x1 = (from.x / 100) * size.w;
                    const y1 = (from.y / 100) * size.h;
                    const x2 = (to.x / 100) * size.w;
                    const y2 = (to.y / 100) * size.h;
                    return (
                      <g key={i}>
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(148,163,184,0.3)" strokeWidth={1} />
                        {e.label && (
                          <text x={(x1+x2)/2} y={(y1+y2)/2 - 4} fill="rgba(148,163,184,0.6)" fontSize={9} textAnchor="middle" style={{ userSelect: "none" }}>
                            {e.label}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
                {filteredNodes.map((n) => {
                  const style = NODE_STYLE[n.type];
                  const Icon = style.icon;
                  const isSel = selected?.id === n.id;
                  return (
                    <button
                      key={n.id}
                      onClick={() => setSelected(n)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group"
                      style={{ left: `${n.x}%`, top: `${n.y}%` }}
                    >
                      <div
                        className={`size-11 rounded-full flex items-center justify-center transition-all ${isSel ? "scale-125 ring-4 ring-primary/30" : "group-hover:scale-110"}`}
                        style={{ backgroundColor: `${style.color}25`, border: `2px solid ${style.color}` }}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div className="text-[10px] whitespace-nowrap bg-background/80 backdrop-blur px-1.5 py-0.5 rounded border border-border/60 max-w-[120px] truncate">
                        {n.label}
                      </div>
                    </button>
                  );
                })}
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant="outline" className="text-[10px] bg-background/80 backdrop-blur">{filteredNodes.length} nodes · {filteredEdges.length} edges</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
