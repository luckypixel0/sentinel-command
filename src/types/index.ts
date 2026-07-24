export type Role =
  | "Investigation Officer"
  | "SHO"
  | "SP"
  | "DCP"
  | "Commissioner"
  | "Administrator";

export interface User {
  id: string;
  name: string;
  badgeNumber: string;
  email: string;
  role: Role;
  district: string;
  station: string;
  avatarInitials: string;
}

export interface Location {
  district: string;
  taluk: string;
  address: string;
  lat: number;
  lng: number;
}

export interface Person {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  address: string;
  phone?: string;
  aadhaarMasked?: string;
}

export interface Officer {
  id: string;
  name: string;
  rank: string;
  badgeNumber: string;
  station: string;
}

export interface ActSection {
  act: string;
  section: string;
  description: string;
}

export interface CourtInfo {
  name: string;
  caseNumber?: string;
  nextHearing?: string;
  status: "Pending" | "Chargesheeted" | "Under Trial" | "Disposed";
}

export interface PoliceStation {
  id: string;
  name: string;
  district: string;
  incharge: string;
  contact: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: "fir" | "arrest" | "evidence" | "court" | "chargesheet" | "note";
}

export type CrimeType =
  | "Theft"
  | "Robbery"
  | "Burglary"
  | "Assault"
  | "Murder"
  | "Cybercrime"
  | "Narcotics"
  | "Fraud"
  | "Kidnapping"
  | "Vehicle Theft";

export type CaseStatus =
  | "Registered"
  | "Under Investigation"
  | "Chargesheeted"
  | "Closed"
  | "Cold Case";

export type Priority = "Low" | "Medium" | "High" | "Critical";

export interface FIR {
  id: string;
  firNumber: string;
  registeredAt: string;
  crimeType: CrimeType;
  status: CaseStatus;
  priority: Priority;
  summary: string;
  location: Location;
  station: PoliceStation;
  complainant: Person;
  victims: Person[];
  accused: Person[];
  officers: Officer[];
  acts: ActSection[];
  court?: CourtInfo;
  evidenceCount: number;
  timeline: TimelineEvent[];
  relatedFirIds: string[];
  aiSummary: string;
  aiConfidence: number;
  tags: string[];
}

export interface Alert {
  id: string;
  level: "info" | "warning" | "critical";
  title: string;
  message: string;
  timestamp: string;
}

export interface HotspotPrediction {
  id: string;
  district: string;
  area: string;
  lat: number;
  lng: number;
  crimeType: CrimeType;
  riskScore: number;
  confidence: number;
  recommendation: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  ip: string;
}
