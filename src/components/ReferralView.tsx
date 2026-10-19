import React, { useState } from 'react';
import { CaseItem } from '../types';
import {
  TYPE_LABELS,
  RISK_LABELS,
  formatThaiDateTime,
  formatThaiDate,
} from '../utils/helpers';
import {
  Send,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PhoneCall,
  UserCheck,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  FileText,
} from 'lucide-react';

interface ReferralViewProps {
  cases: CaseItem[];
  showNames: boolean;
  onSelectCase: (caseId: string) => void;
  onAcceptReferral: (caseId: string, staffName?: string) => void;
  onCloseReferral: (caseId: string, outcomeNote?: string) => void;
}

export const ReferralView: React.FC<ReferralViewProps> = ({
  cases,
  showNames,
  onSelectCase,
  onAcceptReferral,
  onCloseReferral,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'open' | 'closed'>('open');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolveNote, setResolveNote] = useState('');

  const referredCases = cases.filter((c) => c.refer !== null);
  const openReferrals = referredCases.filter(
    (c) => c.refer?.status !== 'ปิดเคสแล้ว'
  );
  const closedReferrals = referredCases.filter(
    (c) => c.refer?.status === 'ปิดเคสแล้ว'
  );

  const pendingCount = openReferrals.filter(
    (c) => c.refer?.status === 'รอรับเรื่อง'
  ).length;

  const handleConfirmClose = (id: string) => {
    onCloseReferral(id, resolveNote);
    setResolvingId(null);
    setResolveNote('');
  };

  const getCaseName = (c: CaseItem) => (showNames ? c.name : c.id);

  return (
    <div className="space-y-5">
      {/* Referral Emergency Protocol Notice */}
      <div className="bg-[#FFF8E7] border border-[#FFE7A8] rounded-xl p-4 text-xs text-[#7A4B00] shadow-xs">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#C87500] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-[#613C00]">
              แนวทางปฏิบัติการส่งต่อ (Clinical Referral Protocol) รพ.สต.บ้านโปร่งเกตุ
            </h4>
            <p>
              เคสที่ อสม. แจ้งขอส่งต่อ (Refer) เจ้าหน้าที่สาธารณสุข/พยาบาลวิชาชีพต้องกด <strong>&ldquo;รับเรื่อง&rdquo;</strong> และประสานให้คำปรึกษาภายใน <strong>24 ชั่วโมง</strong>
            </p>
            <p className="font-medium text-[#942B00]">
              * หากพบอาการวิกฤตฉุกเฉิน (ความดันโลหิตสูง &ge; 160/110, เลือดออกช่องคลอด, ชักเกร็ง, หายใจลำบาก) ให้ประสานเรียกรถพยาบาล 1669 ทันที
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white rounded-xl border border-[#D5EAE4] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#526B70]">
            <span>รอรับเรื่อง (Pending)</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono-code text-[#C81E2B]">
              {pendingCount}
            </span>
            <span className="text-xs text-[#637E84]">เคสที่ต้องดำเนินการด่วน</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D5EAE4] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#526B70]">
            <span>อยู่ระหว่างดูแล (In Progress)</span>
            <UserCheck className="w-4 h-4 text-[#00857A]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono-code text-[#00857A]">
              {openReferrals.length - pendingCount}
            </span>
            <span className="text-xs text-[#637E84]">รับเรื่องและกำลังรักษา</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D5EAE4] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#526B70]">
            <span>ปิดเคสสำเร็จแล้ว (Resolved)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono-code text-[#17703A]">
              {closedReferrals.length}
            </span>
            <span className="text-xs text-[#637E84]">ติดตามและส่งกลับ อสม.</span>
          </div>
        </div>
      </div>

      {/* Tabs: Open vs Closed */}
      <div className="flex items-center justify-between border-b border-[#D5EAE4] pb-2">
        <div className="inline-flex rounded-lg border border-[#D5EAE4] p-0.5 bg-white text-xs">
          <button
            type="button"
            onClick={() => setActiveSubTab('open')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'open'
                ? 'bg-[#00857A] text-white shadow-xs'
                : 'text-[#4A646A] hover:text-[#11292D]'
            }`}
          >
            <span>เคสส่งต่อที่ยังเปิดอยู่</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeSubTab === 'open'
                  ? 'bg-white text-[#00857A]'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {openReferrals.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('closed')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'closed'
                ? 'bg-[#00857A] text-white shadow-xs'
                : 'text-[#4A646A] hover:text-[#11292D]'
            }`}
          >
            <span>ประวัติที่ปิดเคสแล้ว</span>
            <span className="text-[11px] text-[#7B959A]">
              ({closedReferrals.length})
            </span>
          </button>
        </div>
      </div>

      {/* Referral Content List */}
      <div className="space-y-3.5">
        {activeSubTab === 'open' ? (
          openReferrals.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#D5EAE4] p-12 text-center text-[#6C858A]">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-sm text-[#102A2E]">
                ไม่มีเคสส่งต่อค้างอยู่ในระบบ
              </p>
              <p className="text-xs text-[#829CA1] mt-1">
                เมื่อ อสม. บันทึกการเยี่ยมบ้านและทำเครื่องหมายส่งต่อ เคสจะปรากฏที่นี่ทันที
              </p>
            </div>
          ) : (
            openReferrals.map((c) => {
              const ref = c.refer!;
              const elapsedHours = Math.round((Date.now() - ref.at) / 3600000);
              const isOverdue = !ref.accepted && elapsedHours >= 24;
              const isResolving = resolvingId === c.id;

              return (
                <div
                  key={c.id}
                  className={`bg-white rounded-xl border p-4 sm:p-5 shadow-xs transition-colors ${
                    isOverdue
                      ? 'border-red-300 bg-red-50/20'
                      : 'border-[#D5EAE4] hover:border-[#96D1C4]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono-code font-bold text-xs text-[#007A70] bg-[#E8F6F2] px-2 py-0.5 rounded">
                          {c.id}
                        </span>
                        <h3 className="font-bold text-sm sm:text-base text-[#0F292E]">
                          {getCaseName(c)}
                        </h3>
                        <span className="text-xs text-[#526B70]">
                          ({TYPE_LABELS[c.type]} · {c.zone})
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            ref.status === 'รอรับเรื่อง'
                              ? 'bg-[#FFE7A3] text-[#7A4900]'
                              : 'bg-[#E1F7EB] text-[#13743E]'
                          }`}
                        >
                          {ref.status}
                        </span>
                        {ref.urgency === 'urgent' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 animate-pulse">
                            ด่วนมาก
                          </span>
                        )}
                      </div>

                      {/* Reason / Clinical symptoms */}
                      <div className="bg-[#FAFDFD] border border-[#E3EFEA] rounded-lg p-3 text-xs text-[#203D42] space-y-1 mt-2">
                        <div className="font-semibold text-[#007066] flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          <span>เหตุผลและความจำเป็นในการส่งต่อ:</span>
                        </div>
                        <p className="text-sm font-medium text-[#132A2E]">
                          {ref.reason || c.note || 'อสม. แจ้งขอตรวจประเมินซ้ำโดยพยาบาล รพ.สต.'}
                        </p>
                        {c.visits.length > 0 && c.visits[c.visits.length - 1].bloodPressure && (
                          <p className="text-[#557176]">
                            ความดันโลหิตล่าสุด:{' '}
                            <strong className="text-[#A81724]">
                              {c.visits[c.visits.length - 1].bloodPressure} mmHg
                            </strong>
                          </p>
                        )}
                      </div>

                      {/* Reporter & Timing */}
                      <div className="flex items-center gap-3 text-xs text-[#5C777D] pt-1 flex-wrap">
                        <span>ผู้ส่งต่อ: <strong>{ref.by}</strong></span>
                        <span>·</span>
                        <span>เวลาที่ส่ง: {formatThaiDateTime(ref.at)}</span>
                        <span>·</span>
                        <span
                          className={`font-semibold ${
                            isOverdue
                              ? 'text-red-600 bg-red-100 px-1.5 py-0.5 rounded'
                              : 'text-slate-700'
                          }`}
                        >
                          ผ่านมาแล้ว {elapsedHours} ชั่วโมง {isOverdue && '(เกินเกณฑ์ 24 ชม.!)'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row sm:flex-col items-end gap-2 shrink-0 self-start">
                      {ref.status === 'รอรับเรื่อง' ? (
                        <button
                          type="button"
                          onClick={() => onAcceptReferral(c.id, 'พยาบาลวิชาชีพ รพ.สต.บ้านโปร่งเกตุ')}
                          className="px-3.5 py-2 text-xs font-bold rounded-lg bg-[#00857A] text-white hover:bg-[#007369] transition-colors shadow-xs flex items-center gap-1.5"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>รับเรื่องทันที</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setResolvingId(isResolving ? null : c.id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#17703A] text-white hover:bg-[#12582E] transition-colors shadow-xs flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isResolving ? 'ยกเลิก' : 'บันทึกปิดเคส'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onSelectCase(c.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#C8E3DC] bg-white text-[#254247] hover:bg-[#F2FAF8] flex items-center gap-1"
                      >
                        <span>ดูประวัติเต็ม</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Close / Resolve Form */}
                  {isResolving && (
                    <div className="mt-3 pt-3 border-t border-[#EEF7F4] space-y-2.5 bg-[#F6FAF8] p-3 rounded-lg">
                      <label className="block text-xs font-semibold text-[#112A2E]">
                        บันทึกผลการดูแล / ข้อสรุปการปิดเคสส่งต่อ:
                      </label>
                      <input
                        type="text"
                        value={resolveNote}
                        onChange={(e) => setResolveNote(e.target.value)}
                        placeholder="เช่น ให้ยาปฏิชีวนะรักษาเต้านมอักเสบ อาการดีขึ้น / ส่งต่อพบแพทย์ รพช. เรียบร้อย"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[#C8E3DC] bg-white"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setResolvingId(null)}
                          className="px-2.5 py-1 text-xs text-[#526B70] hover:text-[#112A2E]"
                        >
                          ยกเลิก
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmClose(c.id)}
                          className="px-3 py-1 text-xs font-bold rounded-lg bg-[#17703A] text-white hover:bg-[#12582E]"
                        >
                          ยืนยันปิดเคส
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )
        ) : (
          /* Closed Referrals Tab */
          closedReferrals.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#D5EAE4] p-12 text-center text-[#6C858A]">
              <p className="text-sm">ยังไม่มีประวัติเคสที่ปิดแล้ว</p>
            </div>
          ) : (
            closedReferrals.map((c) => {
              const ref = c.refer!;
              return (
                <div
                  key={c.id}
                  className="bg-white rounded-xl border border-[#D5EAE4] p-4 opacity-90 shadow-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-code font-bold text-xs text-[#007A70] bg-[#E8F6F2] px-1.5 py-0.5 rounded">
                        {c.id}
                      </span>
                      <span className="font-semibold text-sm text-[#0F292E]">
                        {getCaseName(c)}
                      </span>
                      <span className="text-xs text-[#627D82]">
                        ({TYPE_LABELS[c.type]})
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      ปิดเคสแล้ว
                    </span>
                  </div>

                  <p className="text-xs text-[#516C72]">
                    เหตุผลที่ส่งต่อ: {ref.reason || c.note}
                  </p>
                  {ref.responseNote && (
                    <p className="text-xs text-[#13743E] font-medium">
                      ผลการดำเนินการ: {ref.responseNote}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[11px] text-[#7A9398]">
                    <span>ส่งโดย: {ref.by}</span>
                    <button
                      type="button"
                      onClick={() => onSelectCase(c.id)}
                      className="text-[#00857A] hover:underline"
                    >
                      ดูข้อมูลเคส
                    </button>
                  </div>
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
};
