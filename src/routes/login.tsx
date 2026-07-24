import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — SentinelAI" },
      { name: "description", content: "Secure sign-in for authorised Karnataka State Police personnel." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(4, "Password required"),
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "io@ksp.gov.in", password: "sentinel" },
  });

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    try {
      await login(data.email, data.password);
      toast.success("Signed in", { description: "Welcome to the SentinelAI Command Center" });
      navigate({ to: "/" });
    } catch (e) {
      setError((e as Error).message);
    }
  });

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background text-foreground">
      <div className="hidden lg:flex relative flex-col justify-between p-10 bg-sidebar border-r border-border overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.15),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(34,197,94,0.08),transparent_50%)]" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="size-11 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
            <Shield className="size-6 text-primary" />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight">SentinelAI</div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Karnataka State Police</div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="text-xs uppercase tracking-widest text-primary/80 font-semibold">Command Intelligence Platform</div>
          <h2 className="text-4xl font-semibold tracking-tight leading-tight">
            Investigate faster.<br />
            <span className="text-muted-foreground">Predict smarter. Protect together.</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            AI-driven case intelligence, cross-jurisdictional linkage, predictive hotspot forecasting and secure investigation workflows — built for authorised Karnataka State Police personnel.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-4">
            {[
              { k: "12.4K", v: "Active FIRs" },
              { k: "487", v: "Districts covered" },
              { k: "99.98%", v: "Uptime SLA" },
            ].map((s) => (
              <div key={s.v} className="rounded-lg border border-border/60 bg-card/60 p-3">
                <div className="text-lg font-semibold">{s.k}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[10px] text-muted-foreground/80 uppercase tracking-widest">
          Classified · Authorised Access Only · CERT-KA Compliant
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="size-9 rounded-md bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Shield className="size-5 text-primary" />
            </div>
            <div className="text-sm font-semibold">SentinelAI</div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">Sign in to Command Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Use your official police credentials.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Official email</Label>
              <Input id="email" type="email" autoComplete="username" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
              </div>
              <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full h-10">
              {isSubmitting ? "Authenticating…" : "Sign in securely"}
            </Button>
          </form>

          <div className="mt-8 rounded-md border border-border bg-card/60 p-4">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Demo accounts · password: sentinel</div>
            <div className="grid grid-cols-1 gap-1 text-xs">
              {[
                ["io@ksp.gov.in", "Investigation Officer"],
                ["sho@ksp.gov.in", "SHO"],
                ["sp@ksp.gov.in", "SP"],
                ["commissioner@ksp.gov.in", "Commissioner"],
                ["admin@ksp.gov.in", "Administrator"],
              ].map(([e, r]) => (
                <div key={e} className="flex items-center justify-between text-muted-foreground">
                  <code className="text-[11px]">{e}</code>
                  <span className="text-[10px]">{r}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
