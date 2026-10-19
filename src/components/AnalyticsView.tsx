import React from 'react';
import { CaseItem } from '../types';
import { TYPE_LABELS, RISK_LABELS, BF_LABELS } from '../utils/helpers';
import {
  BarChart3,
  Baby,
  HeartHandshake,
  ShieldAlert,
  Award,
  Sparkles,
  Info,
  CheckCircle,
} from 'lucide-react';

interface AnalyticsViewProps {
  cases: CaseItem[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ cases }) => {
  const pregCases = cases.filter((c) => c.type === 'preg');
  const postCases = cases.filter((c) => c.type === 'post');
  const childCases = cases.filter((c) => c.type === 'child');

  // Zones
  const zones = ['คุ้ม 1', 'คุ้ม 2', 'คุ้ม 3'];
  const zoneStats = zones.map((z) => {
    const list = cases.filter((c) => c.zone.includes(z));
    return {
      zone: z,
      total: list.length,
      highRisk: list.filter((c) => c.risk === 'high').length,
      midRisk: list.filter((c) => c.risk === 'mid').length,
      lowRisk: list.filter((c) => c.risk === 'low').length,
      vhv: list[0]?.vhv || 'อสม. ประจำคุ้ม',
    };
  });

  // Breastfeeding Stats
  const bfAll = cases.filter((c) => c.bf !== null);
  const bfEx = bfAll.filter((c) => c.bf === 'ex').length;
  const bfMix = bfAll.filter((c) => c.bf === 'mix').length;
  const bfFo = bfAll.filter((c) => c.bf === 'fo').length;

  // Children Development & Vaccine
  const vaccineCount = childCases.filter((c) => c.vaccine === true).length;
  const delayedDspmCount = cases.filter((c) =>
    c.visits.some((v) => v.dspm === 'สงสัยล่าช้า')
  ).length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-xl border border-[#D5EAE4] p-5 shadow-xs">
        <h2 className="text-base sm:text-lg font-bold text-[#0E282B] flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#00857A]" />
          <span>รายงานสถิติประชากรแม่และเด็ก รพ.สต.บ้านโปร่งเกตุ</span>
        </h2>
        <p className="text-xs text-[#526B70] mt-1">
          การวิเคราะห์ข้อมูลความครอบคลุมบริการสุขภาพตามกลุ่มวัย ระดับความเสี่ยง และเขตรับผิดชอบ อสม.
        </p>
      </div>

      {/* Target Demographics 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pregnancy Card */}
        <div className="bg-white rounded-xl border border-[#D5EAE4] p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#EDF6F3]">
            <span className="font-bold text-sm text-[#0F282B] flex items-center gap-1.5">
              <span>หญิงตั้งครรภ์ (ANC)</span>
            </span>
            <span className="text-xs font-mono-code font-bold px-2 py-0.5 rounded bg-[#E8F6F2] text-[#007A70]">
              {pregCases.length} คน
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-[#4B666C]">
              <span>ฝากครรภ์ก่อน 12 สัปดาห์:</span>
              <strong className="text-[#00857A]">
                {pregCases.filter((c) => c.earlyANC).length} / {pregCases.length} คน (
                {pregCases.length > 0
                  ? Math.round(
                      (pregCases.filter((c) => c.earlyANC).length /
                        pregCases.length) *
                        100
                    )
                  : 0}
                %)
              </strong>
            </div>

            <div className="flex justify-between items-center text-[#4B666C]">
              <span>ไตรมาส 1 (&le;13 สัปดาห์):</span>
              <span className="font-semibold text-slate-800">
                {pregCases.filter((c) => (c.gestationalAgeWeeks || 0) <= 13).length} คน
              </span>
            </div>

            <div className="flex justify-between items-center text-[#4B666C]">
              <span>ไตรมาส 2 (14-27 สัปดาห์):</span>
              <span className="font-semibold text-slate-800">
                {
                  pregCases.filter(
                    (c) =>
                      (c.gestationalAgeWeeks || 0) >= 14 &&
                      (c.gestationalAgeWeeks || 0) <= 27
                  ).length
                }{' '}
                คน
              </span>
            </div>

            <div className="flex justify-between items-center text-[#4B666C]">
              <span>ไตรมาส 3 (&ge;28 สัปดาห์ ใกล้คลอด):</span>
              <span className="font-semibold text-[#C81E2B]">
                {pregCases.filter((c) => (c.gestationalAgeWeeks || 0) >= 28).length} คน
              </span>
            </div>
          </div>
        </div>

        {/* Postpartum Mother Card */}
        <div className="bg-white rounded-xl border border-[#D5EAE4] p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#EDF6F3]">
            <span className="font-bold text-sm text-[#0F282B] flex items-center gap-1.5">
              <span>แม่หลังคลอด (PNC)</span>
            </span>
            <span className="text-xs font-mono-code font-bold px-2 py-0.5 rounded bg-[#E8F6F2] text-[#007A70]">
              {postCases.length} คน
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-[#4B666C]">
              <span>นมแม่อย่างเดียว (Exclusive):</span>
              <strong className="text-[#17703A]">
                {postCases.filter((c) => c.bf === 'ex').length} คน
              </strong>
            </div>
            <div className="flex justify-between items-center text-[#4B666C]">
              <span>นมแม่ + นมผง (Mixed):</span>
              <span className="font-semibold text-[#8A5200]">
                {postCases.filter((c) => c.bf === 'mix').length} คน
              </span>
            </div>
            <div className="flex justify-between items-center text-[#4B666C]">
              <span>เต้านมอักเสบ / หัวนมแตก:</span>
              <span className="font-semibold text-[#C81E2B]">
                {
                  postCases.filter(
                    (c) =>
                      c.note.includes('เต้านม') ||
                      c.visits.some((v) => (v.latch || '').includes('เจ็บ'))
                  ).length
                }{' '}
                คน
              </span>
            </div>
          </div>
        </div>

        {/* Child Card */}
        <div className="bg-white rounded-xl border border-[#D5EAE4] p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#EDF6F3]">
            <span className="font-bold text-sm text-[#0F282B] flex items-center gap-1.5">
              <span>เด็ก 0-5 ปี (WCC & DSPM)</span>
            </span>
            <span className="text-xs font-mono-code font-bold px-2 py-0.5 rounded bg-[#E8F6F2] text-[#007A70]">
              {childCases.length} คน
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-[#4B666C]">
              <span>วัคซีนครบตามเกณฑ์อายุ (EPI):</span>
              <strong className="text-[#17703A]">
                {vaccineCount} / {childCases.length} คน (
                {childCases.length > 0
                  ? Math.round((vaccineCount / childCases.length) * 100)
                  : 0}
                %)
              </strong>
            </div>
            <div className="flex justify-between items-center text-[#4B666C]">
              <span>สงสัยพัฒนาการล่าช้า (DSPM):</span>
              <span className="font-bold text-[#C81E2B]">
                {delayedDspmCount} คน (ส่งเสริมกระตุ้นพัฒนาการ)
              </span>
            </div>
            <div className="flex justify-between items-center text-[#4B666C]">
              <span>ทารกวัย 0-1 ปี:</span>
              <span className="font-semibold text-slate-800">
                {childCases.filter((c) => (c.childAgeMonths || 0) <= 12).length} คน
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Zone Performance Table */}
      <div className="bg-white rounded-xl border border-[#D5EAE4] p-5 shadow-xs">
        <h3 className="font-bold text-sm sm:text-base text-[#102A2E] mb-3">
          การกระจายตัวระดับความเสี่ยงตามคุ้มและ อสม. ผู้รับผิดชอบ
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F6FAF9] text-[#557176] border-b border-[#D5EAE4] font-semibold">
                <th className="py-2.5 px-3">คุ้ม / เขตบริการ</th>
                <th className="py-2.5 px-3">อสม. ผู้รับผิดชอบ</th>
                <th className="py-2.5 px-3">จำนวนเคสทั้งหมด</th>
                <th className="py-2.5 px-3 text-[#C81E2B]">เสี่ยงสูง</th>
                <th className="py-2.5 px-3 text-[#B06B00]">เฝ้าระวัง</th>
                <th className="py-2.5 px-3 text-[#17703A]">ปกติ</th>
                <th className="py-2.5 px-3">สถานะการดูแล</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF5F2]">
              {zoneStats.map((z) => (
                <tr key={z.zone} className="hover:bg-[#F8FCFB]">
                  <td className="py-3 px-3 font-semibold text-[#0F292E]">{z.zone}</td>
                  <td className="py-3 px-3 text-[#4B676D]">{z.vhv}</td>
                  <td className="py-3 px-3 font-mono-code font-bold text-slate-800">
                    {z.total} เคส
                  </td>
                  <td className="py-3 px-3 font-mono-code font-bold text-[#C81E2B]">
                    {z.highRisk}
                  </td>
                  <td className="py-3 px-3 font-mono-code font-bold text-[#B06B00]">
                    {z.midRisk}
                  </td>
                  <td className="py-3 px-3 font-mono-code font-bold text-[#17703A]">
                    {z.lowRisk}
                  </td>
                  <td className="py-3 px-3">
                    {z.highRisk > 0 ? (
                      <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        มีเคสต้องลงเยี่ยมด่วน
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        ปกติ ครอบคลุม
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clinical Reference Standards for Health Staff and VHV */}
      <div className="bg-[#F0FAF7] border border-[#CDEAE2] rounded-xl p-5 space-y-3 text-xs text-[#204046]">
        <h4 className="font-bold text-sm text-[#0F353C] flex items-center gap-1.5">
          <Info className="w-4 h-4 text-[#00857A]" />
          <span>เกณฑ์มาตรฐานการดูแลสุขภาพแม่และเด็ก (MOH Health Guidance)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="bg-white/80 p-3 rounded-lg border border-[#D5EBE4] space-y-1">
            <strong className="text-[#007066] block">1. ANC คุณภาพ 8 ครั้ง</strong>
            <p>
              เริ่มฝากครรภ์ครั้งแรกก่อน 12 สัปดาห์ เพื่อตรวจคัดกรองธาลัสซีเมีย ตรวจเลือดคู่สมรส
              และได้รับยาเม็ดเสริมธาตุเหล็ก โฟลิก ไอโอดีน (Triferdine) ทุกวัน
            </p>
          </div>

          <div className="bg-white/80 p-3 rounded-lg border border-[#D5EBE4] space-y-1">
            <strong className="text-[#007066] block">2. บันได 4 ขั้นช่วยเข้าเต้า</strong>
            <p>
              ท้องแนบ ท้องชิด คางแนบเต้า ริมฝีปากบานออกเหมือนปลาฮุบเหยื่อ อมลึกถึงลานนม
              เพื่อป้องกันอาการหัวนมแตกและเต้านมอักเสบ (Mastitis)
            </p>
          </div>

          <div className="bg-white/80 p-3 rounded-lg border border-[#D5EBE4] space-y-1">
            <strong className="text-[#007066] block">3. คัดกรอง DSPM 5 ด้าน</strong>
            <p>
              ประเมินเด็กทุกช่วงอายุสำคัญ (9, 18, 30, 42, 60 เดือน) หากพบสงสัยล่าช้าแม้เพียงข้อเดียว
              ให้แนะนำผู้ปกครองฝึกทักษะ 30 วันและนัดตรวจซ้ำที่ รพ.สต.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
