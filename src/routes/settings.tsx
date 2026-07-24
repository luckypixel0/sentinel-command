import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SentinelAI" },
      { name: "description", content: "Profile, security, notifications and platform preferences." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <PageContainer>
      <PageHeader eyebrow="Account" title="Settings" description="Manage your profile, security preferences, and notification behaviour." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-full bg-primary/20 border border-primary/40 text-primary text-lg font-semibold flex items-center justify-center">{user.avatarInitials}</div>
                <div>
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.role} · {user.badgeNumber}</div>
                  <Badge variant="outline" className="text-[10px] mt-1">Verified officer</Badge>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Full name" defaultValue={user.name} />
                <Field label="Badge number" defaultValue={user.badgeNumber} readOnly />
                <Field label="Email" defaultValue={user.email} />
                <Field label="District" defaultValue={user.district} />
                <Field label="Station" defaultValue={user.station} />
                <Field label="Phone" defaultValue="+91 98450 12345" />
              </div>
              <div className="flex justify-end">
                <Button size="sm" onClick={() => toast.success("Profile updated")}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Security</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <SwitchRow label="Two-factor authentication" description="Require OTP on every sign-in from a new device." defaultOn />
              <SwitchRow label="Session timeout" description="Auto sign-out after 30 minutes of inactivity." defaultOn />
              <SwitchRow label="Biometric unlock" description="Use fingerprint on registered mobile device." defaultOn={false} />
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Current password" type="password" />
                <Field label="New password" type="password" />
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm">Change Password</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <SwitchRow label="Critical AI alerts" description="Real-time pushes for critical alerts." defaultOn />
              <SwitchRow label="New FIR assignments" description="Notify when a case is assigned to me." defaultOn />
              <SwitchRow label="Weekly intelligence brief" description="Deliver Monday 08:00 IST via email." defaultOn />
              <SwitchRow label="System maintenance updates" defaultOn={false} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Session</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-xs">
              <Row k="Signed in" v="Today, 09:14 IST" />
              <Row k="IP address" v="10.24.18.42" />
              <Row k="Device" v="Windows · Edge 129" />
              <Row k="Region" v="Bengaluru, KA" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Data & Privacy</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>All activity is logged for audit compliance per Karnataka State Police IT policy. Personal data is encrypted at rest.</p>
              <Button variant="outline" size="sm" className="w-full mt-2">Download my activity log</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Platform</CardTitle></CardHeader>
            <CardContent className="space-y-1.5 text-xs">
              <Row k="Version" v="SentinelAI v2.4.1" />
              <Row k="Backend" v="Zoho Catalyst · Ready" />
              <Row k="Status" v={<span className="text-success">Operational</span>} />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function Field({ label, defaultValue, readOnly, type }: { label: string; defaultValue?: string; readOnly?: boolean; type?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input defaultValue={defaultValue} readOnly={readOnly} type={type} className="h-9" />
    </div>
  );
}
function SwitchRow({ label, description, defaultOn }: { label: string; description?: string; defaultOn?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-sm">{label}</div>
        {description && <div className="text-[11px] text-muted-foreground mt-0.5">{description}</div>}
      </div>
      <Switch defaultChecked={defaultOn} />
    </div>
  );
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span>{v}</span>
    </div>
  );
}
