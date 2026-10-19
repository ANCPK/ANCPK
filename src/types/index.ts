export type CaseType = 'preg' | 'post' | 'child';

export type RiskLevel = 'high' | 'mid' | 'low';

export type BreastfeedingType = 'ex' | 'mix' | 'fo';

export interface Referral {
  at: number; // timestamp
  status: 'รอรับเรื่อง' | 'รับเรื่องแล้ว' | 'ปิดเคสแล้ว';
  by: string; // VHV or officer name
  accepted?: number;
  closed?: number;
  reason?: string;
  urgency?: 'urgent' | 'routine';
  responseNote?: string;
}

export interface VisitRecord {
  id: string;
  d: string; // YYYY-MM-DD
  by: string;
  topics: string[];
  latch?: string;
  dspm?: string;
  text: string;
  refer?: boolean;
  bloodPressure?: string;
  weightKg?: number;
  childAgeMonths?: number;
}

export interface CaseItem {
  id: string;
  name: string;
  age?: number;
  phone?: string;
  address?: string;
  zone: string; // คุ้ม 1, คุ้ม 2, คุ้ม 3
  type: CaseType;
  risk: RiskLevel;
  appt: string; // YYYY-MM-DD
  lat: number;
  lng: number;
  vhv: string; // อสม. ผู้รับผิดชอบ
  bf: BreastfeedingType | null;
  earlyANC: boolean | null; // ฝากครรภ์ก่อน 12 สัปดาห์
  vaccine: boolean | null; // วัคซีนครบตามเกณฑ์อายุ
  gestationalAgeWeeks?: number;
  childAgeMonths?: number;
  note: string;
  refer: Referral | null;
  visits: VisitRecord[];
}

export interface KpiMetric {
  id: string;
  label: string;
  sublabel: string;
  val: number | null;
  target: number;
  unit: string;
  detail: string;
  reversed?: boolean;
}
