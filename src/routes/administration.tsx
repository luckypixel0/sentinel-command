import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_USERS, mockService } from "@/services/mock";
import { useQuery } from "@tanstack/react-query";
import { Users, Shield, Activity, Key, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/administration")({
  head: () => ({
    meta: [
      { title: "Administration — SentinelAI" },
      { name: "description", content: "User management, roles, permissions and full audit trail for the SentinelAI platform." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const PERMISSIONS = [
  { key: "case.view", label: "View Cases", roles: ["Investigation Officer", "SHO", "SP", "DCP", "Commissioner"] },
  { key: "case.edit", label: "Edit Cases", roles: ["Investigation Officer", "SHO"] },
  { key: "case.delete", label: "Delete Cases", roles: ["Commissioner"] },
  { key: "ai.query", label: "Run AI Queries", roles: ["Investigation Officer", "SHO", "SP", "DCP", "Commissioner"] },
  { key: "reports.generate", label: "Generate Reports", roles: ["SHO", "SP", "DCP", "Commissioner"] },
  { key: "users.manage", label: "Manage Users", roles: ["Administrator"] },
  { key: "audit.view", label: "View Audit Logs", roles: ["Administrator", "Commissioner"] },
];

function AdminPage() {
  const { data: audit = [] } = useQuery({ queryKey: ["audit"], queryFn: () => mockService.listAudit() });

  return (
    <PageContainer>
      <PageHeader
        eyebrow="System"
        title="Administration"
        description="Manage users, roles, permissions and review the full audit trail of the platform."
        actions={<Button size="sm"><Plus className="size-4" />Add User</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Users className="size-4" />} label="Total Users" value={MOCK_USERS.length} />
        <StatCard icon={<Shield className="size-4" />} label="Active Roles" value={6} />
        <StatCard icon={<Activity className="size-4" />} label="Audit Events (24h)" value={audit.length} />
        <StatCard icon={<Key className="size-4" />} label="Failed Logins" value={2} />
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="system">System Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border/60 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                <div className="col-span-3">User</div>
                <div className="col-span-2">Badge</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-2">District</div>
                <div className="col-span-2">Station</div>
                <div className="col-span-1 text-right">Status</div>
              </div>
              <div className="divide-y divide-border/60">
                {MOCK_USERS.map((u) => (
                  <div key={u.id} className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-secondary/40 items-center text-sm">
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="size-8 rounded-full bg-primary/15 border border-primary/25 text-primary text-xs font-semibold flex items-center justify-center">{u.avatarInitials}</div>
                      <div>
                        <div>{u.name}</div>
                        <div className="text-[11px] text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                    <div className="col-span-2"><code className="text-[11px] font-mono">{u.badgeNumber}</code></div>
                    <div className="col-span-2"><Badge variant="outline" className="text-[10px]">{u.role}</Badge></div>
                    <div className="col-span-2 text-xs">{u.district}</div>
                    <div className="col-span-2 text-xs text-muted-foreground">{u.station}</div>
                    <div className="col-span-1 text-right"><Badge variant="outline" className="text-[10px] text-success border-success/30 bg-success/10">Active</Badge></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Permission Matrix</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {PERMISSIONS.map((p) => (
                  <div key={p.key} className="p-3 rounded-md border border-border/60">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-sm font-medium">{p.label}</div>
                        <code className="text-[10px] text-muted-foreground font-mono">{p.key}</code>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {p.roles.map((r) => <Badge key={r} variant="outline" className="text-[10px] text-primary border-primary/30">{r}</Badge>)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border/60 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                <div className="col-span-2">Actor</div>
                <div className="col-span-3">Action</div>
                <div className="col-span-3">Target</div>
                <div className="col-span-2">IP</div>
                <div className="col-span-2 text-right">When</div>
              </div>
              <div className="divide-y divide-border/60 max-h-[500px] overflow-y-auto">
                {audit.map((a) => (
                  <div key={a.id} className="grid grid-cols-12 gap-4 px-4 py-2.5 text-xs items-center">
                    <div className="col-span-2 font-mono">{a.actor}</div>
                    <div className="col-span-3">{a.action}</div>
                    <div className="col-span-3 text-muted-foreground">{a.target}</div>
                    <div className="col-span-2 font-mono text-muted-foreground text-[11px]">{a.ip}</div>
                    <div className="col-span-2 text-right text-muted-foreground text-[11px]">{formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SysCard label="API Latency" value="42ms" tone="success" />
            <SysCard label="DB Load" value="18%" tone="success" />
            <SysCard label="AI Gateway" value="Operational" tone="success" />
            <SysCard label="Storage" value="342 GB / 2 TB" tone="info" />
            <SysCard label="Active Sessions" value="87" tone="info" />
            <SysCard label="Uptime" value="99.98%" tone="success" />
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-[10px] uppercase tracking-widest font-semibold">{icon}{label}</div>
        <div className="text-2xl font-semibold mt-2 tabular-nums">{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  );
}
function SysCard({ label, value, tone }: { label: string; value: string; tone: "success" | "info" }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</div>
        <div className={`text-lg font-semibold mt-1 ${tone === "success" ? "text-success" : "text-primary"}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
