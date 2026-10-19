import React from 'react';
import { Eye, EyeOff, Plus, Download, RotateCcw, Activity } from 'lucide-react';

interface HeaderProps {
  showNames: boolean;
  onToggleNames: () => void;
  onOpenAddModal: () => void;
  onExportCsv: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  showNames,
  onToggleNames,
  onOpenAddModal,
  onExportCsv,
  onResetData,
}) => {
  return (
    <header className="border-b border-[#C8E3DC] bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00857A] to-[#12A57F] flex items-center justify-center text-white shadow-xs">
            <Activity className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base sm:text-lg text-[#0F282B] tracking-tight">
                Smart ANC & MCH Tracker
              </span>
              <span className="hidden sm:inline text-xs font-mono-code px-1.5 py-0.5 rounded bg-[#E6F5F2] text-[#007066] font-medium">
                v2.4
              </span>
            </div>
            <p className="text-xs text-[#526B70]">
              ระบบติดตามแม่และเด็กออนไลน์ · รพ.สต.บ้านโปร่งเกตุ
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onToggleNames}
            title={showNames ? 'เปิดโหมดปกปิดข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล' : 'แสดงชื่อเต็ม'}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
              showNames
                ? 'bg-white text-[#294247] border-[#C8E3DC] hover:bg-[#F2FAF8]'
                : 'bg-[#00857A] text-white border-[#00857A]'
            }`}
          >
            {showNames ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-[#526B70]" />
                <span>ซ่อนชื่อ (PDPA)</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-white" />
                <span>แสดงชื่อเต็ม</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onExportCsv}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-[#C8E3DC] bg-white text-[#294247] hover:bg-[#F2FAF8] transition-colors whitespace-nowrap"
            title="ส่งออกรายงานข้อมูลเคสเป็นไฟล์ CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#526B70]" />
            <span>ส่งออก CSV</span>
          </button>

          <button
            type="button"
            onClick={onResetData}
            className="p-2 text-xs font-medium rounded-lg border border-[#C8E3DC] bg-white text-[#526B70] hover:text-[#132A2E] hover:bg-[#F2FAF8] transition-colors"
            title="คืนค่าข้อมูลตัวอย่างเริ่มต้น"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#00857A] text-white hover:bg-[#007369] transition-colors shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>เพิ่มเคสใหม่</span>
          </button>
        </div>
      </div>
    </header>
  );
};
