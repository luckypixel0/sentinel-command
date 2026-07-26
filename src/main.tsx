import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route as RRRoute, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";

import "./styles.css";
import { AuthProvider, useAuth } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { useLocation, useNavigate } from "react-router-dom";

// Route modules
import { Route as IndexRoute } from "@/routes/index";
import { Route as AdministrationRoute } from "@/routes/administration";
import { Route as AnalyticsRoute } from "@/routes/analytics";
import { Route as AssistantRoute } from "@/routes/assistant";
import { Route as ForgotPasswordRoute } from "@/routes/forgot-password";
import { Route as IntelligenceRoute } from "@/routes/intelligence";
import { Route as LoginRoute } from "@/routes/login";
import { Route as MapRoute } from "@/routes/map";
import { Route as PredictionsRoute } from "@/routes/predictions";
import { Route as ReportsRoute } from "@/routes/reports";
import { Route as SettingsRoute } from "@/routes/settings";
import { Route as InvestigationIndexRoute } from "@/routes/investigation.index";
import { Route as InvestigationFirIdRoute } from "@/routes/investigation.$firId";

const queryClient = new QueryClient();
(globalThis as any).__sentinelQueryClient = queryClient;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="text-[11px] uppercase tracking-widest text-primary font-semibold">SentinelAI</div>
        <h1 className="text-7xl font-bold text-foreground mt-2">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The requested command does not exist in this operational area.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Return to Command Center
          </a>
        </div>
      </div>
    </div>
  );
}

function AuthGate({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isPublic = pathname === "/login" || pathname === "/forgot-password";

  useEffect(() => {
    if (!user && !isPublic) navigate("/login");
    if (user && isPublic) navigate("/");
  }, [user, isPublic, navigate]);

  if (!user && !isPublic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xs text-muted-foreground">Redirecting to sign-in…</div>
      </div>
    );
  }

  if (isPublic) return <>{children}</>;
  return <AppShell>{children}</AppShell>;
}

const routes = [
  IndexRoute,
  AdministrationRoute,
  AnalyticsRoute,
  AssistantRoute,
  ForgotPasswordRoute,
  IntelligenceRoute,
  LoginRoute,
  MapRoute,
  PredictionsRoute,
  ReportsRoute,
  SettingsRoute,
  InvestigationIndexRoute,
  InvestigationFirIdRoute,
];

function toRRPath(p: string) {
  // TanStack uses $param; React Router uses :param
  return p.replace(/\$([A-Za-z0-9_]+)/g, ":$1").replace(/\/$/, "") || "/";
}

function AppRoutes() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="text-xs text-muted-foreground">Loading…</div></div>}>
      <Routes>
        {routes.map((r) => {
          const C = r.component!;
          return <RRRoute key={r.path} path={toRRPath(r.path)} element={<C />} />;
        })}
        <RRRoute path="/investigation" element={<Navigate to="/investigation/" replace />} />
        <RRRoute path="*" element={<NotFoundComponent />} />
      </Routes>
    </Suspense>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AuthGate>
            <AppRoutes />
          </AuthGate>
          <Toaster theme="dark" position="top-right" richColors />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
