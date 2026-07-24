import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password — SentinelAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="size-9 rounded-md bg-primary/20 border border-primary/40 flex items-center justify-center">
            <Shield className="size-5 text-primary" />
          </div>
          <div className="text-sm font-semibold">SentinelAI</div>
        </div>
        <Link to="/login" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="size-3" /> Back to sign in
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your official police email. We'll send secure reset instructions.
        </p>

        {sent ? (
          <div className="mt-8 rounded-md border border-success/30 bg-success/10 p-4 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-success mt-0.5" />
              <div>
                <div className="font-medium text-foreground">Instructions dispatched</div>
                <div className="text-xs text-muted-foreground mt-1">A password reset link has been sent to <code>{email}</code>.</div>
              </div>
            </div>
          </div>
        ) : (
          <form
            className="mt-8 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setErr(null);
              setLoading(true);
              try {
                await resetPassword(email);
                setSent(true);
              } catch (e) {
                setErr((e as Error).message);
              } finally {
                setLoading(false);
              }
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Official email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {err && <p className="text-xs text-destructive">{err}</p>}
            <Button type="submit" disabled={loading} className="w-full h-10">
              {loading ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
