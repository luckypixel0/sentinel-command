import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/page";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { mockService } from "@/services/mock";
import { MapPin, Layers, Filter, Info } from "lucide-react";
import type { CrimeType } from "@/types";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Crime Map — SentinelAI" },
      { name: "description", content: "Interactive Karnataka crime map with heatmap overlays, district and station filters." },
      { property: "og:title", content: "Crime Map — SentinelAI" },
      { property: "og:description", content: "Interactive Karnataka crime map with heatmap overlays." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [district, setDistrict] = useState("all");
  const [crimeType, setCrimeType] = useState("all");
  const [range, setRange] = useState("30d");
  void range;

  const { data: firs = [] } = useQuery({ queryKey: ["firs"], queryFn: () => mockService.listFIRs() });
  const { data: hotspots = [] } = useQuery({ queryKey: ["hotspots"], queryFn: () => mockService.listHotspots() });

  const filtered = useMemo(() => firs.filter((f) => {
    if (district !== "all" && f.location.district !== district) return false;
    if (crimeType !== "all" && f.crimeType !== crimeType) return false;
    return true;
  }), [firs, district, crimeType]);

  return (
    <PageContainer className="max-w-none">
      <PageHeader
        eyebrow="Geospatial"
        title="Crime Map"
        description="Live incident geography across Karnataka with hotspot overlays and cluster analysis."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 space-y-3">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                <Filter className="size-3" />Filters
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">District</div>
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All districts</SelectItem>
                    {mockService.DISTRICTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Crime Type</div>
                <Select value={crimeType} onValueChange={setCrimeType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {mockService.CRIME_TYPES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Police Station</div>
                <Select defaultValue="all">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All stations</SelectItem>
                    {mockService.STATIONS.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Time Range</div>
                <Select value={range} onValueChange={setRange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                <Layers className="size-3" />Overlays
              </div>
              <ToggleRow label="Incident markers" defaultOn />
              <ToggleRow label="Hotspot heatmap" defaultOn />
              <ToggleRow label="Cluster grouping" defaultOn />
              <ToggleRow label="Police stations" defaultOn={false} />
              <ToggleRow label="Patrol routes" defaultOn={false} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                <Info className="size-3" />Legend
              </div>
              <LegendRow color="#EF4444" label="Critical hotspot (>80)" />
              <LegendRow color="#F59E0B" label="Elevated risk (60–80)" />
              <LegendRow color="#22C55E" label="Normal" />
              <LegendRow color="#2563EB" label="FIR marker" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Incidents rendered</span>
                <Badge variant="outline">{filtered.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Hotspots</span>
                <Badge variant="outline">{hotspots.length}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="h-[calc(100vh-16rem)] min-h-[500px] relative">
                {mounted ? <LeafletMap firs={filtered} hotspots={hotspots} /> : <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Loading map…</div>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function LeafletMap({ firs, hotspots }: { firs: { id: string; firNumber: string; location: { lat: number; lng: number; district: string }; crimeType: CrimeType; summary: string }[]; hotspots: { id: string; lat: number; lng: number; area: string; riskScore: number; crimeType: CrimeType }[] }) {
  // Dynamic import
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: React.ComponentType<React.PropsWithChildren<Record<string, unknown>>>;
    TileLayer: React.ComponentType<Record<string, unknown>>;
    CircleMarker: React.ComponentType<React.PropsWithChildren<Record<string, unknown>>>;
    Popup: React.ComponentType<React.PropsWithChildren<Record<string, unknown>>>;
    Circle: React.ComponentType<React.PropsWithChildren<Record<string, unknown>>>;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const mod = await import("react-leaflet");
      setMapComponents({
        MapContainer: mod.MapContainer as unknown as React.ComponentType<React.PropsWithChildren<Record<string, unknown>>>,
        TileLayer: mod.TileLayer as unknown as React.ComponentType<Record<string, unknown>>,
        CircleMarker: mod.CircleMarker as unknown as React.ComponentType<React.PropsWithChildren<Record<string, unknown>>>,
        Popup: mod.Popup as unknown as React.ComponentType<React.PropsWithChildren<Record<string, unknown>>>,
        Circle: mod.Circle as unknown as React.ComponentType<React.PropsWithChildren<Record<string, unknown>>>,
      });
    })();
  }, []);

  if (!MapComponents) return <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Initialising map…</div>;
  const { MapContainer, TileLayer, CircleMarker, Popup, Circle } = MapComponents;

  return (
    <MapContainer center={mockService.KARNATAKA_CENTER as unknown as [number, number]} zoom={7} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
      {hotspots.map((h) => (
        <Circle key={h.id} center={[h.lat, h.lng]} radius={20000} pathOptions={{ color: h.riskScore > 80 ? "#EF4444" : "#F59E0B", fillOpacity: 0.15, weight: 1 }}>
          <Popup>
            <div style={{ fontSize: 12 }}>
              <strong>{h.area}</strong><br />
              {h.crimeType} · Risk {h.riskScore}
            </div>
          </Popup>
        </Circle>
      ))}
      {firs.map((f) => (
        <CircleMarker key={f.id} center={[f.location.lat, f.location.lng]} radius={5} pathOptions={{ color: "#2563EB", fillColor: "#2563EB", fillOpacity: 0.7, weight: 1 }}>
          <Popup>
            <div style={{ fontSize: 12, maxWidth: 220 }}>
              <strong>{f.firNumber}</strong><br />
              {f.crimeType} · {f.location.district}<br />
              <span style={{ color: "#64748b" }}>{f.summary}</span>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

function ToggleRow({ label, defaultOn }: { label: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn(!on)} className="flex items-center justify-between w-full py-1 text-xs hover:text-foreground text-left">
      <span className={on ? "text-foreground" : "text-muted-foreground"}>{label}</span>
      <span className={`w-8 h-4 rounded-full relative transition-colors ${on ? "bg-primary" : "bg-border"}`}>
        <span className={`absolute top-0.5 size-3 rounded-full bg-white transition-all ${on ? "left-4" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="size-2 rounded-full" style={{ background: color }} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

void MapPin;
