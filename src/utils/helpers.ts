import { CaseItem, KpiMetric } from '../types';

export const offsetDate = (days: number): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(today.getTime() + days * 86400000);
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const MAP_BOUNDS = {
  lat: [13.7535, 13.7595] as [number, number],
  lng: [100.4985, 100.5065] as [number, number],
  width: 800,
  height: 500,
};

export const geoToSvg = (lat: number, lng: number) => {
  const { lat: [latMin, latMax], lng: [lngMin, lngMax], width, height } = MAP_BOUNDS;
  const x = ((lng - lngMin) / (lngMax - lngMin)) * width;
  const y = height - ((lat - latMin) / (latMax - latMin)) * height;
  return { x: Math.max(20, Math.min(width - 20, x)), y: Math.max(20, Math.min(height - 20, y)) };
};

export const svgToGeo = (x: number, y: number) => {
  const { lat: [latMin, latMax], lng: [lngMin, lngMax], width, height } = MAP_BOUNDS;
  const clampedX = Math.max(0, Math.min(width, x));
  const clampedY = Math.max(0, Math.min(height, y));
  const lng = lngMin + (clampedX / width) * (lngMax - lngMin);
  const lat = latMin + ((height - clampedY) / height) * (latMax - latMin);
  return { lat, lng };
};

export const TYPE_LABELS: Record<string, string> = {
  preg: 'หญิงตั้งครรภ์',
  post: 'แม่หลังคลอด',
  child: 'เด็ก 0-5 ปี',
};

export const RISK_LABELS: Record<string, string> = {
  high: 'เสี่ยงสูง (เร่งด่วน)',
  mid: 'เฝ้าระวัง',
  low: 'ปกติ',
};

export const BF_LABELS: Record<string, string> = {
  ex: 'นมแม่อย่างเดียว',
  mix: 'นมแม่ + นมผง',
  fo: 'นมผงอย่างเดียว',
};

export const getDaysTo = (dateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / 86400000);
};

export const formatThaiDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

export const formatThaiDateTime = (timestamp: number): string => {
  try {
    const d = new Date(timestamp);
    return d.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

export const calculateKpis = (cases: CaseItem[]): KpiMetric[] => {
  const preg = cases.filter((c) => c.type === 'preg');
  const bfc = cases.filter((c) => c.bf !== null);
  const ch = cases.filter((c) => c.type === 'child');
  const refs = cases.filter((c) => c.refer !== null);
  const doneRefs = refs.filter((c) => c.refer?.accepted !== undefined);

  const avgHours =
    doneRefs.length > 0
      ? Math.round(
          doneRefs.reduce(
            (acc, c) => acc + (c.refer!.accepted! - c.refer!.at) / 3600000,
            0
          ) / doneRefs.length
        )
      : null;

  const pct = (num: number, den: number) =>
    den > 0 ? Math.round((num / den) * 100) : 0;

  return [
    {
      id: 'gps-mapping',
      label: 'ปักหมุดพิกัดบ้านในระบบ',
      sublabel: 'ความครอบคลุมระบบ GIS',
      val: pct(cases.filter((c) => c.lat && c.lng).length, cases.length),
      target: 100,
      unit: '%',
      detail: `${cases.filter((c) => c.lat).length}/${cases.length} ครบถ้วน`,
    },
    {
      id: 'anc-early',
      label: 'ฝากครรภ์ก่อน 12 สัปดาห์',
      sublabel: 'ANC ครั้งแรกไตรมาสที่ 1',
      val: pct(preg.filter((c) => c.earlyANC).length, preg.length),
      target: 90,
      unit: '%',
      detail: `${preg.filter((c) => c.earlyANC).length} จาก ${preg.length} หญิงมีครรภ์`,
    },
    {
      id: 'breastfeeding-ex',
      label: 'นมแม่อย่างเดียว 6 เดือน',
      sublabel: 'Exclusive Breastfeeding',
      val: pct(bfc.filter((c) => c.bf === 'ex').length, bfc.length),
      target: 85,
      unit: '%',
      detail: `${bfc.filter((c) => c.bf === 'ex').length} จาก ${bfc.length} แม่และเด็กอ่อน`,
    },
    {
      id: 'vaccine-epi',
      label: 'เด็กรับวัคซีนครบตามวัย',
      sublabel: 'ความครอบคลุม EPI เด็ก 0-5 ปี',
      val: pct(ch.filter((c) => c.vaccine).length, ch.length),
      target: 95,
      unit: '%',
      detail: `${ch.filter((c) => c.vaccine).length} จาก ${ch.length} คน`,
    },
    {
      id: 'refer-time',
      label: 'เวลารับเรื่องเคสส่งต่อ',
      sublabel: 'ระยะเวลาตอบกลับเฉลี่ย',
      val: avgHours,
      target: 24,
      unit: ' ชม.',
      detail:
        avgHours === null
          ? 'รอการรับเรื่องแรก'
          : `เฉลี่ยจาก ${doneRefs.length} เคสส่งต่อ`,
      reversed: true,
    },
  ];
};

export const exportCasesToCsv = (cases: CaseItem[], showNames: boolean) => {
  const headers = [
    'รหัสเคส',
    'ชื่อ-นามสกุล',
    'ประเภท',
    'ระดับความเสี่ยง',
    'คุ้ม/หมู่บ้าน',
    'วันนัดถัดไป',
    'การเลี้ยงลูกด้วยนมแม่',
    'ฝากครรภ์ก่อน 12wk',
    'วัคซีนครบ',
    'อสม. ผู้รับผิดชอบ',
    'พิกัด ละติจูด',
    'พิกัด ลองจิจูด',
    'หมายเหตุ',
  ];

  const rows = cases.map((c) => [
    c.id,
    showNames ? `"${c.name}"` : '"[ปกปิด PDPA]"',
    TYPE_LABELS[c.type] || c.type,
    RISK_LABELS[c.risk] || c.risk,
    c.zone,
    c.appt,
    c.bf ? BF_LABELS[c.bf] : '-',
    c.earlyANC === true ? 'ใช่' : c.earlyANC === false ? 'ไม่ใช่' : '-',
    c.vaccine === true ? 'ครบ' : c.vaccine === false ? 'ไม่ครบ' : '-',
    `"${c.vhv}"`,
    c.lat.toFixed(5),
    c.lng.toFixed(5),
    `"${(c.note || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `ANC_MCH_Tracker_BaanProngKet_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
