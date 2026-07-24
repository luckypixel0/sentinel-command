import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { mockService } from "@/services/mock";
import { PageContainer, PageHeader } from "@/components/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, MapPin, User as UserIcon, Users, Gavel, Shield, FileText,
  Sparkles, Calendar, Building2, Landmark, Fingerprint, AlertCircle, Download,
} from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/investigation/$firId")({
  head: ({ params }) => ({
    meta: [
      { title: `Case ${params.firId} — SentinelAI` },
      { name: "description", content: `Case file, timeline, entities and AI investigation summary for ${params.firId}.` },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: async ({ params }) => {
    const fir = await mockService.getFIR(params.firId);
    if (!fir) throw notFound();
    return { fir };
  },
  component: CaseDetail,
});

function CaseDetail() {
  const { fir } = Route.useLoaderData();
  const { data: allFirs = [] } = useQuery({ queryKey: ["firs"], queryFn: () => mockService.listFIRs() });
  const related = allFirs.filter((f) => fir.relatedFirIds.includes(f.id)).slice(0, 5);

  return (
    <PageContainer>
      <Button variant="ghost" size="sm" asChild className="mb-3">
        <Link to="/investigation"><ArrowLeft className="size-3.5" />Back to Cases</Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <code className="text-primary font-mono text-sm">{fir.firNumber}</code>
            <span>·</span>
            <Badge variant="outline">{fir.crimeType}</Badge>
            <Badge variant="outline" className={
              fir.priority === "Critical" ? "text-destructive border-destructive/30" :
              fir.priority === "High" ? "text-warning border-warning/30" :
              "text-primary border-primary/30"
            }>{fir.priority} priority</Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{fir.crimeType} · {fir.location.district}</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{fir.summary}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Download className="size-4" />Case File</Button>
          <Button size="sm"><Sparkles className="size-4" />AI Summary</Button>
        </div>
      </div>

      {/* Meta strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <MetaCard label="Registered" value={format(new Date(fir.registeredAt), "dd MMM yyyy")} icon={<Calendar className="size-4" />} />
        <MetaCard label="Station" value={fir.station.name} icon={<Building2 className="size-4" />} />
        <MetaCard label="Status" value={fir.status} icon={<AlertCircle className="size-4" />} />
        <MetaCard label="Evidence" value={`${fir.evidenceCount} items`} icon={<Fingerprint className="size-4" />} />
        <MetaCard label="Related FIRs" value={String(fir.relatedFirIds.length)} icon={<FileText className="size-4" />} />
      </div>

      {/* AI intel banner */}
      <Card className="border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card mb-6">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-md bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
              <Sparkles className="size-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-sm font-semibold">AI Investigation Summary</div>
                <Badge variant="outline" className="text-[10px] text-success border-success/30 bg-success/10">
                  {fir.aiConfidence}% confidence
                </Badge>
              </div>
              <p className="text-sm text-foreground/90">{fir.aiSummary}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {fir.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px] font-mono lowercase text-muted-foreground">#{t}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Tabs */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="entities">Entities</TabsTrigger>
              <TabsTrigger value="acts">Acts & Court</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
              <TabsTrigger value="related">Related ({related.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <Card>
                <CardContent className="p-6">
                  <div className="relative pl-6">
                    <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
                    {fir.timeline.map((t) => (
                      <div key={t.id} className="relative mb-6 last:mb-0">
                        <div className="absolute -left-[19px] top-1.5 size-3 rounded-full bg-primary ring-4 ring-background" />
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {format(new Date(t.date), "dd MMM yyyy · HH:mm")}
                        </div>
                        <div className="text-sm font-medium mt-0.5">{t.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{t.description}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="entities">
              <div className="grid gap-4">
                <PersonList title="Complainant" people={[fir.complainant]} icon={<UserIcon className="size-4" />} />
                <PersonList title="Victims" people={fir.victims} icon={<Users className="size-4" />} />
                <PersonList title="Accused" people={fir.accused} icon={<Shield className="size-4" />} />
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><Shield className="size-4" />Investigating Officers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {fir.officers.map((o) => (
                      <div key={o.id} className="flex items-center gap-3 p-2 rounded-md border border-border/60">
                        <div className="size-8 rounded-full bg-primary/15 border border-primary/25 text-primary text-xs font-semibold flex items-center justify-center">
                          {o.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm">{o.name}</div>
                          <div className="text-[11px] text-muted-foreground">{o.rank} · {o.badgeNumber} · {o.station}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="acts">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Gavel className="size-4" />Acts & Sections</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {fir.acts.map((a, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-md border border-border/60">
                        <Badge variant="outline" className="font-mono">{a.act} §{a.section}</Badge>
                        <div className="text-sm text-muted-foreground">{a.description}</div>
                      </div>
                    ))}
                  </div>
                  {fir.court && (
                    <>
                      <Separator className="my-4" />
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3 flex items-center gap-1.5">
                        <Landmark className="size-3" />Court
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <MetaCard label="Court" value={fir.court.name} />
                        <MetaCard label="Case Number" value={fir.court.caseNumber ?? "—"} />
                        <MetaCard label="Court Status" value={fir.court.status} />
                        <MetaCard label="Next Hearing" value={fir.court.nextHearing ? format(new Date(fir.court.nextHearing), "dd MMM yyyy") : "—"} />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evidence">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Fingerprint className="size-4" />Evidence Summary</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["CCTV Footage", "Fingerprint Lifts", "Witness Statements", "Digital Forensics", "Physical Exhibits", "Call Records", "Forensic Reports", "Photographs"].slice(0, Math.min(8, fir.evidenceCount)).map((e) => (
                      <div key={e} className="p-3 rounded-md border border-border/60 bg-secondary/30">
                        <div className="text-xs font-medium">{e}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">Chain of custody verified</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="related">
              <Card>
                <CardContent className="p-0 divide-y divide-border/60">
                  {related.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No related cases identified.</div>}
                  {related.map((r) => (
                    <Link key={r.id} to="/investigation/$firId" params={{ firId: r.id }} className="flex items-center gap-4 p-4 hover:bg-secondary/40">
                      <code className="text-[11px] text-primary font-mono w-32 shrink-0">{r.firNumber}</code>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm line-clamp-1">{r.summary}</div>
                        <div className="text-[11px] text-muted-foreground">{r.station.name} · {r.location.district}</div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{r.crimeType}</Badge>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Location + quick facts */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><MapPin className="size-4" />Location</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">{fir.location.address}</div>
              <div className="text-xs text-muted-foreground">{fir.location.taluk}, {fir.location.district}</div>
              <div className="rounded-md border border-border/60 h-40 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.2),transparent_60%)] relative flex items-center justify-center">
                <div className="size-3 rounded-full bg-destructive relative">
                  <div className="absolute inset-0 rounded-full bg-destructive animate-ping" />
                </div>
                <div className="absolute bottom-2 left-2 text-[10px] font-mono text-muted-foreground">
                  {fir.location.lat.toFixed(4)}, {fir.location.lng.toFixed(4)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Building2 className="size-4" />Police Station</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>{fir.station.name}</div>
              <div className="text-xs text-muted-foreground">Incharge: {fir.station.incharge}</div>
              <div className="text-xs text-muted-foreground">Contact: {fir.station.contact}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function MetaCard({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border/60 bg-card/50 p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
        {icon}{label}
      </div>
      <div className="text-sm font-medium mt-1">{value}</div>
    </div>
  );
}

function PersonList({ title, people, icon }: { title: string; people: { id: string; name: string; age: number; gender: string; address: string; phone?: string }[]; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2">{icon}{title} ({people.length})</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {people.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-2 rounded-md border border-border/60">
            <div className="size-8 rounded-full bg-secondary/60 border border-border text-xs font-semibold flex items-center justify-center">
              {p.name.split(" ").map(n => n[0]).join("").slice(0,2)}
            </div>
            <div className="flex-1">
              <div className="text-sm">{p.name}</div>
              <div className="text-[11px] text-muted-foreground">{p.age}y · {p.gender} · {p.address}</div>
            </div>
            {p.phone && <code className="text-[11px] text-muted-foreground font-mono">{p.phone}</code>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
