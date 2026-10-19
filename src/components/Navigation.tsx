import React from 'react';
import { LayoutDashboard, MapPin, Users, Send, BarChart3 } from 'lucide-react';

export type ActiveTab = 'dash' | 'map' | 'list' | 'ref' | 'analytics';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  pendingReferralsCount: number;
  highRiskCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  pendingReferralsCount,
  highRiskCount,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number; alertBadge?: number }[] = [
    {
      id: 'dash',
      label: 'ภาพรวม & ตัวชี้วัด',
      icon: <LayoutDashboard className="w-4 h-4" />,
      alertBadge: highRiskCount > 0 ? highRiskCount : undefined,
    },
    {
      id: 'map',
      label: 'แผนที่ชุมชน & ปักหมุด',
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      id: 'list',
      label: 'ทะเบียนเคส & การติดตาม',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'ref',
      label: 'ระบบส่งต่อเคส (Refer)',
      icon: <Send className="w-4 h-4" />,
      badge: pendingReferralsCount > 0 ? pendingReferralsCount : undefined,
    },
    {
      id: 'analytics',
      label: 'รายงาน & วิเคราะห์กลุ่มวัย',
      icon: <BarChart3 className="w-4 h-4" />,
    },
  ];

  return (
    <div className="border-b border-[#D5EAE4] bg-white/70 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#00857A] text-white shadow-xs'
                    : 'text-[#4A646A] hover:text-[#11292D] hover:bg-[#E8F6F2]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`inline-flex items-center justify-center px-1.5 py-0.2 text-[11px] font-bold rounded-full ${
                      isActive ? 'bg-red-500 text-white' : 'bg-red-600 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {tab.alertBadge !== undefined && !tab.badge && (
                  <span
                    className={`inline-flex items-center justify-center px-1.5 py-0.2 text-[11px] font-bold rounded-full ${
                      isActive ? 'bg-[#FFD23F] text-[#3D2C00]' : 'bg-[#FFEBA6] text-[#694B00]'
                    }`}
                    title={`${tab.alertBadge} เคสเสี่ยงสูง`}
                  >
                    {tab.alertBadge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
