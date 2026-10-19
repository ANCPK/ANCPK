import React, { useState } from 'react';
import { CaseItem, CaseType, RiskLevel, BreastfeedingType } from '../types';
import { TYPE_LABELS, RISK_LABELS, BF_LABELS, offsetDate } from '../utils/helpers';
import { X, UserPlus, MapPin, Calendar, Crosshair, AlertCircle } from 'lucide-react';

interface AddCaseModalProps {
  cases: CaseItem[];
  onClose: () => void;
  onSaveCase: (newCase: CaseItem) => void;
  onPickOnMap: (currentDraft: Partial<CaseItem>) => void;
  initialLocation?: { lat: number; lng: number } | null;
}

export const AddCaseModal: React.FC<AddCaseModalProps> = ({
  cases,
  onClose,
  onSaveCase,
  onPickOnMap,
  initialLocation,
}) => {
  const [type, setType] = useState<CaseType>('preg');
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('25');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [zone, setZone] = useState('คุ้ม 1');
  const [risk, setRisk] = useState<RiskLevel>('low');
  const [appt, setAppt] = useState(offsetDate(14));
  const [vhv, setVhv] = useState('VHV-01 (อสม. สมศรี)');
  const [bf, setBf] = useState<BreastfeedingType | ''>('');
  const [earlyANC, setEarlyANC] = useState<boolean>(true);
  const [vaccine, setVaccine] = useState<boolean>(true);
  const [gaWeeks, setGaWeeks] = useState<string>('16');
  const [childMonths, setChildMonths] = useState<string>('6');
  const [note, setNote] = useState('');
  const [lat, setLat] = useState<number>(initialLocation?.lat || 13.7558);
  const [lng, setLng] = useState<number>(initialLocation?.lng || 100.5015);
  const [error, setError] = useState('');

  // Zone defaults for coordinates and VHV
  const handleZoneChange = (newZone: string) => {
    setZone(newZone);
    if (newZone === 'คุ้ม 1') {
      setVhv('VHV-01 (อสม. สมศรี)');
      if (!initialLocation) {
        setLat(13.7555);
        setLng(100.5002);
      }
    } else if (newZone === 'คุ้ม 2') {
      setVhv('VHV-02 (อสม. สุภาพร)');
      if (!initialLocation) {
        setLat(13.7565);
        setLng(100.5025);
      }
    } else {
      setVhv('VHV-03 (อสม. ประนอม)');
      if (!initialLocation) {
        setLat(13.7558);
        setLng(100.5048);
      }
    }
  };

  const handlePickMap = () => {
    onPickOnMap({
      type,
      name,
      risk,
      appt,
      zone,
      vhv,
      bf: bf || null,
      note,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('กรุณากรอกชื่อ-นามสกุล');
      return;
    }
    if (!appt) {
      setError('กรุณาระบุวันนัดครั้งถัดไป');
      return;
    }

    // Generate new ID
    const prefix = type === 'child' ? 'C' : 'M';
    const existingNums = cases
      .filter((c) => c.id.startsWith(prefix))
      .map((c) => parseInt(c.id.split('-')[1], 10))
      .filter((n) => !isNaN(n));
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
    const newId = `${prefix}-${String(nextNum).padStart(3, '0')}`;

    const newCase: CaseItem = {
      id: newId,
      name: name.trim(),
      age: age ? parseInt(age, 10) : undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      zone,
      type,
      risk,
      appt,
      lat,
      lng,
      vhv,
      bf: bf ? bf : null,
      earlyANC: type === 'preg' ? earlyANC : null,
      vaccine: type === 'child' ? vaccine : null,
      gestationalAgeWeeks:
        type === 'preg' && gaWeeks ? parseInt(gaWeeks, 10) : undefined,
      childAgeMonths:
        type === 'child' && childMonths ? parseInt(childMonths, 10) : undefined,
      note: note.trim(),
      refer: null,
      visits: [],
    };

    onSaveCase(newCase);
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
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#0F292E]">
                เพิ่มเคสใหม่ (ลงทะเบียนแม่และเด็ก)
              </h3>
              <p className="text-xs text-[#526B70]">
                บันทึกเข้าสู่ระบบติดตาม รพ.สต.บ้านโปร่งเกตุ
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
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Group Type */}
          <div>
            <label className="font-semibold text-[#102A2E] block mb-1.5">
              กลุ่มเป้าหมาย (Category):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['preg', 'post', 'child'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    if (t === 'preg') setBf('');
                    if (t === 'post' && !bf) setBf('ex');
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    type === t
                      ? 'border-[#00857A] bg-[#F0FAF7] text-[#007066] font-bold shadow-xs'
                      : 'border-[#D5EAE4] bg-white text-[#4D676D] hover:bg-[#F8FCFB]'
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Age */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="font-semibold text-[#102A2E] block mb-1">
                ชื่อ-นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="เช่น นางสาววิภาวรรณ ขาวสะอาด"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#C8E3DC] bg-[#FAFDFD]"
              />
            </div>
            <div>
              <label className="font-semibold text-[#102A2E] block mb-1">
                อายุ (ปี)
              </label>
              <input
                type="number"
                placeholder="เช่น 28"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#C8E3DC] bg-[#FAFDFD] font-mono-code"
              />
            </div>
          </div>

          {/* Phone & Address */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#102A2E] block mb-1">
                เบอร์โทรศัพท์
              </label>
              <input
                type="tel"
                placeholder="เช่น 081-234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#C8E3DC] bg-[#FAFDFD] font-mono-code"
              />
            </div>
            <div>
              <label className="font-semibold text-[#102A2E] block mb-1">
                คุ้ม / พื้นที่
              </label>
              <select
                value={zone}
                onChange={(e) => handleZoneChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#C8E3DC] bg-[#FAFDFD]"
              >
                <option value="คุ้ม 1">คุ้ม 1 (บ้านเหนือ · ม.1)</option>
                <option value="คุ้ม 2">คุ้ม 2 (บ้านกลาง · ม.2)</option>
                <option value="คุ้ม 3">คุ้ม 3 (บ้านใต้ · ม.3)</option>
              </select>
            </div>
          </div>

          {/* Risk Level & Next Appointment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#102A2E] block mb-1">
                ระดับความเสี่ยง
              </label>
              <select
                value={risk}
                onChange={(e) => setRisk(e.target.value as RiskLevel)}
                className="w-full px-3 py-2 rounded-lg border border-[#C8E3DC] bg-[#FAFDFD]"
              >
                <option value="low">ปกติ (Low Risk)</option>
                <option value="mid">เฝ้าระวัง (Moderate Risk)</option>
                <option value="high">เสี่ยงสูง (High Risk)</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-[#102A2E] block mb-1">
                วันนัดตรวจครั้งถัดไป <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={appt}
                onChange={(e) => setAppt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#C8E3DC] bg-[#FAFDFD]"
              />
            </div>
          </div>

          {/* Conditional Type Fields */}
          {type === 'preg' && (
            <div className="p-3 bg-[#F0FAF7] border border-[#CDEAE2] rounded-xl space-y-2">
              <span className="font-bold text-[#007066] block">
                ข้อมูลการตั้งครรภ์ (ANC Detail):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-[#415F65] mb-1">
                    อายุครรภ์ (GA สัปดาห์):
                  </label>
                  <input
                    type="number"
                    value={gaWeeks}
                    onChange={(e) => setGaWeeks(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#C8E3DC] bg-white font-mono-code text-xs"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={earlyANC}
                      onChange={(e) => setEarlyANC(e.target.checked)}
                      className="rounded accent-[#00857A]"
                    />
                    <span className="text-[11px] text-[#2F494E]">
                      ฝากครรภ์ก่อน 12 สัปดาห์
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {type === 'post' && (
            <div className="p-3 bg-[#F0FAF7] border border-[#CDEAE2] rounded-xl space-y-2">
              <span className="font-bold text-[#007066] block">
                การเลี้ยงลูกด้วยนมแม่ (Breastfeeding):
              </span>
              <select
                value={bf}
                onChange={(e) => setBf(e.target.value as BreastfeedingType)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#C8E3DC] bg-white text-xs"
              >
                <option value="ex">นมแม่อย่างเดียว (Exclusive Breastfeeding)</option>
                <option value="mix">นมแม่ + นมผง (Mixed Feeding)</option>
                <option value="fo">นมผงอย่างเดียว (Formula Only)</option>
              </select>
            </div>
          )}

          {type === 'child' && (
            <div className="p-3 bg-[#F0FAF7] border border-[#CDEAE2] rounded-xl space-y-2">
              <span className="font-bold text-[#007066] block">
                ข้อมูลสุขภาพเด็กปฐมวัย (Child Health):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-[#415F65] mb-1">
                    อายุเด็ก (เดือน):
                  </label>
                  <input
                    type="number"
                    value={childMonths}
                    onChange={(e) => setChildMonths(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#C8E3DC] bg-white font-mono-code text-xs"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={vaccine}
                      onChange={(e) => setVaccine(e.target.checked)}
                      className="rounded accent-[#00857A]"
                    />
                    <span className="text-[11px] text-[#2F494E]">
                      วัคซีนครบตามเกณฑ์อายุ
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* GPS Coordinates & Map Pin Trigger */}
          <div className="p-3 bg-white border border-[#D5EAE4] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#102A2E] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#00857A]" />
                <span>พิกัดบ้านในชุมชน (GIS Mapping):</span>
              </span>
              <button
                type="button"
                onClick={handlePickMap}
                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#E8F6F2] text-[#007A70] hover:bg-[#00857A] hover:text-white transition-colors flex items-center gap-1"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>แตะเลือกบนแผนที่</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono-code">
              <div>
                <span className="text-[10px] text-[#718D93]">Latitude:</span>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 rounded border border-[#C8E3DC] bg-[#FAFDFD] text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-[#718D93]">Longitude:</span>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 rounded border border-[#C8E3DC] bg-[#FAFDFD] text-xs"
                />
              </div>
            </div>
          </div>

          {/* Clinical Note */}
          <div>
            <label className="font-semibold text-[#102A2E] block mb-1">
              หมายเหตุ / ประวัติสุขภาพเพิ่มเติม
            </label>
            <textarea
              rows={2}
              placeholder="เช่น ประวัติแพ้ยา, ภาวะแทรกซ้อน, การดูแลเป็นพิเศษ..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#C8E3DC] bg-[#FAFDFD]"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#EDF6F3]">
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
              บันทึกเพิ่มเคส
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
