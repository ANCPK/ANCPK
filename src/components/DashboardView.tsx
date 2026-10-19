import React from 'react';
import { CaseItem, KpiMetric } from '../types';
import {
  TYPE_LABELS,
  RISK_LABELS,
  getDaysTo,
  formatThaiDate,
} from '../utils/helpers';
import {
  AlertTriangle,
  Clock,
  Calendar,
  Send,
  ChevronRight,
  ShieldAlert,
  Baby,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';

interface DashboardViewProps {
  cases: CaseItem[];
  kpis: KpiMetric[];
  showNames: boolean;
  onSelectCase: (caseId: string) => void;
  onRecordVisit: (caseId: string) => void;
  onAcceptReferral: (caseId: string) => void;
  onNavigateToTab: (tab: 'map' | 'list' | 'ref') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cases,
  kpis,
  showNames,
  onSelectCase,
  onRecordVisit,
  onAcceptReferral,
  onNavigateToTab,
}) => {
  const highRiskCases = cases.filter((c) => c.risk === 'high');
  const midRiskCases = cases.filter((c) => c.risk === 'mid');
  const lowRiskCases = cases.filter((c) => c.risk === 'low');

  const pendingReferrals = cases.filter(
    (c) => c.refer && c.refer.status !== 'ปิดเคสแล้ว'
  );

  const urgentQueue = cases
    .filter((c) => c.risk === 'high' || getDaysTo(c.appt) < 0)
    .sort((a, b) => {
      // Prioritize high risk, then overdue days
      if (a.risk === 'high' && b.risk !== 'high') return -1;
      if (b.risk === 'high' && a.risk !== 'high') return 1;
      return getDaysTo(a.appt) - getDaysTo(b.appt);
    });

  const upcomingAppointments = [...cases]
    .filter((c) => getDaysTo(c.appt) >= 0)
    .sort((a, b) => a.appt.localeCompare(b.appt))
    .slice(0, 5);

  const getCaseName = (c: CaseItem) => (showNames ? c.name : c.id);

  return (
    <div className="space-y-6">
      {/* Top Health Service Announcement / Hero Strip */}
      <div className="bg-gradient-to-r from-[#006B62] to-[#00857A] rounded-2xl p-5 text-white shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white/20 uppercase tracking-wider">
                รพ.สต.บ้านโปร่งเกตุ
              </span>
              <span className="text-xs text-[#DCF7F1]">
                เครือข่ายบริการสุขภาพปฐมภูมิ (Primary Care Unit)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              ศูนย์ข้อมูลแม่และเด็กปฐมวัยอัจฉริยะ (Smart MCH Hub)
            </h1>
            <p className="text-sm text-[#D1F2EA] max-w-2xl">
              ติดตามดูแลสุขภาพแบบไร้รอยต่อระหว่างเจ้าหน้าที่สาธารณสุข รพ.สต. และ อสม. ประจำคุ้ม
              เพื่อลดภาวะแทรกซ้อน เสริมสร้างพัฒนาการสมวัย และส่งเสริมการเลี้ยงลูกด้วยนมแม่
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => onNavigateToTab('map')}
              className="px-3.5 py-2 rounded-lg bg-white text-[#007369] hover:bg-[#F2FAF8] text-xs font-semibold transition-colors shadow-xs"
            >
              ดูแผนที่พิกัดบ้าน
            </button>
            <button
              type="button"
              onClick={() => onNavigateToTab('ref')}
              className="px-3.5 py-2 rounded-lg bg-[#FFD23F] text-[#423100] hover:bg-[#F4C52A] text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>คิวส่งต่อ ({pendingReferrals.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Core Public Health KPIs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#18393F] uppercase tracking-wider flex items-center gap-2">
            <span>ตัวชี้วัดกระทรวงสาธารณสุข (MOH Key Performance Indicators)</span>
          </h2>
          <span className="text-xs text-[#526B70]">เป้าหมายปีงบประมาณ 2569</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {kpis.map((kpi) => {
            const isNull = kpi.val === null;
            const isPassing =
              !isNull && (kpi.reversed ? kpi.val! <= kpi.target : kpi.val! >= kpi.target);
            const progress = isNull
              ? 0
              : kpi.reversed
              ? Math.min(100, Math.round((kpi.val! / kpi.target) * 100))
              : Math.min(100, kpi.val!);

            return (
              <div
                key={kpi.id}
                className="bg-white rounded-xl p-4 border border-[#D5EAE4] hover:border-[#96D1C4] transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xs text-[#5C757B] font-medium leading-tight line-clamp-2">
                      {kpi.label}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                        isNull
                          ? 'bg-slate-100 text-slate-500'
                          : isPassing
                          ? 'bg-[#E1F7EB] text-[#13743E]'
                          : 'bg-[#FFF2D6] text-[#8C5800]'
                      }`}
                    >
                      {isNull ? 'รอข้อมูล' : isPassing ? 'บรรลุเป้า' : 'ต่ำกว่าเป้า'}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-mono-code tabular-nums text-[#0F282B]">
                      {isNull ? '-' : kpi.val}
                    </span>
                    <span className="text-xs font-semibold text-[#526B70]">{kpi.unit}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#EEF7F4]">
                  <div className="w-full bg-[#E5F2EE] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isPassing ? 'bg-[#00857A]' : 'bg-[#E59300]'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between items-center text-[11px] text-[#637E84]">
                    <span>เป้าหมาย {kpi.reversed ? '≤' : '≥'} {kpi.target}{kpi.unit}</span>
                    <span className="truncate ml-1">{kpi.detail}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk Triage Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div
          onClick={() => onNavigateToTab('list')}
          className="cursor-pointer bg-[#FDF2F2] border border-[#F9C9CB] rounded-xl p-4 hover:shadow-xs transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A81724] uppercase tracking-wide flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#C81E2B]" />
              <span>เคสเสี่ยงสูง (High Risk)</span>
            </span>
            <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-white/80 text-[#A81724] font-bold">
              ตรวจซ้ำ &lt; 24 ชม.
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono-code tabular-nums text-[#C81E2B]">
              {highRiskCases.length}
            </span>
            <span className="text-xs text-[#7F262E]">เคสในความดูแลเร่งด่วน</span>
          </div>
          <p className="mt-2 text-xs text-[#8E2831]">
            เช่น ความดันโลหิตสูงขณะตั้งครรภ์, เต้านมอักเสบรุนแรง, เด็กพัฒนาการล่าช้า
          </p>
        </div>

        <div
          onClick={() => onNavigateToTab('list')}
          className="cursor-pointer bg-[#FFF9EB] border border-[#FFE8A3] rounded-xl p-4 hover:shadow-xs transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8A5200] uppercase tracking-wide flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#C77800]" />
              <span>เคสเฝ้าระวัง (Moderate Risk)</span>
            </span>
            <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-white/80 text-[#8A5200] font-bold">
              นัดสัปดาห์ละ 1 ครั้ง
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono-code tabular-nums text-[#B06B00]">
              {midRiskCases.length}
            </span>
            <span className="text-xs text-[#6F4706]">เคสที่ต้องติดตามใกล้ชิด</span>
          </div>
          <p className="mt-2 text-xs text-[#7C5109]">
            เช่น ขาดนัดตรวจ, เข้าเต้าไม่ดี/เริ่มใช้นมผง, น้ำหนักเด็กต่ำกว่าเกณฑ์
          </p>
        </div>

        <div
          onClick={() => onNavigateToTab('list')}
          className="cursor-pointer bg-[#F0FAF4] border border-[#C5ECD6] rounded-xl p-4 hover:shadow-xs transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#146635] uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#17703A]" />
              <span>เคสปกติ (Low Risk)</span>
            </span>
            <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-white/80 text-[#146635] font-bold">
              ติดตามตามนัดปกติ
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono-code tabular-nums text-[#17703A]">
              {lowRiskCases.length}
            </span>
            <span className="text-xs text-[#205736]">เคสสุขภาพสมบูรณ์</span>
          </div>
          <p className="mt-2 text-xs text-[#2A5C3C]">
            ฝากครรภ์ครบ 8 ครั้งตามเกณฑ์, ให้นมแม่อย่างเดียวต่อเนื่อง, พัฒนาการสมวัย
          </p>
        </div>
      </div>

      {/* Two Column Section: Priority Visit Queue + Referrals & Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Priority Visit Queue (ควรลงเยี่ยมก่อน) */}
        <div className="bg-white rounded-xl border border-[#D5EAE4] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#EEF7F4]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C81E2B]" />
                <h3 className="font-semibold text-sm sm:text-base text-[#102A2E]">
                  ควรลงเยี่ยมก่อน (เคสเสี่ยงสูงหรือเลยนัด)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab('list')}
                className="text-xs text-[#00857A] hover:underline flex items-center gap-0.5 font-medium"
              >
                <span>ดูทั้งหมด</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#F0F7F5] mt-2">
              {urgentQueue.length === 0 ? (
                <div className="py-8 text-center text-sm text-[#6C858A]">
                  ยอดเยี่ยม! ไม่มีเคสเสี่ยงสูงหรือเลยกำหนดนัดตรวจในขณะนี้
                </div>
              ) : (
                urgentQueue.slice(0, 5).map((c) => {
                  const days = getDaysTo(c.appt);
                  const isOverdue = days < 0;

                  return (
                    <div
                      key={c.id}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-[#F8FCFB] px-2 rounded-lg transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectCase(c.id)}
                            className="font-medium text-sm text-[#0F292E] hover:text-[#00857A] text-left truncate"
                          >
                            <span className="font-mono-code text-xs text-[#007A70] font-semibold mr-1.5">
                              {c.id}
                            </span>
                            {getCaseName(c)}
                          </button>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                              c.risk === 'high'
                                ? 'bg-[#FFD6D3] text-[#A81724]'
                                : 'bg-[#FFE7A3] text-[#7A4900]'
                            }`}
                          >
                            {RISK_LABELS[c.risk]}
                          </span>
                        </div>

                        <div className="text-xs text-[#5A747A] mt-1 flex items-center gap-2 flex-wrap">
                          <span>{TYPE_LABELS[c.type]}</span>
                          <span>·</span>
                          <span className="text-[#3A5358]">{c.zone}</span>
                          <span>·</span>
                          <span>{c.vhv}</span>
                          <span>·</span>
                          {isOverdue ? (
                            <span className="text-[#C81E2B] font-semibold">
                              เลยนัด {Math.abs(days)} วัน
                            </span>
                          ) : days === 0 ? (
                            <span className="text-[#C81E2B] font-bold">นัดวันนี้</span>
                          ) : (
                            <span>อีก {days} วัน</span>
                          )}
                        </div>

                        {c.note && (
                          <p className="text-xs text-[#7B9297] mt-0.5 line-clamp-1 italic">
                            &quot;{c.note}&quot;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onRecordVisit(c.id)}
                          className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#E6F5F2] text-[#007066] hover:bg-[#00857A] hover:text-white transition-colors"
                        >
                          บันทึกเยี่ยม
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectCase(c.id)}
                          className="p-1.5 text-[#5C757B] hover:text-[#0F292E] rounded-lg hover:bg-slate-100"
                          title="ดูข้อมูล"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#EEF7F4] flex items-center justify-between text-xs text-[#637E84]">
            <span>แนวทาง: อสม. ประจำคุ้มควรลงเยี่ยมและประเมินสัญญาณชีพภายใน 48 ชม.</span>
          </div>
        </div>

        {/* Right Column: Referrals & Upcoming Appointments */}
        <div className="space-y-6">
          {/* Active Referrals Box */}
          <div className="bg-white rounded-xl border border-[#D5EAE4] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEF7F4]">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#00857A]" />
                <h3 className="font-semibold text-sm sm:text-base text-[#102A2E]">
                  เคสส่งต่อจาก อสม. ถึง รพ.สต. ({pendingReferrals.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab('ref')}
                className="text-xs text-[#00857A] hover:underline flex items-center gap-0.5 font-medium"
              >
                <span>จัดการเคสส่งต่อ</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#F0F7F5] mt-2">
              {pendingReferrals.length === 0 ? (
                <div className="py-6 text-center text-sm text-[#6C858A]">
                  ไม่มีเคสส่งต่อค้างอยู่ ระบบพร้อมให้บริการ
                </div>
              ) : (
                pendingReferrals.slice(0, 3).map((c) => {
                  const ref = c.refer!;
                  const elapsedHours = Math.round((Date.now() - ref.at) / 3600000);
                  const isOverdue = elapsedHours >= 24;

                  return (
                    <div
                      key={c.id}
                      className="py-3 flex items-start justify-between gap-3 hover:bg-[#F8FCFB] px-2 rounded-lg transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectCase(c.id)}
                            className="font-medium text-sm text-[#0F292E] hover:text-[#00857A] truncate"
                          >
                            <span className="font-mono-code text-xs text-[#007A70] font-semibold mr-1.5">
                              {c.id}
                            </span>
                            {getCaseName(c)}
                          </button>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              ref.status === 'รอรับเรื่อง'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {ref.status}
                          </span>
                        </div>

                        <p className="text-xs text-[#7B9297] mt-1 line-clamp-1">
                          {ref.reason || c.note || 'ขอคำปรึกษาจากพยาบาลวิชาชีพ'}
                        </p>

                        <div className="text-[11px] text-[#5A747A] mt-1 flex items-center gap-2">
                          <span>แจ้งโดย {ref.by}</span>
                          <span>·</span>
                          <span
                            className={
                              isOverdue ? 'text-red-600 font-bold' : 'text-slate-600'
                            }
                          >
                            ผ่านมา {elapsedHours} ชม. {isOverdue && '(เกิน 24 ชม.)'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-center">
                        {ref.status === 'รอรับเรื่อง' && (
                          <button
                            type="button"
                            onClick={() => onAcceptReferral(c.id)}
                            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#00857A] text-white hover:bg-[#007066] transition-colors shadow-xs"
                          >
                            รับเรื่อง
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onSelectCase(c.id)}
                          className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-[#C8E3DC] bg-white text-[#254045] hover:bg-[#F2FAF8]"
                        >
                          ดูเคส
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming Clinic Appointments */}
          <div className="bg-white rounded-xl border border-[#D5EAE4] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEF7F4]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#00857A]" />
                <h3 className="font-semibold text-sm sm:text-base text-[#102A2E]">
                  วันนัดตรวจคลินิก ANC & WCC ที่ใกล้ถึง
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab('list')}
                className="text-xs text-[#00857A] hover:underline flex items-center gap-0.5 font-medium"
              >
                <span>ดูตารางนัด</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#F0F7F5] mt-2">
              {upcomingAppointments.map((c) => {
                const days = getDaysTo(c.appt);
                return (
                  <div
                    key={c.id}
                    className="py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1 flex items-center gap-2">
                      <span className="font-mono-code font-medium text-[#007A70] shrink-0">
                        {c.id}
                      </span>
                      <span className="truncate text-[#102A2E] font-medium">
                        {getCaseName(c)}
                      </span>
                      <span className="text-[#658288] shrink-0 hidden sm:inline">
                        ({TYPE_LABELS[c.type]})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[#3A5358]">{formatThaiDate(c.appt)}</span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                          days === 0
                            ? 'bg-red-100 text-red-700'
                            : days <= 3
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-[#EBF7F4] text-[#007066]'
                        }`}
                      >
                        {days === 0 ? 'วันนี้' : `อีก ${days} วัน`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
