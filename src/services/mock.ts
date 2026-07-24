import type {
  FIR,
  Alert,
  HotspotPrediction,
  PoliceStation,
  AuditLog,
  User,
  Role,
  CrimeType,
  CaseStatus,
  Priority,
} from "@/types";

const DISTRICTS = [
  "Bengaluru Urban",
  "Bengaluru Rural",
  "Mysuru",
  "Mangaluru",
  "Hubballi-Dharwad",
  "Belagavi",
  "Kalaburagi",
  "Tumakuru",
  "Shivamogga",
  "Vijayapura",
];

const STATIONS: PoliceStation[] = [
  { id: "PS-001", name: "Cubbon Park PS", district: "Bengaluru Urban", incharge: "Insp. R. Kumar", contact: "080-22943322" },
  { id: "PS-002", name: "Ashok Nagar PS", district: "Bengaluru Urban", incharge: "Insp. S. Naik", contact: "080-22943344" },
  { id: "PS-003", name: "Devaraja PS", district: "Mysuru", incharge: "Insp. M. Prakash", contact: "0821-2445566" },
  { id: "PS-004", name: "Mangaluru North PS", district: "Mangaluru", incharge: "Insp. A. D'Souza", contact: "0824-2445678" },
  { id: "PS-005", name: "Hubballi Central PS", district: "Hubballi-Dharwad", incharge: "Insp. P. Kulkarni", contact: "0836-2334455" },
  { id: "PS-006", name: "Belagavi City PS", district: "Belagavi", incharge: "Insp. V. Patil", contact: "0831-2456789" },
];

const CRIME_TYPES: CrimeType[] = [
  "Theft", "Robbery", "Burglary", "Assault", "Murder",
  "Cybercrime", "Narcotics", "Fraud", "Kidnapping", "Vehicle Theft",
];

const STATUSES: CaseStatus[] = ["Registered", "Under Investigation", "Chargesheeted", "Closed", "Cold Case"];
const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Critical"];

const FIRST_NAMES = ["Arjun", "Ravi", "Suresh", "Priya", "Anita", "Kiran", "Manjunath", "Deepa", "Vikram", "Meena", "Rajesh", "Lakshmi", "Ganesh", "Shobha", "Prakash"];
const LAST_NAMES = ["Kumar", "Naik", "Rao", "Patil", "Shetty", "Gowda", "Reddy", "Iyer", "Bhat", "Hegde", "Murthy", "Prasad"];

