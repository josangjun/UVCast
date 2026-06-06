import React from 'react';
import { 
  Sun, 
  MapPin, 
  AlertCircle, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowUpRight, 
  TrendingUp, 
  Compass,
  Info
} from 'lucide-react';
import { UvData, getUvLevelInfo } from '../types';

interface UvForecastProps {
  uvData: UvData;
  onCitySelect: (city: string, lat: number, lon: number) => void;
}

const SOUTH_KOREA_CITIES = [
  { name: '서울', lat: 37.5665, lon: 126.9780 },
  { name: '부산', lat: 35.1796, lon: 129.0756 },
  { name: '인천', lat: 37.4563, lon: 126.7052 },
  { name: '대구', lat: 35.8714, lon: 128.6014 },
  { name: '광주', lat: 35.1595, lon: 126.8526 },
  { name: '대전', lat: 36.3504, lon: 127.3845 },
  { name: '울산', lat: 35.5384, lon: 129.3114 },
  { name: '제주', lat: 33.4996, lon: 126.5312 },
  { name: '강릉', lat: 37.7519, lon: 128.8761 }
];

export default function UvForecast({ uvData, onCitySelect }: UvForecastProps) {
  const uvInfo = getUvLevelInfo(uvData.uvIndex);

  // Filter hourly to active sun hours (e.g., 07:00 to 18:00) for a cleaner graph
  const forecastList = uvData.hourlyForecast;

  // Find max UV for forecast
  const maxUvInForecast = forecastList.reduce((max, item) => item.uv > max ? item.uv : max, 0);

  // Generate SVG coordinates for UV Index Curve Graph
  const graphWidth = 500;
  const graphHeight = 120;
  const paddingX = 40;
  const paddingY = 20;

  const pointsCount = forecastList.length;
  const stepX = (graphWidth - paddingX * 2) / (pointsCount - 1 || 1);
  const maxValForScale = Math.max(12, maxUvInForecast + 2); // default scale up to 12

  const pointsString = forecastList.map((item, index) => {
    const x = paddingX + index * stepX;
    // higher UV means lower Y in SVG coordinate
    const y = graphHeight - paddingY - (item.uv / maxValForScale) * (graphHeight - paddingY * 2);
    return `${x},${y}`;
  }).join(' ');

  // Gradient area SVG points
  const gradientAreaPoints = forecastList.length > 0 
    ? `${paddingX},${graphHeight - paddingY} ${pointsString} ${paddingX + (pointsCount - 1) * stepX},${graphHeight - paddingY}`
    : '';

  return (
    <div className="space-y-6">
      {/* 1. Daily Overview Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Main large UV Metric display, takes 5 cols */}
        <div className="md:col-span-5 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800 backdrop-blur-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-orange-500/10 to-transparent rounded-full -mr-8 -mt-8 pointer-events-none" />
          
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400 font-mono flex items-center gap-1">
              <Compass size={12} className="animate-spin-slow" />
              자외선 관측지점
            </span>
            <h3 className="font-semibold text-zinc-100 flex items-center gap-1.5 text-base">
              <MapPin size={16} className="text-orange-500" />
              {uvData.locationName}
            </h3>
            <span className="text-[11px] text-zinc-400 block font-mono">
              동기화 일시: {uvData.lastUpdated}
            </span>
          </div>

          <div className="py-6 flex items-center gap-6 justify-center md:justify-start">
            <div className="text-center md:text-left">
              <div className="flex items-baseline justify-center md:justify-start gap-1">
                <span className="text-6xl font-display font-bold leading-none tracking-tight text-white">
                  {uvData.uvIndex}
                </span>
                <span className="text-xs text-zinc-500 font-medium font-sans">UVI</span>
              </div>
              <div className="flex justify-center md:justify-start mt-2">
                <span 
                  className="text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5"
                  style={{ 
                    color: uvInfo.color, 
                    backgroundColor: `${uvInfo.color}15`, 
                    borderColor: `${uvInfo.color}35` 
                  }}
                >
                  <Sun size={13} className="fill-current animate-spin-slow" />
                  {uvInfo.level} 단계
                </span>
              </div>
            </div>
            
            <div className="shrink-0">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center border-3 relative"
                style={{ 
                  borderColor: `${uvInfo.color}25`,
                  borderTopColor: uvInfo.color,
                }}
              >
                <div className="absolute inset-2 rounded-full flex flex-col items-center justify-center opacity-90" style={{ backgroundColor: `${uvInfo.color}10` }}>
                  <span className="text-xs font-bold text-zinc-300">최고수치</span>
                  <span className="text-lg font-display font-bold text-white font-mono">{uvData.dailyMax}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800/80 pt-3 text-xs text-zinc-300 leading-relaxed font-sans">
            <span className="font-semibold text-orange-400">행동 요령:</span> {uvInfo.actionGuide}
          </div>
        </div>

        {/* Action recommendations checklist, takes 7 cols */}
        <div className="md:col-span-7 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h4 className="font-semibold text-zinc-100 text-sm mb-3.5 flex items-center gap-2">
              <ShieldAlert className="text-orange-400" size={17} />
              자외선 지수별 보호 장비 체크리스트
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CheckItem 
                checked={uvData.uvIndex >= 1} 
                title="선크림 자외선 제어" 
                desc="SPF 15~30+ 정량 도포" 
                requiredLevel="UV 1+"
              />
              <CheckItem 
                checked={uvData.uvIndex >= 3} 
                title="외출용 선글라스 착용" 
                desc="UV 400 차단 정품 렌즈 권장" 
                requiredLevel="UV 3+"
              />
              <CheckItem 
                checked={uvData.uvIndex >= 6} 
                title="챙이 넓은 모자 및 양산" 
                desc="안면지대 일사 차단" 
                requiredLevel="UV 6+"
              />
              <CheckItem 
                checked={uvData.uvIndex >= 8} 
                title="햇볕 직접 노출 자제" 
                desc="가급적 실내 혹은 그늘망 대피" 
                requiredLevel="UV 8+"
              />
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-zinc-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <span className="text-zinc-400 text-center sm:text-left leading-normal">
              자외선 차단 능력은 구름 유무, 오존 농도 등에 따라 상시 변조될 수 있습니다.
            </span>
            <a 
              href="https://open-meteo.com/" 
              target="_blank" 
              referrerPolicy="no-referrer"
              className="text-zinc-500 hover:text-zinc-350 transition-colors shrink-0 flex items-center gap-1.5 font-mono text-[10px]"
            >
              API Data by Open-Meteo
              <ArrowUpRight size={10} />
            </a>
          </div>
        </div>

      </div>

      {/* 2. Interactive Hourly Forecast Curve Section */}
      <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500/15 rounded-lg text-orange-400">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-100 text-sm md:text-base">오늘의 24시간 자외선 변동 그래프</h3>
              <p className="text-xs text-zinc-400 font-sans">시간 경과에 따른 기상 측정 예측치입니다.</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs bg-zinc-950 px-2 py-1 rounded-md text-zinc-400 font-mono">
              최고 도달 시간: <span className="text-orange-400 font-bold">오후 12:00</span>
            </span>
          </div>
        </div>

        {/* Dynamic SVG Chart Canvas (Adaptive and safe for responsive iframe usage) */}
        {forecastList.length > 0 ? (
          <div className="w-full overflow-x-auto pt-2 scrollbar-none">
            <div className="relative min-w-[500px] w-full" style={{ height: `${graphHeight}px` }}>
              <svg 
                viewBox={`0 0 ${graphWidth} ${graphHeight}`} 
                className="w-full h-full overflow-visible"
              >
                <defs>
                  {/* Linear gradient for filling under active UV index curve */}
                  <linearGradient id="uvAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                  {/* Glowing stroke shadow */}
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Horizontal reference indicator lines */}
                {[0, 3, 6, 9].map((lineUv) => {
                  const lineY = graphHeight - paddingY - (lineUv / maxValForScale) * (graphHeight - paddingY * 2);
                  return (
                    <g key={lineUv} className="opacity-15">
                      <line 
                        x1={paddingX} 
                        y1={lineY} 
                        x2={graphWidth - paddingX} 
                        y2={lineY} 
                        className="stroke-dashed stroke-zinc-500 stroke-1"
                      />
                      <text 
                        x={paddingX - 10} 
                        y={lineY + 3} 
                        className="text-[9px] fill-zinc-400 text-right font-mono"
                        textAnchor="end"
                      >
                        {lineUv}
                      </text>
                    </g>
                  );
                })}

                {/* Area Gradient under curve */}
                {gradientAreaPoints && (
                  <polygon 
                    points={gradientAreaPoints} 
                    fill="url(#uvAreaGrad)" 
                    className="transition-all duration-500"
                  />
                )}

                {/* The Main Spline curve line */}
                {pointsString && (
                  <polyline 
                    fill="none" 
                    stroke="url(#uvCurveColor)" 
                    className="stroke-[2.5]" 
                    points={pointsString}
                    style={{ stroke: '#f97316' }}
                  />
                )}

                {/* Value labels & circle markers above the curve */}
                {forecastList.map((item, index) => {
                  const x = paddingX + index * stepX;
                  const y = graphHeight - paddingY - (item.uv / maxValForScale) * (graphHeight - paddingY * 2);
                  const isPeak = item.uv === maxUvInForecast && maxUvInForecast > 0;
                  
                  return (
                    <g key={item.time} className="group/node">
                      {/* Interactive hover indicator */}
                      <circle 
                        cx={x} 
                        cy={y} 
                        r={isPeak ? 5 : 4} 
                        className="transition-all fill-zinc-900 border"
                        style={{ 
                          stroke: isPeak ? '#f97316' : '#ea580c',
                          strokeWidth: 2
                        }}
                      />
                      {/* Number badge above the marker dot */}
                      <text 
                        x={x} 
                        y={y - 8} 
                        className={`text-[9px] font-mono text-center font-bold fill-zinc-200 group-hover/node:fill-white`}
                        textAnchor="middle"
                      >
                        {item.uv}
                      </text>
                      {/* Time label underneath */}
                      <text 
                        x={x} 
                        y={graphHeight - 4} 
                        className={`text-[9px] font-mono fill-zinc-500`}
                        textAnchor="middle"
                      >
                        {item.time}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-zinc-950/30 rounded-xl text-center text-xs text-zinc-400 italic">
            시간대별 예측 그래프 데이터가 없습니다.
          </div>
        )}
      </div>

      {/* 3. Predefined South Korea Region Quick Check */}
      <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800 backdrop-blur-md space-y-4">
        <div>
          <h4 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
            <Info className="text-orange-400" size={17} />
            전국 주요 도시 자외선 실시간 점검 (가상 지역 변경)
          </h4>
          <p className="text-xs text-zinc-400 mt-0.5">원수 수동 테스트 시 원하는 지역을 탭하면 실제 해당 지역 위도/경도로 기상 관측망 조회를 수행합니다.</p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
          {SOUTH_KOREA_CITIES.map((city) => {
            const isSelected = uvData.locationName.includes(city.name);
            return (
              <button
                key={city.name}
                type="button"
                onClick={() => onCitySelect(city.name, city.lat, city.lon)}
                className={`px-2 py-2 rounded-xl text-xs font-semibold text-center border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-orange-500/15 border-orange-500/45 text-orange-350' 
                    : 'bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-950/80 text-zinc-300'
                }`}
              >
                {city.name}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// Checkbox item row descriptor helper
interface CheckItemProps {
  checked: boolean;
  title: string;
  desc: string;
  requiredLevel: string;
}

function CheckItem({ checked, title, desc, requiredLevel }: CheckItemProps) {
  return (
    <div className={`p-3 rounded-xl border flex items-start gap-2.5 transition-all duration-300 ${
      checked 
        ? 'bg-zinc-950/60 border-orange-500/20 text-zinc-100' 
        : 'bg-zinc-950/20 border-zinc-850 text-zinc-550'
    }`}>
      <div className={`mt-0.5 p-1 rounded-md shrink-0 border ${
        checked 
          ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' 
          : 'bg-zinc-900 border-zinc-800 text-zinc-650'
      }`}>
        <CheckCircle2 size={13} className={checked ? 'stroke-[3]' : ''} />
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-semibold ${checked ? 'text-zinc-100' : 'text-zinc-550'}`}>{title}</span>
          <span className={`text-[8px] font-bold px-1 py-0.25 rounded-xs tracking-wide ${
            checked ? 'bg-orange-500/15 text-orange-400' : 'bg-zinc-900 text-zinc-650'
          }`}>
            {requiredLevel}
          </span>
        </div>
        <p className="text-[10px] text-zinc-400 mt-0.5 leading-normal">{desc}</p>
      </div>
    </div>
  );
}
