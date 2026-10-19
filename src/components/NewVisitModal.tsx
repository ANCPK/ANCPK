import React, { useState } from 'react';
import { CaseItem, VisitRecord } from '../types';
import { TYPE_LABELS, RISK_LABELS } from '../utils/helpers';
import {
  X,
  ClipboardPen,
  AlertTriangle,
  Heart,
  Baby,
  Activity,
  Send,
  CheckCircle2,
} from 'lucide-react';

interface NewVisitModalProps {
  caseItem: CaseItem | null;
  onClose: () => void;
  onSaveVisit: (
    caseId: string,
    visitData: {
      topics: string[];
      latch?: string;
      dspm?: string;
      text: string;
      bloodPressure?: string;
      weightKg?: number;
      refer: boolean;
      referReason?: string;
      urgency?: 'urgent' | 'routine';
    }
  ) => void;
}

export const NewVisitModal: React.FC<NewVisitModalProps> = ({
  caseItem,
  onClose,
  onSaveVisit,
}) => {
  if (!caseItem) return null;

  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    caseItem.type === 'preg'
      ? 'การทานยาบำรุง'
      : caseItem.type === 'child'
      ? 'พัฒนาการเด็ก'
      : 'การเลี้ยงลูกด้วยนมแม่',
  ]);
  const [latch, setLatch] = useState<string>('');
  const [dspm, setDspm] = useState<string>('');
  const [bloodPressure, setBloodPressure] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [refer, setRefer] = useState<boolean>(false);
  const [referReason, setReferReason] = useState<string>('');
  const [urgency, setUrgency] = useState<'urgent' | 'routine'>('routine');

  const availableTopics = [
    'การทานยาบำรุง (ธาตุเหล็ก/โฟลิก/ไอโอดีน)',
    'การเลี้ยงลูกด้วยนมแม่',
    'พัฒนาการเด็ก (DSPM)',
    'อาหารและโภชนาการตามวัย',
    'การสังเกตสัญญาณอันตราย',
    'การคัดกรองภาวะซึมเศร้า (2Q)',
    'การตรวจฟันและช่องปาก',
  ];

  const handleToggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveVisit(caseItem.id, {
      topics: selectedTopics,
      latch: caseItem.type !== 'preg' ? latch : undefined,
      dspm: caseItem.type === 'child' ? dspm : undefined,
      bloodPressure: bloodPressure.trim() || undefined,
      weightKg: weightKg ? parseFloat(weightKg) : undefined,
      text: notes.trim(),
      refer,
      referReason: refer ? referReason.trim() || notes.trim() : undefined,
      urgency,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl border border-[#C8E3DC] shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#D5EAE4] bg-[#F7FBF9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E6F5F2] text-[#00857A] flex items-center justify-center">
              <ClipboardPen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#0F292E]">
                บันทึกการเยี่ยมบ้าน (Home Visit)
              </h3>
              <p className="text-xs text-[#526B70]">
                {caseItem.id} · {caseItem.name} ({TYPE_LABELS[caseItem.type]})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#67848A] hover:text-[#0F292E] rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {/* Topics Checklist */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#102A2E] block">
              ประเด็นที่ติดตามและให้คำแนะนำในการเยี่ยม:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {availableTopics.map((topic) => (
                <label
                  key={topic}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    selectedTopics.includes(topic)
                      ? 'border-[#00857A] bg-[#F0FAF7] text-[#007066] font-medium'
                      : 'border-[#D5EAE4] bg-white text-[#4A646A]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes(topic)}
                    onChange={() => handleToggleTopic(topic)}
                    className="rounded accent-[#00857A]"
                  />
                  <span className="truncate">{topic}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Vitals: BP & Weight */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="font-semibold text-[#102A2E] block mb-1">
                ความดันโลหิต (BP mmHg)
              </label>
              <input
                type="text"
                placeholder="เช่น 120/80"
                value={bloodPressure}
                onChange={(e) => setBloodPressure(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#C8E3DC] bg-[#FAFDFD] text-xs font-mono-code"
              />
            </div>

            <div>
              <label className="font-semibold text-[#102A2E] block mb-1">
                น้ำหนักตัว (กก.)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="เช่น 55.4 หรือ 8.2"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#C8E3DC] bg-[#FAFDFD] text-xs font-mono-code"
              />
            </div>
          </div>

          {/* Latch Assessment (if not pregnant) */}
          {caseItem.type !== 'preg' && (
            <div className="space-y-1 pt-1">
              <label className="font-semibold text-[#102A2E] block">
                การประเมินการเข้าเต้า / สุขภาพเต้านม:
              </label>
              <select
                value={latch}
                onChange={(e) => setLatch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#C8E3DC] bg-[#FAFDFD] text-xs text-[#132A2E]"
              >
                <option value="">-- ไม่ได้ประเมิน --</option>
                <option value="เข้าเต้าถูกต้อง">เข้าเต้าถูกต้อง (อมลึกถึงลานนม คางแนบเต้า)</option>
                <option value="เข้าเต้าไม่ดี/หัวนมเจ็บ">
                  เข้าเต้าไม่ดี / หัวนมเจ็บ แตก หรือเต้านมคัดตึง
                </option>
                <option value="เต้านมอักเสบร้อนแดง">
                  เต้านมอักเสบร้อนแดง มีไข้ (สงสัย Mastitis)
                </option>
              </select>
            </div>
          )}

          {/* DSPM (if child) */}
          {caseItem.type === 'child' && (
            <div className="space-y-1 pt-1">
              <label className="font-semibold text-[#102A2E] block">
                ผลการคัดกรองพัฒนาการเด็ก (DSPM):
              </label>
              <select
                value={dspm}
                onChange={(e) => {
                  setDspm(e.target.value);
                  if (e.target.value === 'สงสัยล่าช้า') {
                    setRefer(true);
                    setReferReason('สงสัยพัฒนาการล่าช้าตามเกณฑ์ DSPM');
                  }
                }}
                className="w-full px-3 py-2 rounded-lg border border-[#C8E3DC] bg-[#FAFDFD] text-xs text-[#132A2E]"
              >
                <option value="">-- ไม่ได้ประเมิน --</option>
                <option value="สมวัย">สมวัย (ผ่านเกณฑ์ทุกข้อ)</option>
                <option value="สงสัยล่าช้า">สงสัยล่าช้า (ไม่ผ่านอย่างน้อย 1 ด้าน)</option>
              </select>
            </div>
          )}

          {/* Clinical Findings / Notes */}
          <div className="space-y-1">
            <label className="font-semibold text-[#102A2E] block">
              ผลการตรวจประเมินเบื้องต้นและคำแนะนำ:
            </label>
            <textarea
              rows={3}
              placeholder="บันทึกสภาพความเป็นอยู่, อาการที่พบ, หรือสิ่งที่แนะนำคุณแม่..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#C8E3DC] bg-[#FAFDFD] text-xs"
            />
          </div>

          {/* Referral Option */}
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={refer}
                onChange={(e) => setRefer(e.target.checked)}
                className="rounded accent-red-600 w-4 h-4"
              />
              <span className="font-bold text-sm text-[#7A4900] flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-red-600" />
                <span>ต้องการส่งต่อ รพ.สต. (Refer to Health Center)</span>
              </span>
            </label>

            {refer && (
              <div className="space-y-2 pt-2 border-t border-amber-200/60 pl-6">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-[#613B00]">ระดับความเร่งด่วน:</span>
                  <label className="inline-flex items-center gap-1 text-slate-800">
                    <input
                      type="radio"
                      name="urgency"
                      value="routine"
                      checked={urgency === 'routine'}
                      onChange={() => setUrgency('routine')}
                      className="accent-[#00857A]"
                    />
                    <span>ทั่วไป (&lt; 24 ชม.)</span>
                  </label>
                  <label className="inline-flex items-center gap-1 text-red-700 font-semibold">
                    <input
                      type="radio"
                      name="urgency"
                      value="urgent"
                      checked={urgency === 'urgent'}
                      onChange={() => setUrgency('urgent')}
                      className="accent-red-600"
                    />
                    <span>ด่วนมาก (&lt; 6-12 ชม.)</span>
                  </label>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="ระบุอาการสำคัญที่ต้องส่งต่อ เช่น ความดันสูง, ไข้สูง, ปวดท้อง..."
                    value={referReason}
                    onChange={(e) => setReferReason(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#C8E3DC] bg-white text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#C8E3DC] text-[#486368] hover:bg-[#F2FAF8]"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-lg bg-[#00857A] text-white hover:bg-[#007369] transition-colors shadow-xs"
            >
              บันทึกการเยี่ยมบ้าน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
