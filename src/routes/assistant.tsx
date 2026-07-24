import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/page";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { Bot, Send, Sparkles, User as UserIcon, FileText, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { mockService } from "@/services/mock";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — SentinelAI" },
      { name: "description", content: "Conversational AI for crime intelligence: case summaries, connected suspects, hotspots and investigation reports." },
      { property: "og:title", content: "AI Assistant — SentinelAI" },
      { property: "og:description", content: "Conversational AI for crime intelligence and investigation." },
    ],
  }),
  component: AssistantPage,
});

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  response?: AssistantResponse;
  streaming?: boolean;
}

interface AssistantResponse {
  summary: string;
  matchingCases: { fir: string; type: string; district: string; date: string }[];
  timeline: { date: string; event: string }[];
  relatedFirs: string[];
  pattern: string;
  recommendation: string;
  confidence: number;
  evidence: string[];
}

const SUGGESTED = [
  "Show robbery cases in Mysuru involving repeat offenders in the last 6 months",
  "Summarize FIR 003/2025/0089",
  "Find connected suspects between Cubbon Park PS and Devaraja PS",
  "Show hotspot prediction for Bengaluru Urban next 7 days",
  "Find similar cases to the Ashok Nagar assault last week",
  "Generate investigation report for narcotics operations in Q3",
];

function AssistantPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      setInput(q);
      setTimeout(() => submit(q), 200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const submit = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text };
    const asstId = `a-${Date.now()}`;
    setMessages((m) => [...m, userMsg, { id: asstId, role: "assistant", text: "", streaming: true }]);
    setInput("");

    await new Promise((r) => setTimeout(r, 900));
    const firs = await mockService.listFIRs();
    const sample = firs.slice(0, 4);
    const resp: AssistantResponse = {
      summary: `Analysis of "${text}" — 4 matching cases identified across 2 jurisdictions. Pattern analysis indicates coordinated activity with 78% confidence. Two accused persons appear in multiple linked FIRs, suggesting a repeat offender cluster. Recommend joint task force with adjacent stations.`,
      matchingCases: sample.map((f) => ({ fir: f.firNumber, type: f.crimeType, district: f.location.district, date: new Date(f.registeredAt).toLocaleDateString() })),
      timeline: [
        { date: "2025-08-14", event: "First linked incident registered at Devaraja PS" },
        { date: "2025-09-02", event: "Second similar MO reported 3 km away" },
        { date: "2025-09-21", event: "CCTV correlation identified via image intelligence" },
        { date: "2025-10-10", event: "Suspect network mapped, 3 associates identified" },
      ],
      relatedFirs: sample.map((f) => f.firNumber),
      pattern: "Late-night high-value theft targeting commercial establishments. MO involves reconnaissance 24–48 hours prior and rapid entry via rear access.",
      recommendation: "Deploy plainclothes surveillance at 4 identified locations between 22:00–02:00. Initiate cross-jurisdiction coordination with Devaraja PS and Cubbon Park PS. Prioritise identification of vehicle KA-05-BB-4592.",
      confidence: 78,
      evidence: ["12 FIR records", "34 CCTV frames analysed", "Vehicle license correlation", "4 prior arrest records", "Cellular tower log matches"],
    };

    setMessages((m) =>
      m.map((msg) => msg.id === asstId ? { ...msg, streaming: false, text: resp.summary, response: resp } : msg),
    );
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <PageContainer className="pb-0 shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-md bg-primary/20 border border-primary/40 flex items-center justify-center">
            <Bot className="size-5 text-primary" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-primary font-semibold flex items-center gap-1.5">
              <Sparkles className="size-3" />SentinelAI Assistant
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Ask anything about crime intelligence</h1>
          </div>
        </div>
      </PageContainer>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <PageContainer>
          {messages.length === 0 && (
            <div className="mt-8">
              <div className="text-xs text-muted-foreground mb-3 uppercase tracking-widest font-semibold">Try asking</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {SUGGESTED.map((s) => (
                  <button key={s} onClick={() => submit(s)} className="text-left p-3 rounded-md border border-border/60 hover:border-primary/40 hover:bg-secondary/40 transition-colors text-sm group flex items-center justify-between gap-2">
                    <span className="flex-1">{s}</span>
                    <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6 pb-6">
            {messages.map((m) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {m.role === "user" ? (
                  <div className="flex gap-3">
                    <div className="size-8 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0"><UserIcon className="size-4" /></div>
                    <div className="flex-1 pt-1"><p className="text-sm">{m.text}</p></div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className="size-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0"><Bot className="size-4 text-primary" /></div>
                    <div className="flex-1 space-y-4">
                      {m.streaming ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="size-4 animate-spin" />Analysing intelligence sources…
                        </div>
                      ) : m.response ? (
                        <ResponseCard response={m.response} />
                      ) : (
                        <p className="text-sm">{m.text}</p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </PageContainer>
      </div>

      <div className="border-t border-border bg-card/40 backdrop-blur shrink-0">
        <PageContainer className="py-4">
          <form
            onSubmit={(e) => { e.preventDefault(); submit(input); }}
            className="flex items-end gap-2"
          >
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about cases, suspects, hotspots, or request an investigation report…"
              className="min-h-[52px] max-h-32 resize-none bg-background"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(input); } }}
            />
            <Button type="submit" size="lg" disabled={!input.trim()}><Send className="size-4" />Send</Button>
          </form>
          <div className="text-[10px] text-muted-foreground mt-2 text-center">SentinelAI provides intelligence based on available records. Verify findings before operational action.</div>
        </PageContainer>
      </div>
    </div>
  );
}

function ResponseCard({ response }: { response: AssistantResponse }) {
  return (
    <div className="space-y-3">
      <Card className="border-primary/25 bg-gradient-to-br from-primary/10 to-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-[10px] uppercase tracking-widest text-primary font-semibold">Executive Summary</div>
            <Badge variant="outline" className="text-[10px] text-success border-success/30 bg-success/10 ml-auto">{response.confidence}% confidence</Badge>
          </div>
          <p className="text-sm">{response.summary}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Matching Cases</div>
            <div className="space-y-1.5">
              {response.matchingCases.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-xs p-2 rounded border border-border/50 hover:border-primary/30 hover:bg-secondary/40">
                  <FileText className="size-3 text-primary" />
                  <code className="text-primary font-mono">{c.fir}</code>
                  <Badge variant="outline" className="text-[10px] ml-auto">{c.type}</Badge>
                  <span className="text-muted-foreground text-[10px]">{c.district}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Timeline</div>
            <div className="space-y-2">
              {response.timeline.map((t, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <div className="text-muted-foreground text-[10px] font-mono">{t.date}</div>
                    <div>{t.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Crime Pattern</div>
            <p className="text-xs">{response.pattern}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-[10px] uppercase tracking-widest text-warning font-semibold mb-2">Recommendation</div>
            <p className="text-xs">{response.recommendation}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Evidence Used</div>
          <div className="flex flex-wrap gap-1.5">
            {response.evidence.map((e) => <Badge key={e} variant="outline" className="text-[10px]">{e}</Badge>)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