// Seeded RNG for stable data
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)]!;
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const randName = () => `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;

// Karnataka bounding box approx
const KARNATAKA_CENTER: [number, number] = [15.3173, 75.7139];
function randLocation(district: string) {
  // rough spread around Karnataka
  const lat = 12.5 + rand() * 5;
  const lng = 74.5 + rand() * 4;
  return {
    district,
    taluk: pick(["Central", "North", "South", "East", "West"]),
    address: `${randInt(1, 500)}, ${pick(["MG Road", "Church Street", "Main Road", "Ring Road", "Market Street"])}`,
    lat,
    lng,
  };
}

function randomPerson(id: string) {
  return {
    id,
    name: randName(),
    age: randInt(18, 65),
    gender: pick(["Male", "Female"]) as "Male" | "Female",
    address: `${randInt(1, 200)}, ${pick(["Layout", "Colony", "Nagar"])}, ${pick(DISTRICTS)}`,
    phone: `+91 9${randInt(100000000, 999999999)}`,
  };
}

const AI_SUMMARIES = [
  "Analysis indicates a coordinated pattern with two previously flagged suspects. CCTV timing at 22:14 aligns with a similar incident 3 blocks away.",
  "Case exhibits modus operandi consistent with a repeat offender cluster active in the district since Q1. Vehicle license plate partial match to earlier robbery.",
  "Digital evidence suggests network-based fraud linked to accounts flagged in cybercrime intelligence. Cross-jurisdiction cooperation recommended.",
  "Weapon type and injury pattern match two open cases in adjacent stations. Recommend joint task force review.",
  "Financial transaction anomalies observed 48 hours prior. Suspect has three prior linked FIRs — evidence weight is high.",
];

function generateFIR(i: number): FIR {
  const district = pick(DISTRICTS);
  const station = STATIONS.filter((s) => s.district === district)[0] ?? pick(STATIONS);
  const daysAgo = randInt(0, 180);
  const date = new Date(Date.now() - daysAgo * 86400000).toISOString();
  const numAccused = randInt(1, 4);
  const numVictims = randInt(1, 2);
  const crimeType = pick(CRIME_TYPES);
  const status = pick(STATUSES);
  const priority = pick(PRIORITIES);

  const acts = [
    { act: "IPC", section: pick(["302", "379", "392", "420", "376"]), description: "Indian Penal Code" },
    { act: "CrPC", section: pick(["154", "161", "173"]), description: "Criminal Procedure Code" },
  ];

  return {
    id: `FIR-${String(i).padStart(5, "0")}`,
    firNumber: `${station.id.slice(-3)}/${new Date(date).getFullYear()}/${String(i).padStart(4, "0")}`,
    registeredAt: date,
    crimeType,
    status,
    priority,
    summary: `${crimeType} reported at ${pick(["late night", "morning hours", "afternoon", "evening"])} in ${district}. ${numAccused} suspect(s) identified. Investigation ongoing.`,
    location: randLocation(district),
    station,
    complainant: randomPerson(`P-C-${i}`),
    victims: Array.from({ length: numVictims }, (_, k) => randomPerson(`P-V-${i}-${k}`)),
    accused: Array.from({ length: numAccused }, (_, k) => randomPerson(`P-A-${i}-${k}`)),
    officers: [
      { id: `O-${i}-1`, name: randName(), rank: "Inspector", badgeNumber: `KA-${randInt(1000, 9999)}`, station: station.name },
      { id: `O-${i}-2`, name: randName(), rank: "Sub-Inspector", badgeNumber: `KA-${randInt(1000, 9999)}`, station: station.name },
    ],
    acts,
    court: status === "Chargesheeted" || status === "Under Investigation"
      ? { name: `${district} Sessions Court`, caseNumber: `CC/${randInt(100, 999)}/${new Date(date).getFullYear()}`, nextHearing: new Date(Date.now() + randInt(5, 60) * 86400000).toISOString(), status: status === "Chargesheeted" ? "Chargesheeted" : "Pending" }
      : undefined,
    evidenceCount: randInt(2, 15),
    timeline: [
      { id: `t1-${i}`, date, title: "FIR Registered", description: "First Information Report filed.", type: "fir" },
      { id: `t2-${i}`, date: new Date(new Date(date).getTime() + 2 * 86400000).toISOString(), title: "Site Investigation", description: "Officers visited the scene, collected preliminary evidence.", type: "evidence" },
      ...(status !== "Registered" ? [{ id: `t3-${i}`, date: new Date(new Date(date).getTime() + 5 * 86400000).toISOString(), title: "Suspect Detained", description: "Primary suspect brought in for questioning.", type: "arrest" as const }] : []),
      ...(status === "Chargesheeted" ? [{ id: `t4-${i}`, date: new Date(new Date(date).getTime() + 30 * 86400000).toISOString(), title: "Chargesheet Filed", description: "Chargesheet submitted to jurisdictional court.", type: "chargesheet" as const }] : []),
    ],
    relatedFirIds: [],
    aiSummary: pick(AI_SUMMARIES),
    aiConfidence: 60 + Math.floor(rand() * 39),
    tags: [crimeType.toLowerCase(), priority.toLowerCase(), district.toLowerCase().replace(/\s+/g, "-")],
  };
}

const _FIRS: FIR[] = Array.from({ length: 120 }, (_, i) => generateFIR(i + 1));
// wire related
for (let i = 0; i < _FIRS.length; i++) {
  const rel: string[] = [];
  for (let j = 0; j < 3; j++) {
    const idx = (i + randInt(1, 20)) % _FIRS.length;
    if (idx !== i) rel.push(_FIRS[idx]!.id);
  }
  _FIRS[i]!.relatedFirIds = rel;
}

const _ALERTS: Alert[] = [
  { id: "A-1", level: "critical", title: "Repeat offender pattern detected", message: "3 robbery FIRs in Mysuru share MO with detained suspect KA-4592.", timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: "A-2", level: "warning", title: "Hotspot forming: HSR Layout", message: "Vehicle theft complaints up 42% this week.", timestamp: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: "A-3", level: "info", title: "AI report ready", message: "Weekly district intelligence brief for Bengaluru Urban is available.", timestamp: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: "A-4", level: "warning", title: "Cybercrime spike", message: "Fraud FIRs increased 28% in Hubballi-Dharwad.", timestamp: new Date(Date.now() - 8 * 3600000).toISOString() },
  { id: "A-5", level: "critical", title: "Missing person case escalated", message: "72-hour threshold reached for FIR 003/2025/0187.", timestamp: new Date(Date.now() - 20 * 3600000).toISOString() },
];

const _HOTSPOTS: HotspotPrediction[] = DISTRICTS.slice(0, 6).map((d, i) => ({
  id: `HS-${i}`,
  district: d,
  area: pick(["Central Market", "Old Town", "Layout 5", "Bus Terminal", "Ring Road Junction"]),
  lat: 12.5 + rand() * 5,
  lng: 74.5 + rand() * 4,
  crimeType: pick(CRIME_TYPES),
  riskScore: 60 + Math.floor(rand() * 40),
  confidence: 65 + Math.floor(rand() * 30),
  recommendation: pick([
    "Increase night patrol between 22:00–02:00.",
    "Deploy plainclothes surveillance near market entrances.",
    "Coordinate with adjacent station for joint patrol.",
    "Install additional CCTV coverage at identified nodes.",
  ]),
}));

const _AUDIT: AuditLog[] = Array.from({ length: 40 }, (_, i) => ({
  id: `AL-${i}`,
  actor: pick(["insp.kumar", "sho.mysuru", "sp.bengaluru", "admin"]),
  action: pick(["Viewed FIR", "Edited case", "Ran AI query", "Downloaded report", "Login", "Updated user role"]),
  target: pick(["FIR-00023", "FIR-00087", "Report Q3", "User: io.rani", "System"]),
  timestamp: new Date(Date.now() - i * 3600000 * 2).toISOString(),
  ip: `10.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`,
}));

export const mockService = {
  KARNATAKA_CENTER,
  DISTRICTS,
  STATIONS,
  CRIME_TYPES,
  STATUSES,

  async listFIRs(filters?: {
    q?: string;
    district?: string;
    station?: string;
    crimeType?: CrimeType;
    status?: CaseStatus;
    priority?: Priority;
  }): Promise<FIR[]> {
    await new Promise((r) => setTimeout(r, 120));
    return _FIRS.filter((f) => {
      if (filters?.q) {
        const q = filters.q.toLowerCase();
        if (
          !f.firNumber.toLowerCase().includes(q) &&
          !f.summary.toLowerCase().includes(q) &&
          !f.location.district.toLowerCase().includes(q) &&
          !f.accused.some((a) => a.name.toLowerCase().includes(q))
        ) return false;
      }
      if (filters?.district && f.location.district !== filters.district) return false;
      if (filters?.station && f.station.id !== filters.station) return false;
      if (filters?.crimeType && f.crimeType !== filters.crimeType) return false;
      if (filters?.status && f.status !== filters.status) return false;
      if (filters?.priority && f.priority !== filters.priority) return false;
      return true;
    });
  },

  async getFIR(id: string): Promise<FIR | undefined> {
    await new Promise((r) => setTimeout(r, 80));
    return _FIRS.find((f) => f.id === id);
  },

  async listAlerts(): Promise<Alert[]> {
    return _ALERTS;
  },

  async listHotspots(): Promise<HotspotPrediction[]> {
    return _HOTSPOTS;
  },

  async listAudit(): Promise<AuditLog[]> {
    return _AUDIT;
  },

  async metrics() {
    const today = _FIRS.filter((f) => Date.now() - new Date(f.registeredAt).getTime() < 86400000 * 3).length;
    return {
      activeFirs: _FIRS.filter((f) => f.status === "Under Investigation").length,
      crimesToday: today,
      pendingInvestigation: _FIRS.filter((f) => f.status === "Under Investigation" || f.status === "Registered").length,
      chargesheeted: _FIRS.filter((f) => f.status === "Chargesheeted").length,
      arrests: _FIRS.filter((f) => f.timeline.some((t) => t.type === "arrest")).length,
      repeatOffenders: 47,
    };
  },

  async trendData() {
    return Array.from({ length: 14 }, (_, i) => ({
      day: `D-${13 - i}`,
      firs: randInt(15, 45),
      arrests: randInt(5, 22),
      closed: randInt(3, 18),
    }));
  },

  async crimeDistribution() {
    const dist: Record<string, number> = {};
    for (const f of _FIRS) dist[f.crimeType] = (dist[f.crimeType] ?? 0) + 1;
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  },

  async districtRisk() {
    return DISTRICTS.slice(0, 8).map((d) => ({
      district: d.split(" ")[0]!,
      risk: randInt(35, 95),
      firs: _FIRS.filter((f) => f.location.district === d).length,
    }));
  },
};

export const MOCK_USERS: Array<User & { password: string }> = [
  { id: "u1", name: "Insp. Ramesh Kumar", badgeNumber: "KA-4501", email: "io@ksp.gov.in", role: "Investigation Officer", district: "Bengaluru Urban", station: "Cubbon Park PS", avatarInitials: "RK", password: "sentinel" },
  { id: "u2", name: "SHO Suresh Naik", badgeNumber: "KA-3220", email: "sho@ksp.gov.in", role: "SHO", district: "Bengaluru Urban", station: "Ashok Nagar PS", avatarInitials: "SN", password: "sentinel" },
  { id: "u3", name: "SP Anita Rao", badgeNumber: "KA-1201", email: "sp@ksp.gov.in", role: "SP", district: "Mysuru", station: "HQ", avatarInitials: "AR", password: "sentinel" },
  { id: "u4", name: "DCP Vikram Patil", badgeNumber: "KA-0912", email: "dcp@ksp.gov.in", role: "DCP", district: "Bengaluru Urban", station: "HQ", avatarInitials: "VP", password: "sentinel" },
  { id: "u5", name: "Commissioner P. Iyer", badgeNumber: "KA-0001", email: "commissioner@ksp.gov.in", role: "Commissioner", district: "Karnataka", station: "State HQ", avatarInitials: "PI", password: "sentinel" },
  { id: "u6", name: "System Administrator", badgeNumber: "ADMIN", email: "admin@ksp.gov.in", role: "Administrator", district: "—", station: "IT Cell", avatarInitials: "AD", password: "sentinel" },
];

export const ROLE_NAV_VISIBILITY: Record<Role, string[]> = {
  "Investigation Officer": ["dashboard", "investigation", "analytics", "map", "intelligence", "assistant", "predictions", "reports", "settings"],
  "SHO": ["dashboard", "investigation", "analytics", "map", "intelligence", "assistant", "predictions", "reports", "settings"],
  "SP": ["dashboard", "investigation", "analytics", "map", "intelligence", "assistant", "predictions", "reports", "settings"],
  "DCP": ["dashboard", "investigation", "analytics", "map", "intelligence", "assistant", "predictions", "reports", "settings"],
  "Commissioner": ["dashboard", "investigation", "analytics", "map", "intelligence", "assistant", "predictions", "reports", "administration", "settings"],
  "Administrator": ["dashboard", "administration", "settings", "reports"],
};
