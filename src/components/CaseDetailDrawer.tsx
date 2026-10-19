import React, { useState } from 'react';
import { CaseItem } from '../types';
import {
  TYPE_LABELS,
  RISK_LABELS,
  BF_LABELS,
  getDaysTo,
  formatThaiDate,
} from '../utils/helpers';
import {
  X,
  Calendar,
  MapPin,
  User,
  Heart,
  Baby,
  ClipboardPen,
  Send,
  AlertTriangle,
  Clock,
  Phone,
  CheckCircle2,
  Edit,
} from 'lucide-react';

interface CaseDetailDrawerProps {
  caseItem: CaseItem | null;
  showNames: boolean;
  onClose: () => void;
  onRecordVisit: (caseId: string) => void;
  onUpdateAppt: (caseId: string, newDate: string) => void;
  onPickNewLocation: (caseId: string) => void;
}

export const CaseDetailDrawer: React.FC<CaseDetailDrawerProps> = ({
  caseItem,
  showNames,
  onClose,
  onRecordVisit,
  onUpdateAppt,
  onPickNewLocation,
}) => {
  if (!caseItem) return null;

  const [apptInput, setApptInput] = useState(caseItem.appt);
  const [isUpdatingAppt, setIsUpdatingAppt] = useState(false);

  const days = getDaysTo(caseItem.appt);
  const isOverdue = days < 0;

  const handleSaveAppt = () => {
    if (apptInput) {
      onUpdateAppt(caseItem.id, apptInput);
      setIsUpdatingAppt(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop scrim */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <aside className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#D5EAE4] bg-[#F7FBF9] flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono-code font-bold text-xs text-[#007A70] bg-[#E8F6F2] px-2 py-0.5 rounded">
                {caseItem.id}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  caseItem.risk === 'high'
                    ? 'bg-[#FFD6D3] text-[#A81724]'
                    : caseItem.risk === 'mid'
                    ? 'bg-[#FFE7A3] text-[#7A4900]'
                    : 'bg-[#C6F1D2] text-[#146635]'
                }`}
              >
                {RISK_LABELS[caseItem.risk]}
              </span>
              <span className="text-xs text-[#526B70] bg-white border border-[#D5EAE4] px-2 py-0.5 rounded-full font-medium">
                {TYPE_LABELS[caseItem.type]}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#0F292E] truncate mt-1">
              {showNames ? caseItem.name : `รหัสเคส ${caseItem.id}`}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#68858A] hover:text-[#0F292E] rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button Bar */}
        <div className="p-3 bg-[#EBF5F2] border-b border-[#D5EAE4] flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onRecordVisit(caseItem.id)}
            className="flex-1 py-2 px-3 text-xs font-bold rounded-lg bg-[#00857A] text-white hover:bg-[#007369] transition-colors shadow-xs flex items-center justify-center gap-1.5"
          >
            <ClipboardPen className="w-4 h-4" />
            <span>บันทึกการเยี่ยมบ้าน</span>
          </button>

          <button
            type="button"
            onClick={() => onPickNewLocation(caseItem.id)}
            className="py-2 px-3 text-xs font-semibold rounded-lg bg-white text-[#29454A] border border-[#C8E3DC] hover:bg-[#F2FAF8] transition-colors flex items-center gap-1.5"
            title="ย้ายหมุดตำแหน่งบ้านบนแผนที่"
          >
            <MapPin className="w-3.5 h-3.5 text-[#00857A]" />
            <span>ย้ายหมุด</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Active Referral Alert Banner */}
          {caseItem.refer && caseItem.refer.status !== 'ปิดเคสแล้ว' && (
            <div className="bg-[#FFF4E5] border border-[#FFD8A8] rounded-xl p-3.5 text-xs text-[#7A4900] space-y-1">
              <div className="flex items-center justify-between font-bold text-sm text-[#8C4F00]">
                <span className="flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-amber-600" />
                  <span>มีเคสส่งต่อ (Refer) อยู่ระหว่างดำเนินการ</span>
                </span>
                <span className="bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                  {caseItem.refer.status}
                </span>
              </div>
              <p className="text-xs text-[#5C3900]">
                เหตุผล: {caseItem.refer.reason || caseItem.note}
              </p>
              <p className="text-[11px] text-[#7A4900]/80">
                ส่งโดย {caseItem.refer.by}
              </p>
            </div>
          )}

          {/* Demographic & Clinical Data List */}
          <div className="bg-[#FAFDFD] border border-[#D5EAE4] rounded-xl p-4 text-xs space-y-2.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#007A70] pb-1 border-b border-[#EDF6F3]">
              ข้อมูลพื้นฐานและการนัดหมาย
            </h3>

            <div className="grid grid-cols-2 gap-2 text-[#466268]">
              <div>
                <span className="text-[#759096] block text-[11px]">กลุ่มวัย:</span>
                <span className="font-medium text-[#112D32]">
                  {TYPE_LABELS[caseItem.type]}
                  {caseItem.type === 'preg' && caseItem.gestationalAgeWeeks && (
                    <span className="text-[#007A70] font-semibold">
                      {' '}
                      (GA {caseItem.gestationalAgeWeeks} wk)
                    </span>
                  )}
                  {caseItem.type === 'child' && caseItem.childAgeMonths !== undefined && (
                    <span className="text-[#007A70] font-semibold">
                      {' '}
                      ({caseItem.childAgeMonths} เดือน)
                    </span>
                  )}
                </span>
              </div>

              <div>
                <span className="text-[#759096] block text-[11px]">อายุ:</span>
                <span className="font-medium text-[#112D32]">
                  {caseItem.age !== undefined ? `${caseItem.age} ปี` : '-'}
                </span>
              </div>

              {showNames && caseItem.phone && (
                <div>
                  <span className="text-[#759096] block text-[11px]">เบอร์โทรศัพท์:</span>
                  <a
                    href={`tel:${caseItem.phone}`}
                    className="font-medium text-[#00857A] hover:underline flex items-center gap-1 font-mono-code"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{caseItem.phone}</span>
                  </a>
                </div>
              )}

              <div>
                <span className="text-[#759096] block text-[11px]">คุ้ม / พื้นที่:</span>
                <span className="font-medium text-[#112D32]">{caseItem.zone}</span>
              </div>

              <div className="col-span-2">
                <span className="text-[#759096] block text-[11px]">ที่อยู่บ้าน:</span>
                <span className="font-medium text-[#112D32]">
                  {caseItem.address || `${caseItem.zone} ต.บ้านโปร่งเกตุ`}
                </span>
              </div>

              <div>
                <span className="text-[#759096] block text-[11px]">พิกัด GPS ชุมชน:</span>
                <span className="font-mono-code text-[#112D32]">
                  {caseItem.lat.toFixed(4)}, {caseItem.lng.toFixed(4)}
                </span>
              </div>

              <div>
                <span className="text-[#759096] block text-[11px]">อสม. ผู้รับผิดชอบ:</span>
                <span className="font-medium text-[#112D32]">{caseItem.vhv}</span>
              </div>

              {caseItem.bf && (
                <div>
                  <span className="text-[#759096] block text-[11px]">การให้นม:</span>
                  <span className="font-medium text-[#112D32]">
                    {BF_LABELS[caseItem.bf]}
                  </span>
                </div>
              )}

              {caseItem.type === 'child' && (
                <div>
                  <span className="text-[#759096] block text-[11px]">ประวัติวัคซีน:</span>
                  <span
                    className={`font-semibold ${
                      caseItem.vaccine ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {caseItem.vaccine ? 'ครบตามเกณฑ์' : 'ยังไม่ครบตามเกณฑ์'}
                  </span>
                </div>
              )}

              {caseItem.note && (
                <div className="col-span-2 pt-1 border-t border-[#EDF6F3]">
                  <span className="text-[#759096] block text-[11px]">หมายเหตุ / ข้อควรระวัง:</span>
                  <p className="text-[#102B30] mt-0.5">{caseItem.note}</p>
                </div>
              )}
            </div>
          </div>

          {/* Appointment Scheduler Box */}
          <div className="bg-white border border-[#D5EAE4] rounded-xl p-4 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#102A2E] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#00857A]" />
                <span>วันนัดตรวจครั้งถัดไป</span>
              </span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  isOverdue
                    ? 'bg-red-100 text-red-700'
                    : days === 0
                    ? 'bg-red-100 text-red-700'
                    : 'bg-[#EBF7F4] text-[#007066]'
                }`}
              >
                {isOverdue
                  ? `เลยนัด ${Math.abs(days)} วัน`
                  : days === 0
                  ? 'นัดวันนี้'
                  : `อีก ${days} วัน`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={apptInput}
                onChange={(e) => setApptInput(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-[#C8E3DC] bg-[#FAFDFD] text-[#132A2E] flex-1"
              />
              <button
                type="button"
                onClick={handleSaveAppt}
                disabled={apptInput === caseItem.appt}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  apptInput !== caseItem.appt
                    ? 'bg-[#00857A] text-white hover:bg-[#007369]'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                บันทึกวันนัดใหม่
              </button>
            </div>
            <p className="text-[11px] text-[#69858A]">
              นัดปัจจุบัน: {formatThaiDate(caseItem.appt)}
            </p>
          </div>

          {/* Home Visit History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#0F292E] flex items-center gap-1.5">
                <ClipboardPen className="w-4 h-4 text-[#00857A]" />
                <span>ประวัติการเยี่ยมบ้านและการตรวจคัดกรอง ({caseItem.visits.length})</span>
              </h3>
            </div>

            {caseItem.visits.length === 0 ? (
              <div className="bg-[#FAFDFD] border border-dashed border-[#C8E3DC] rounded-xl p-6 text-center text-xs text-[#6A868C]">
                <p>ยังไม่มีบันทึกการเยี่ยมบ้านสำหรับเคสนี้</p>
                <button
                  type="button"
                  onClick={() => onRecordVisit(caseItem.id)}
                  className="mt-2 text-[#00857A] font-semibold hover:underline"
                >
                  + บันทึกการลงเยี่ยมบ้านครั้งแรก
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {caseItem.visits
                  .slice()
                  .reverse()
                  .map((v) => (
                    <div
                      key={v.id}
                      className="bg-[#FAFDFD] border border-[#D5EAE4] rounded-xl p-3.5 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0F292E]">
                            {formatThaiDate(v.d)}
                          </span>
                          <span className="text-[#6C858A]">โดย {v.by}</span>
                        </div>
                        {v.refer && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                            ส่งต่อ Refer
                          </span>
                        )}
                      </div>

                      {v.topics && v.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {v.topics.map((t, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-full bg-[#EBF7F4] text-[#007066] text-[10px] font-medium"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Clinical metrics */}
                      <div className="flex flex-wrap gap-3 text-[11px] text-[#415C61] pt-1">
                        {v.bloodPressure && (
                          <span>
                            ความดัน: <strong>{v.bloodPressure} mmHg</strong>
                          </span>
                        )}
                        {v.weightKg && (
                          <span>
                            น้ำหนัก: <strong>{v.weightKg} กก.</strong>
                          </span>
                        )}
                        {v.latch && (
                          <span>
                            การเข้าเต้า: <strong>{v.latch}</strong>
                          </span>
                        )}
                        {v.dspm && (
                          <span>
                            DSPM: <strong>{v.dspm}</strong>
                          </span>
                        )}
                      </div>

                      {v.text && (
                        <p className="text-[#132A2E] bg-white p-2.5 rounded-lg border border-[#E3EFEA] text-xs">
                          {v.text}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};
