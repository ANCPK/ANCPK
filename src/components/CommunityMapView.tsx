import React, { useState, useRef } from 'react';
import { CaseItem, CaseType, RiskLevel } from '../types';
import {
  geoToSvg,
  svgToGeo,
  TYPE_LABELS,
  RISK_LABELS,
  formatThaiDate,
  getDaysTo,
  MAP_BOUNDS,
} from '../utils/helpers';
import {
  Search,
  Filter,
  MapPin,
  Building2,
  School,
  Crosshair,
  ExternalLink,
  ClipboardPen,
  X,
  Compass,
} from 'lucide-react';

interface CommunityMapViewProps {
  cases: CaseItem[];
  showNames: boolean;
  selectedCaseId?: string | null;
  onSelectCase: (caseId: string) => void;
  onRecordVisit: (caseId: string) => void;
  isPickingLocation?: boolean;
  pickedLocation?: { lat: number; lng: number } | null;
  onLocationPicked?: (lat: number, lng: number) => void;
  onCancelPicking?: () => void;
}

export const CommunityMapView: React.FC<CommunityMapViewProps> = ({
  cases,
  showNames,
  selectedCaseId,
  onSelectCase,
  onRecordVisit,
  isPickingLocation = false,
  pickedLocation = null,
  onLocationPicked,
  onCancelPicking,
}) => {
  const [filterType, setFilterType] = useState<CaseType | 'all'>('all');
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCase, setHoveredCase] = useState<CaseItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const svgRef = useRef<SVGSVGElement>(null);

  const filteredCases = cases.filter((c) => {
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (filterRisk !== 'all' && c.risk !== filterRisk) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = c.id.toLowerCase().includes(q);
      const matchName = showNames && c.name.toLowerCase().includes(q);
      const matchVhv = c.vhv.toLowerCase().includes(q);
      const matchZone = c.zone.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchVhv && !matchZone) return false;
    }
    return true;
  });

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPickingLocation || !onLocationPicked || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * MAP_BOUNDS.width;
    const y = ((e.clientY - rect.top) / rect.height) * MAP_BOUNDS.height;
    const { lat, lng } = svgToGeo(x, y);
    onLocationPicked(lat, lng);
  };

  const getPinColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'high':
        return '#C81E2B';
      case 'mid':
        return '#D97706';
      case 'low':
        return '#17703A';
      default:
        return '#00857A';
    }
  };

  const renderMarkerShape = (c: CaseItem, x: number, y: number, color: string) => {
    const isSelected = selectedCaseId === c.id;
    const r = isSelected ? 10 : 8;

    if (c.type === 'preg') {
      return (
        <circle
          cx={x}
          cy={y}
          r={r}
          fill={color}
          stroke="#FFFFFF"
          strokeWidth="2.5"
          className="transition-transform duration-200"
        />
      );
    }
    if (c.type === 'post') {
      return (
        <rect
          x={x - r + 1}
          y={y - r + 1}
          width={2 * r - 2}
          height={2 * r - 2}
          transform={`rotate(45 ${x} ${y})`}
          fill={color}
          stroke="#FFFFFF"
          strokeWidth="2.5"
          className="transition-transform duration-200"
        />
      );
    }
    // child -> Triangle
    return (
      <polygon
        points={`${x},${y - r - 2} ${x + r + 2},${y + r} ${x - r - 2},${y + r}`}
        fill={color}
        stroke="#FFFFFF"
        strokeWidth="2.5"
        className="transition-transform duration-200"
      />
    );
  };

  return (
    <div className="space-y-4">
      {/* Pick Location Mode Banner */}
      {isPickingLocation && (
        <div className="bg-[#00857A] text-white p-4 rounded-xl flex items-center justify-between shadow-md animate-pulse">
          <div className="flex items-center gap-3">
            <Crosshair className="w-5 h-5 text-[#FFE082]" />
            <div>
              <p className="font-semibold text-sm">
                โหมดปักหมุดตำแหน่งบ้าน: แตะหรือคลิกบนแผนที่ด้านล่างเพื่อเลือกพิกัด
              </p>
              <p className="text-xs text-[#DCF7F1]">
                ตำแหน่งพิกัดจะถูกบันทึกเพื่อใช้ในการลงพื้นที่ของ อสม. และทีมสุขภาพปฐมภูมิ
              </p>
            </div>
          </div>
          {onCancelPicking && (
            <button
              type="button"
              onClick={onCancelPicking}
              className="px-3 py-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
          )}
        </div>
      )}

      {/* Control Strip & Filters */}
      <div className="bg-white p-4 rounded-xl border border-[#D5EAE4] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#7A9398] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหารหัสเคส, ชื่อ, คุ้ม, หรือ อสม. บนแผนที่..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#C8E3DC] bg-[#FAFDFD] focus:outline-hidden focus:ring-1 focus:ring-[#00857A] focus:border-[#00857A]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7A9398] hover:text-[#0F282B]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Filter */}
            <div className="inline-flex rounded-lg border border-[#D5EAE4] p-0.5 bg-[#F4F9F8] text-xs">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-white text-[#0F282B] shadow-xs'
                    : 'text-[#5C757B] hover:text-[#0F282B]'
                }`}
              >
                ทั้งหมด ({cases.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('preg')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterType === 'preg'
                    ? 'bg-white text-[#0F282B] shadow-xs'
                    : 'text-[#5C757B] hover:text-[#0F282B]'
                }`}
              >
                หญิงตั้งครรภ์
              </button>
              <button
                type="button"
                onClick={() => setFilterType('post')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterType === 'post'
                    ? 'bg-white text-[#0F282B] shadow-xs'
                    : 'text-[#5C757B] hover:text-[#0F282B]'
                }`}
              >
                แม่หลังคลอด
              </button>
              <button
                type="button"
                onClick={() => setFilterType('child')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterType === 'child'
                    ? 'bg-white text-[#0F282B] shadow-xs'
                    : 'text-[#5C757B] hover:text-[#0F282B]'
                }`}
              >
                เด็ก 0-5 ปี
              </button>
            </div>

            {/* Risk Filter */}
            <div className="inline-flex rounded-lg border border-[#D5EAE4] p-0.5 bg-[#F4F9F8] text-xs">
              <button
                type="button"
                onClick={() => setFilterRisk('all')}
                className={`px-2 py-1 rounded-md font-medium ${
                  filterRisk === 'all'
                    ? 'bg-white text-[#0F282B] shadow-xs'
                    : 'text-[#5C757B]'
                }`}
              >
                ทุกความเสี่ยง
              </button>
              <button
                type="button"
                onClick={() => setFilterRisk('high')}
                className={`px-2 py-1 rounded-md font-medium ${
                  filterRisk === 'high'
                    ? 'bg-[#FFD6D3] text-[#A81724] font-bold'
                    : 'text-[#A81724]'
                }`}
              >
                เสี่ยงสูง
              </button>
              <button
                type="button"
                onClick={() => setFilterRisk('mid')}
                className={`px-2 py-1 rounded-md font-medium ${
                  filterRisk === 'mid'
                    ? 'bg-[#FFE7A3] text-[#7A4900] font-bold'
                    : 'text-[#8A5200]'
                }`}
              >
                เฝ้าระวัง
              </button>
              <button
                type="button"
                onClick={() => setFilterRisk('low')}
                className={`px-2 py-1 rounded-md font-medium ${
                  filterRisk === 'low'
                    ? 'bg-[#C6F1D2] text-[#146635] font-bold'
                    : 'text-[#17703A]'
                }`}
              >
                ปกติ
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="pt-2 border-t border-[#EDF6F3] flex items-center justify-between flex-wrap gap-2 text-xs text-[#526B70]">
          <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
            <span className="font-semibold text-[#18393F]">สัญลักษณ์:</span>
            <span className="inline-flex items-center gap-1.5">
              <svg width="12" height="12">
                <circle cx="6" cy="6" r="5" fill="#4B6368" />
              </svg>
              <span>หญิงตั้งครรภ์ (วงกลม)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg width="12" height="12">
                <rect
                  x="2"
                  y="2"
                  width="7"
                  height="7"
                  transform="rotate(45 5.5 5.5)"
                  fill="#4B6368"
                />
              </svg>
              <span>แม่หลังคลอด (สี่เหลี่ยมข้าวหลามตัด)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg width="12" height="12">
                <polygon points="6,1 11,11 1,11" fill="#4B6368" />
              </svg>
              <span>เด็ก 0-5 ปี (สามเหลี่ยม)</span>
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C81E2B]" />
              <span className="font-medium text-[#C81E2B]">เสี่ยงสูง</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
              <span className="font-medium text-[#D97706]">เฝ้าระวัง</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#17703A]" />
              <span className="font-medium text-[#17703A]">ปกติ</span>
            </span>
          </div>
        </div>
      </div>

      {/* SVG Map Container */}
      <div className="relative bg-white rounded-xl border border-[#D5EAE4] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${MAP_BOUNDS.width} ${MAP_BOUNDS.height}`}
            onClick={handleMapClick}
            className={`w-full min-w-[700px] h-auto select-none ${
              isPickingLocation ? 'cursor-crosshair' : 'cursor-default'
            }`}
            style={{ backgroundColor: '#EDF8F5' }}
          >
            {/* Map Grid / Subtle background texture */}
            <defs>
              <pattern
                id="mapGrid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#DEEFEA"
                  strokeWidth="0.8"
                />
              </pattern>

              {/* High risk pulsing glow */}
              <filter id="glowHigh" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect
              width={MAP_BOUNDS.width}
              height={MAP_BOUNDS.height}
              fill="url(#mapGrid)"
            />

            {/* Canal / Natural Waterway (คลองโปร่งเกตุ) */}
            <path
              d="M 0 320 C 180 340, 240 280, 420 300 C 580 320, 680 260, 800 280"
              fill="none"
              stroke="#B2E0EB"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <path
              d="M 0 320 C 180 340, 240 280, 420 300 C 580 320, 680 260, 800 280"
              fill="none"
              stroke="#80CCE0"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <text x="320" y="328" fill="#3D8699" fontSize="11" fontStyle="italic">
              คลองโปร่งเกตุ
            </text>

            {/* Main Road Highway (ถนนสายหลัก) */}
            <path
              d="M 0 170 C 220 160, 360 210, 800 150"
              fill="none"
              stroke="#CFE2DC"
              strokeWidth="14"
            />
            <path
              d="M 0 170 C 220 160, 360 210, 800 150"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="10"
            />
            <path
              d="M 0 170 C 220 160, 360 210, 800 150"
              fill="none"
              stroke="#E89B2B"
              strokeWidth="1.5"
              strokeDasharray="8 6"
            />

            {/* Village Sois / Secondary Roads */}
            <path
              d="M 230 0 C 250 140, 220 280, 280 500"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="8"
            />
            <path
              d="M 520 0 C 490 160, 540 320, 500 500"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="8"
            />
            <path
              d="M 380 180 C 400 260, 410 380, 390 500"
              fill="none"
              stroke="#EBF3F0"
              strokeWidth="6"
            />
            <path
              d="M 660 160 C 680 280, 640 400, 670 500"
              fill="none"
              stroke="#EBF3F0"
              strokeWidth="5"
            />

            {/* Zone Boundaries & Shading */}
            <rect
              x="20"
              y="20"
              width="240"
              height="130"
              rx="12"
              fill="#E1F2EC"
              opacity="0.4"
            />
            <text x="35" y="45" fill="#1B554B" fontSize="13" fontWeight="bold">
              คุ้ม 1 (บ้านเหนือ · ม.1)
            </text>
            <text x="35" y="62" fill="#58857D" fontSize="10">
              อสม. สมศรี รับผิดชอบ
            </text>

            <rect
              x="280"
              y="20"
              width="230"
              height="140"
              rx="12"
              fill="#E1F2EC"
              opacity="0.4"
            />
            <text x="295" y="45" fill="#1B554B" fontSize="13" fontWeight="bold">
              คุ้ม 2 (บ้านกลาง · ม.2)
            </text>
            <text x="295" y="62" fill="#58857D" fontSize="10">
              อสม. สุภาพร รับผิดชอบ
            </text>

            <rect
              x="530"
              y="20"
              width="245"
              height="130"
              rx="12"
              fill="#E1F2EC"
              opacity="0.4"
            />
            <text x="545" y="45" fill="#1B554B" fontSize="13" fontWeight="bold">
              คุ้ม 3 (บ้านใต้ · ม.3)
            </text>
            <text x="545" y="62" fill="#58857D" fontSize="10">
              อสม. ประนอม รับผิดชอบ
            </text>

            {/* Village Landmarks */}
            {/* 1. รพ.สต.บ้านโปร่งเกตุ */}
            <g transform="translate(360, 110)">
              <rect
                x="-40"
                y="-25"
                width="80"
                height="50"
                rx="6"
                fill="#00857A"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <path d="M -12 -5 H 12 M 0 -17 V 7" stroke="#FFFFFF" strokeWidth="4" />
              <text
                x="0"
                y="38"
                textAnchor="middle"
                fill="#005C54"
                fontSize="11"
                fontWeight="bold"
              >
                รพ.สต.บ้านโปร่งเกตุ
              </text>
            </g>

            {/* 2. ศูนย์พัฒนาเด็กเล็ก (ศพด.) */}
            <g transform="translate(180, 240)">
              <rect
                x="-30"
                y="-18"
                width="60"
                height="36"
                rx="5"
                fill="#FFB400"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <text
                x="0"
                y="4"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="10"
                fontWeight="bold"
              >
                ศพด.
              </text>
              <text
                x="0"
                y="30"
                textAnchor="middle"
                fill="#8C5C00"
                fontSize="10"
                fontWeight="600"
              >
                ศูนย์พัฒนาเด็กเล็ก
              </text>
            </g>

            {/* 3. วัดโปร่งเกตุ & ศาลาประชาคม */}
            <g transform="translate(620, 230)">
              <rect
                x="-28"
                y="-18"
                width="56"
                height="36"
                rx="5"
                fill="#7E9F97"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <text
                x="0"
                y="4"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="10"
                fontWeight="bold"
              >
                วัด
              </text>
              <text
                x="0"
                y="30"
                textAnchor="middle"
                fill="#395851"
                fontSize="10"
                fontWeight="600"
              >
                ศาลาประชาคม
              </text>
            </g>

            {/* Render Patient Case Pins */}
            {filteredCases.map((c) => {
              const { x, y } = geoToSvg(c.lat, c.lng);
              const color = getPinColor(c.risk);
              const isSelected = selectedCaseId === c.id;
              const isHovered = hoveredCase?.id === c.id;

              return (
                <g
                  key={c.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCase(c.id);
                  }}
                  onMouseEnter={() => setHoveredCase(c)}
                  onMouseLeave={() => setHoveredCase(null)}
                  className="cursor-pointer transition-transform duration-150"
                  tabIndex={0}
                  role="button"
                  aria-label={`${c.id} ${showNames ? c.name : ''} ${RISK_LABELS[c.risk]}`}
                >
                  {/* High risk pulsating ring */}
                  {c.risk === 'high' && (
                    <circle
                      cx={x}
                      cy={y}
                      r="18"
                      fill="#C81E2B"
                      opacity="0.25"
                      className="animate-ping"
                      style={{ animationDuration: '2s' }}
                    />
                  )}

                  {/* Selected Highlight Ring */}
                  {isSelected && (
                    <circle
                      cx={x}
                      cy={y}
                      r="16"
                      fill="none"
                      stroke="#00857A"
                      strokeWidth="3"
                    />
                  )}

                  {/* Pin Shape */}
                  {renderMarkerShape(c, x, y, color)}

                  {/* Case ID Label */}
                  <rect
                    x={x - 22}
                    y={y + 11}
                    width="44"
                    height="16"
                    rx="4"
                    fill="rgba(255, 255, 255, 0.9)"
                    stroke={isSelected ? '#00857A' : '#C4DCD6'}
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={y + 23}
                    textAnchor="middle"
                    fill="#13272B"
                    fontFamily="var(--font-mono)"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {c.id}
                  </text>
                </g>
              );
            })}

            {/* Picked Location Indicator */}
            {pickedLocation && (
              <g>
                {(() => {
                  const { x, y } = geoToSvg(pickedLocation.lat, pickedLocation.lng);
                  return (
                    <>
                      <circle
                        cx={x}
                        cy={y}
                        r="14"
                        fill="none"
                        stroke="#00857A"
                        strokeWidth="3"
                        strokeDasharray="4 3"
                        className="animate-spin"
                        style={{ transformOrigin: `${x}px ${y}px` }}
                      />
                      <circle cx={x} cy={y} r="5" fill="#00857A" />
                      <text
                        x={x}
                        y={y - 12}
                        textAnchor="middle"
                        fill="#00857A"
                        fontSize="11"
                        fontWeight="bold"
                      >
                        ตำแหน่งบ้านใหม่
                      </text>
                    </>
                  );
                })()}
              </g>
            )}

            {/* Compass Rose */}
            <g transform="translate(760, 40)">
              <circle cx="0" cy="0" r="16" fill="white" stroke="#C8E3DC" />
              <path d="M 0 -12 L 4 0 L 0 3 L -4 0 Z" fill="#C81E2B" />
              <path d="M 0 12 L 4 0 L 0 3 L -4 0 Z" fill="#69858A" />
              <text
                x="0"
                y="-14"
                textAnchor="middle"
                fontSize="9"
                fontWeight="bold"
                fill="#C81E2B"
              >
                N
              </text>
            </g>
          </svg>
        </div>

        {/* Floating Tooltip / Popover for Hovered Case */}
        {hoveredCase && (
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs border border-[#C8E3DC] rounded-xl p-3 shadow-lg max-w-xs pointer-events-none z-10 text-xs space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono-code font-bold text-[#007A70]">
                {hoveredCase.id}
              </span>
              <span
                className={`font-semibold px-1.5 py-0.2 rounded text-[10px] ${
                  hoveredCase.risk === 'high'
                    ? 'bg-red-100 text-red-700'
                    : hoveredCase.risk === 'mid'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {RISK_LABELS[hoveredCase.risk]}
              </span>
            </div>
            <p className="font-semibold text-[#0F292E]">
              {showNames ? hoveredCase.name : `เคส ${hoveredCase.id}`}
            </p>
            <p className="text-[#557177]">
              {TYPE_LABELS[hoveredCase.type]} · {hoveredCase.zone}
            </p>
            <div className="text-[11px] text-[#2F494E]">
              นัดถัดไป: {formatThaiDate(hoveredCase.appt)} (
              {getDaysTo(hoveredCase.appt) < 0
                ? `เลยนัด ${Math.abs(getDaysTo(hoveredCase.appt))} วัน`
                : getDaysTo(hoveredCase.appt) === 0
                ? 'วันนี้'
                : `อีก ${getDaysTo(hoveredCase.appt)} วัน`}
              )
            </div>
            <p className="text-[11px] text-[#69858A]">
              ผู้รับผิดชอบ: {hoveredCase.vhv}
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-[#5C757B]">
        * หมายเหตุ: พิกัดแผนที่แสดงผลตามข้อกำหนด PDPA โดยไม่ระบุชื่อเต็มบนป้ายหมุดสาธารณะ
        คลิกที่หมุดใดๆ เพื่อเปิดดูประวัติการตรวจหรือบันทึกการเยี่ยมบ้าน
      </p>
    </div>
  );
};
