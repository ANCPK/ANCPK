import React, { useState, useEffect } from 'react';
import { CaseItem, KpiMetric } from './types';
import { INITIAL_CASES } from './data/initialData';
import { calculateKpis, exportCasesToCsv } from './utils/helpers';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { CommunityMapView } from './components/CommunityMapView';
import { CaseListView } from './components/CaseListView';
import { ReferralView } from './components/ReferralView';
import { AnalyticsView } from './components/AnalyticsView';
import { CaseDetailDrawer } from './components/CaseDetailDrawer';
import { NewVisitModal } from './components/NewVisitModal';
import { AddCaseModal } from './components/AddCaseModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'anc-mch-v2-storage';

export default function App() {
  const [cases, setCases] = useState<CaseItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load cases from localStorage', e);
    }
    return INITIAL_CASES;
  });

  const [showNames, setShowNames] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dash');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [visitingCaseId, setVisitingCaseId] = useState<string | null>(null);
  const [isAddingCase, setIsAddingCase] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type?: 'ok' | 'alert' } | null>(null);

  // Map location picker state
  const [isPickingLocation, setIsPickingLocation] = useState<boolean>(false);
  const [locationPickTarget, setLocationPickTarget] = useState<'new' | string>('new');
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [caseDraft, setCaseDraft] = useState<Partial<CaseItem> | null>(null);

  // Save to localStorage whenever cases change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [cases]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (text: string, type: 'ok' | 'alert' = 'ok') => {
    setToastMessage({ text, type });
  };

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || null;
  const visitingCase = cases.find((c) => c.id === visitingCaseId) || null;

  const kpis: KpiMetric[] = calculateKpis(cases);

  const pendingReferralsCount = cases.filter(
    (c) => c.refer && c.refer.status === 'รอรับเรื่อง'
  ).length;

  const highRiskCount = cases.filter((c) => c.risk === 'high').length;

  // Handlers
  const handleToggleNames = () => {
    const next = !showNames;
    setShowNames(next);
    showToast(
      next
        ? 'แสดงชื่อเต็มของผู้รับบริการแล้ว'
        : 'เปิดโหมดปกปิดข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)',
      'ok'
    );
  };

  const handleOpenAddModal = () => {
    setIsAddingCase(true);
  };

  const handleResetData = () => {
    setCases(INITIAL_CASES);
    setSelectedCaseId(null);
    setVisitingCaseId(null);
    setIsAddingCase(false);
    setIsPickingLocation(false);
    setPickedLocation(null);
    showToast('คืนค่าข้อมูลตัวอย่าง รพ.สต.บ้านโปร่งเกตุ เรียบร้อยแล้ว', 'ok');
  };

  const handleExportCsv = () => {
    exportCasesToCsv(cases, showNames);
    showToast('ดาวน์โหลดรายงาน CSV เรียบร้อยแล้ว', 'ok');
  };

  const handleSelectCase = (id: string) => {
    setSelectedCaseId(id);
  };

  const handleRecordVisit = (id: string) => {
    setVisitingCaseId(id);
  };

  const handleSaveVisit = (
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
  ) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;

        const newVisit = {
          id: `v-${Date.now()}`,
          d: new Date().toISOString().slice(0, 10),
          by: c.vhv,
          topics: visitData.topics,
          latch: visitData.latch,
          dspm: visitData.dspm,
          text: visitData.text,
          bloodPressure: visitData.bloodPressure,
          weightKg: visitData.weightKg,
          refer: visitData.refer,
        };

        let newRisk = c.risk;
        if (visitData.refer || visitData.dspm === 'สงสัยล่าช้า') {
          newRisk = 'high';
        } else if (
          visitData.latch &&
          visitData.latch.includes('ไม่ดี') &&
          c.risk === 'low'
        ) {
          newRisk = 'mid';
        }

        let newRefer = c.refer;
        if (visitData.refer) {
          newRefer = {
            at: Date.now(),
            status: 'รอรับเรื่อง',
            by: c.vhv,
            reason: visitData.referReason || visitData.text,
            urgency: visitData.urgency || 'routine',
          };
        }

        return {
          ...c,
          risk: newRisk,
          refer: newRefer,
          visits: [...c.visits, newVisit],
        };
      })
    );

    setVisitingCaseId(null);
    showToast(
      visitData.refer
        ? `บันทึกการเยี่ยม ${caseId} และแจ้งส่งต่อ (Refer) ไปยัง รพ.สต. แล้ว`
        : `บันทึกการเยี่ยมบ้านสำหรับเคส ${caseId} เรียบร้อยแล้ว`,
      'ok'
    );
  };

  const handleUpdateAppt = (caseId: string, newDate: string) => {
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, appt: newDate } : c))
    );
    showToast(`อัปเดตวันนัดตรวจของเคส ${caseId} เป็นวันที่ ${newDate} แล้ว`, 'ok');
  };

  const handleAcceptReferral = (caseId: string, staffName = 'เจ้าหน้าที่ รพ.สต.') => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId || !c.refer) return c;
        return {
          ...c,
          refer: {
            ...c.refer,
            status: 'รับเรื่องแล้ว',
            accepted: Date.now(),
          },
        };
      })
    );
    showToast(`รับเรื่องเคสส่งต่อ ${caseId} แล้ว โดย ${staffName}`, 'ok');
  };

  const handleCloseReferral = (caseId: string, outcomeNote?: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId || !c.refer) return c;
        return {
          ...c,
          risk: c.risk === 'high' ? 'mid' : c.risk,
          refer: {
            ...c.refer,
            status: 'ปิดเคสแล้ว',
            closed: Date.now(),
            responseNote: outcomeNote || 'ดูแลรักษาเสร็จสิ้นและส่งกลับ อสม. ดูแลต่อ',
          },
        };
      })
    );
    showToast(`ปิดเคสส่งต่อ ${caseId} เรียบร้อยแล้ว`, 'ok');
  };

  const handleSaveNewCase = (newCase: CaseItem) => {
    setCases((prev) => [newCase, ...prev]);
    setIsAddingCase(false);
    setPickedLocation(null);
    setCaseDraft(null);
    showToast(`เพิ่มเคสใหม่รหัส ${newCase.id} (${newCase.name}) เรียบร้อยแล้ว`, 'ok');
  };

  const handlePickOnMap = (currentDraft: Partial<CaseItem>) => {
    setCaseDraft(currentDraft);
    setIsAddingCase(false);
    setIsPickingLocation(true);
    setLocationPickTarget('new');
    setActiveTab('map');
    showToast('แตะตำแหน่งบ้านบนแผนที่เพื่อระบุพิกัด', 'ok');
  };

  const handlePickNewLocationForCase = (caseId: string) => {
    setSelectedCaseId(null);
    setIsPickingLocation(true);
    setLocationPickTarget(caseId);
    setActiveTab('map');
    showToast(`แตะบนแผนที่เพื่อเปลี่ยนตำแหน่งบ้านของเคส ${caseId}`, 'ok');
  };

  const handleLocationPicked = (lat: number, lng: number) => {
    setPickedLocation({ lat, lng });

    if (locationPickTarget === 'new') {
      setIsPickingLocation(false);
      setIsAddingCase(true);
      showToast(`บันทึกพิกัดใหม่ ${lat.toFixed(4)}, ${lng.toFixed(4)} แล้ว`, 'ok');
    } else {
      // update existing case
      const targetId = locationPickTarget;
      setCases((prev) =>
        prev.map((c) => (c.id === targetId ? { ...c, lat, lng } : c))
      );
      setIsPickingLocation(false);
      setSelectedCaseId(targetId);
      showToast(`อัปเดตพิกัดบ้านของเคส ${targetId} เรียบร้อยแล้ว`, 'ok');
    }
  };

  const handleCancelPicking = () => {
    setIsPickingLocation(false);
    if (locationPickTarget === 'new') {
      setIsAddingCase(true);
    } else {
      setSelectedCaseId(locationPickTarget);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F8F6] text-[#132A2E] flex flex-col font-thai antialiased selection:bg-[#00857A] selection:text-white">
      {/* Header */}
      <Header
        showNames={showNames}
        onToggleNames={handleToggleNames}
        onOpenAddModal={handleOpenAddModal}
        onExportCsv={handleExportCsv}
        onResetData={handleResetData}
      />

      {/* Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingReferralsCount={pendingReferralsCount}
        highRiskCount={highRiskCount}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dash' && (
          <DashboardView
            cases={cases}
            kpis={kpis}
            showNames={showNames}
            onSelectCase={handleSelectCase}
            onRecordVisit={handleRecordVisit}
            onAcceptReferral={handleAcceptReferral}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'map' && (
          <CommunityMapView
            cases={cases}
            showNames={showNames}
            selectedCaseId={selectedCaseId}
            onSelectCase={handleSelectCase}
            onRecordVisit={handleRecordVisit}
            isPickingLocation={isPickingLocation}
            pickedLocation={pickedLocation}
            onLocationPicked={handleLocationPicked}
            onCancelPicking={handleCancelPicking}
          />
        )}

        {activeTab === 'list' && (
          <CaseListView
            cases={cases}
            showNames={showNames}
            onSelectCase={handleSelectCase}
            onRecordVisit={handleRecordVisit}
            onOpenAddModal={handleOpenAddModal}
          />
        )}

        {activeTab === 'ref' && (
          <ReferralView
            cases={cases}
            showNames={showNames}
            onSelectCase={handleSelectCase}
            onAcceptReferral={handleAcceptReferral}
            onCloseReferral={handleCloseReferral}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsView cases={cases} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#D5EAE4] bg-white py-4 text-center text-xs text-[#637E84]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            ระบบติดตามแม่และเด็กออนไลน์ · โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านโปร่งเกตุ
          </span>
          <span className="font-mono-code text-[11px] text-[#7E9C96]">
            ข้อมูลจำลองเพื่อการสาธิต (Demo Sandbox) · รองรับข้อกำหนด PDPA
          </span>
        </div>
      </footer>

      {/* Case Detail Slide-over Drawer */}
      <CaseDetailDrawer
        caseItem={selectedCase}
        showNames={showNames}
        onClose={() => setSelectedCaseId(null)}
        onRecordVisit={handleRecordVisit}
        onUpdateAppt={handleUpdateAppt}
        onPickNewLocation={handlePickNewLocationForCase}
      />

      {/* Record Home Visit Modal */}
      {visitingCase && (
        <NewVisitModal
          caseItem={visitingCase}
          onClose={() => setVisitingCaseId(null)}
          onSaveVisit={handleSaveVisit}
        />
      )}

      {/* Add New Case Modal */}
      {isAddingCase && (
        <AddCaseModal
          cases={cases}
          onClose={() => {
            setIsAddingCase(false);
            setPickedLocation(null);
            setCaseDraft(null);
          }}
          onSaveCase={handleSaveNewCase}
          onPickOnMap={handlePickOnMap}
          initialLocation={pickedLocation}
        />
      )}

      {/* Accessible Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0F292E] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {toastMessage.type === 'alert' ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#3FE0CB] shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
