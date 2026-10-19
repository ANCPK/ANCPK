import React, { useState } from 'react';
import { CaseItem, CaseType, RiskLevel } from '../types';
import {
  TYPE_LABELS,
  RISK_LABELS,
  BF_LABELS,
  getDaysTo,
  formatThaiDate,
} from '../utils/helpers';
import {
  Search,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ClipboardPen,
  X,
  ArrowUpDown,
  Send,
  Baby,
  Heart,
} from 'lucide-react';

interface CaseListViewProps {
  cases: CaseItem[];
  showNames: boolean;
  onSelectCase: (caseId: string) => void;
  onRecordVisit: (caseId: string) => void;
  onOpenAddModal: () => void;
}

export const CaseListView: React.FC<CaseListViewProps> = ({
  cases,
  showNames,
  onSelectCase,
  onRecordVisit,
  onOpenAddModal,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<CaseType | 'all'>('all');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [overdueOnly, setOverdueOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'appt' | 'id' | 'risk'>('appt');

  const filtered = cases
    .filter((c) => {
      if (typeFilter !== 'all' && c.type !== typeFilter) return false;
      if (riskFilter !== 'all' && c.risk !== riskFilter) return false;
      if (zoneFilter !== 'all' && c.zone !== zoneFilter) return false;
      if (overdueOnly && getDaysTo(c.appt) >= 0) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const idMatch = c.id.toLowerCase().includes(q);
        const nameMatch = showNames && c.name.toLowerCase().includes(q);
        const vhvMatch = c.vhv.toLowerCase().includes(q);
        const noteMatch = (c.note || '').toLowerCase().includes(q);
        const phoneMatch = (c.phone || '').includes(q);
        if (!idMatch && !nameMatch && !vhvMatch && !noteMatch && !phoneMatch) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'appt') {
        return a.appt.localeCompare(b.appt);
      }
      if (sortBy === 'risk') {
        const score = (r: RiskLevel) =>
          r === 'high' ? 3 : r === 'mid' ? 2 : 1;
        return score(b.risk) - score(a.risk);
      }
      return a.id.localeCompare(b.id);
    });

  const getCaseName = (c: CaseItem) => (showNames ? c.name : c.id);

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-[#D5EAE4] p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#7B9499] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหารหัสเคส, ชื่อ-สกุล, เบอร์โทร, หรืออาการ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-[#C8E3DC] bg-[#FAFDFD] focus:outline-hidden focus:ring-1 focus:ring-[#00857A] focus:border-[#00857A]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7B9499] hover:text-[#0F282B]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Stats & Add Button */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-[#526B70]">
              พบ <strong className="text-[#0F282B]">{filtered.length}</strong> จาก{' '}
              {cases.length} เคส
            </span>
            <button
              type="button"
              onClick={onOpenAddModal}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#00857A] text-white hover:bg-[#007369] transition-colors shadow-xs"
            >
              + เพิ่มเคสใหม่
            </button>
          </div>
        </div>

        {/* Filter Chips & Toggles */}
        <div className="pt-2 border-t border-[#EDF6F3] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Target Group */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#6C858A] font-medium mr-1">กลุ่มเป้าหมาย:</span>
            {(['all', 'preg', 'post', 'child'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTypeFilter(key)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  typeFilter === key
                    ? 'bg-[#00857A] text-white'
                    : 'bg-[#F2F8F6] text-[#344E53] hover:bg-[#E3F2EE]'
                }`}
              >
                {key === 'all' ? 'ทั้งหมด' : TYPE_LABELS[key]}
              </button>
            ))}
          </div>

          {/* Risk Level */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#6C858A] font-medium mr-1">ความเสี่ยง:</span>
            {(['all', 'high', 'mid', 'low'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setRiskFilter(key)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  riskFilter === key
                    ? key === 'high'
                      ? 'bg-[#C81E2B] text-white'
                      : key === 'mid'
                      ? 'bg-[#D97706] text-white'
                      : key === 'low'
                      ? 'bg-[#17703A] text-white'
                      : 'bg-[#00857A] text-white'
                    : 'bg-[#F2F8F6] text-[#344E53] hover:bg-[#E3F2EE]'
                }`}
              >
                {key === 'all'
                  ? 'ทุกระดับ'
                  : key === 'high'
                  ? 'เสี่ยงสูง'
                  : key === 'mid'
                  ? 'เฝ้าระวัง'
                  : 'ปกติ'}
              </button>
            ))}
          </div>

          {/* Zone & Overdue */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="px-2 py-1 rounded-md border border-[#C8E3DC] bg-[#FAFDFD] text-xs text-[#2A4449]"
            >
              <option value="all">ทุกคุ้ม / ทุกหมู่บ้าน</option>
              <option value="คุ้ม 1">คุ้ม 1 (บ้านเหนือ)</option>
              <option value="คุ้ม 2">คุ้ม 2 (บ้านกลาง)</option>
              <option value="คุ้ม 3">คุ้ม 3 (บ้านใต้)</option>
            </select>

            <label className="inline-flex items-center gap-1.5 cursor-pointer bg-[#FDF2F2] px-2.5 py-1 rounded-md border border-[#FADCDD] text-xs text-[#A81724]">
              <input
                type="checkbox"
                checked={overdueOnly}
                onChange={(e) => setOverdueOnly(e.target.checked)}
                className="rounded accent-[#C81E2B]"
              />
              <span className="font-semibold">เฉพาะที่เลยนัด</span>
            </label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1 rounded-md border border-[#C8E3DC] bg-[#FAFDFD] text-xs text-[#2A4449]"
            >
              <option value="appt">เรียงตาม: วันนัดตรวจ</option>
              <option value="risk">เรียงตาม: ระดับความเสี่ยง</option>
              <option value="id">เรียงตาม: รหัสเคส</option>
            </select>
          </div>
        </div>
      </div>

      {/* Case Table / Roster */}
      <div className="bg-white rounded-xl border border-[#D5EAE4] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F6FAF9] text-[#557176] border-b border-[#D5EAE4] font-semibold">
                <th className="py-3 px-4">รหัสเคส & ข้อมูลบุคคล</th>
                <th className="py-3 px-3">กลุ่มวัย</th>
                <th className="py-3 px-3">ระดับความเสี่ยง</th>
                <th className="py-3 px-3">วันนัดครั้งถัดไป</th>
                <th className="py-3 px-3">ข้อมูลสุขภาพเฉพาะ</th>
                <th className="py-3 px-3">อสม. & คุ้ม</th>
                <th className="py-3 px-4 text-right">การปฏิบัติงาน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF5F2]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6C858A]">
                    <p className="text-sm">ไม่พบเคสที่ตรงกับเงื่อนไขการค้นหา</p>
                    <p className="text-xs text-[#90A7AB] mt-1">
                      ลองเปลี่ยนตัวกรอง หรือค้นหาด้วยคำอื่น
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const days = getDaysTo(c.appt);
                  const isOverdue = days < 0;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelectCase(c.id)}
                      className="hover:bg-[#F3FAF8] transition-colors cursor-pointer group"
                    >
                      {/* Case ID and Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-code font-bold text-xs text-[#007A70] bg-[#E8F6F2] px-1.5 py-0.5 rounded">
                            {c.id}
                          </span>
                          <span className="font-semibold text-[#0F292E] text-sm group-hover:text-[#00857A]">
                            {getCaseName(c)}
                          </span>
                          {c.refer && c.refer.status !== 'ปิดเคสแล้ว' && (
                            <span
                              className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-100 text-red-700 flex items-center gap-0.5"
                              title="มีเคสส่งต่อค้างอยู่"
                            >
                              <Send className="w-2.5 h-2.5" />
                              <span>Refer</span>
                            </span>
                          )}
                        </div>
                        {c.note && (
                          <p className="text-[11px] text-[#6E888E] mt-0.5 max-w-xs truncate">
                            {c.note}
                          </p>
                        )}
                        {showNames && c.phone && (
                          <span className="text-[11px] text-[#557176] font-mono-code">
                            โทร: {c.phone}
                          </span>
                        )}
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3">
                        <span className="text-[#203D42] font-medium">
                          {TYPE_LABELS[c.type]}
                        </span>
                        {c.type === 'preg' && c.gestationalAgeWeeks && (
                          <div className="text-[11px] text-[#5F7D83]">
                            GA {c.gestationalAgeWeeks} สัปดาห์
                          </div>
                        )}
                        {c.type === 'child' && c.childAgeMonths !== undefined && (
                          <div className="text-[11px] text-[#5F7D83]">
                            อายุ {c.childAgeMonths} เดือน
                          </div>
                        )}
                      </td>

                      {/* Risk */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            c.risk === 'high'
                              ? 'bg-[#FFD6D3] text-[#A81724]'
                              : c.risk === 'mid'
                              ? 'bg-[#FFE7A3] text-[#7A4900]'
                              : 'bg-[#C6F1D2] text-[#146635]'
                          }`}
                        >
                          <span>
                            {c.risk === 'high' ? '▲' : c.risk === 'mid' ? '●' : '✓'}
                          </span>
                          <span>
                            {c.risk === 'high'
                              ? 'เสี่ยงสูง'
                              : c.risk === 'mid'
                              ? 'เฝ้าระวัง'
                              : 'ปกติ'}
                          </span>
                        </span>
                      </td>

                      {/* Next Appt */}
                      <td className="py-3 px-3">
                        <div className="text-[#102B30] font-medium">
                          {formatThaiDate(c.appt)}
                        </div>
                        <div className="mt-0.5">
                          {isOverdue ? (
                            <span className="font-bold text-[#C81E2B] text-[11px]">
                              เลยนัด {Math.abs(days)} วัน
                            </span>
                          ) : days === 0 ? (
                            <span className="font-bold text-[#C81E2B] text-[11px]">
                              นัดวันนี้
                            </span>
                          ) : (
                            <span className="text-[#557176] text-[11px]">
                              อีก {days} วัน
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Health Indicators */}
                      <td className="py-3 px-3 text-[11px] text-[#3A565C]">
                        {c.type === 'preg' && (
                          <div>
                            <span>ANC &lt; 12wk: </span>
                            <span
                              className={`font-semibold ${
                                c.earlyANC === true
                                  ? 'text-[#17703A]'
                                  : c.earlyANC === false
                                  ? 'text-[#C81E2B]'
                                  : 'text-[#6C858A]'
                              }`}
                            >
                              {c.earlyANC === true ? 'ตรงเกณฑ์' : c.earlyANC === false ? 'มาช้า' : '-'}
                            </span>
                          </div>
                        )}

                        {c.bf && (
                          <div>
                            <span>นมแม่: </span>
                            <span className="font-medium text-[#0F292E]">
                              {BF_LABELS[c.bf]}
                            </span>
                          </div>
                        )}

                        {c.type === 'child' && (
                          <div>
                            <span>วัคซีน: </span>
                            <span
                              className={`font-semibold ${
                                c.vaccine ? 'text-[#17703A]' : 'text-[#C81E2B]'
                              }`}
                            >
                              {c.vaccine ? 'ครบตามเกณฑ์' : 'ยังไม่ครบ'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* VHV & Zone */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-[#112D31]">{c.zone}</div>
                        <div className="text-[11px] text-[#5A767C]">{c.vhv}</div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onRecordVisit(c.id)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#E6F5F2] text-[#007066] hover:bg-[#00857A] hover:text-white transition-colors"
                          >
                            บันทึกเยี่ยม
                          </button>
                          <button
                            type="button"
                            onClick={() => onSelectCase(c.id)}
                            className="p-1 text-[#658288] hover:text-[#0F282B] rounded-md hover:bg-slate-100"
                            title="ดูรายละเอียด"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
