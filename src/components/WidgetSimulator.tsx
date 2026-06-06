import React, { useState } from 'react';
import { 
  Sun, 
  RefreshCw, 
  MapPin, 
  Battery, 
  Wifi, 
  Clock as ClockIcon, 
  Compass, 
  Sliders, 
  Sparkles, 
  Smartphone, 
  Wallpaper,
  FileText,
  MessageSquare,
  Music,
  Camera
} from 'lucide-react';
import { WidgetStyle, WidgetSettings, UvData, getUvLevelInfo } from '../types';

interface WidgetSimulatorProps {
  style: WidgetStyle;
  setStyle: (style: WidgetStyle) => void;
  settings: WidgetSettings;
  uvData: UvData;
  onRefreshWidget: () => void;
}

const WALLPAPERS = [
  { id: 'mist', name: '안개 서린 새벽산', bgClass: 'bg-gradient-to-tr from-slate-900 via-indigo-950 to-emerald-950' },
  { id: 'desert', name: '노을 지는 사막', bgClass: 'bg-gradient-to-tr from-rose-900 via-amber-850 to-orange-950' },
  { id: 'nebula', name: '자색 네뷸라', bgClass: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950' },
  { id: 'clean', name: '스카이 블루', bgClass: 'bg-gradient-to-br from-sky-900 via-cyan-950 to-slate-900' },
  { id: 'nordic', name: '북유럽의 밤', bgClass: 'bg-gradient-to-b from-gray-900 via-slate-900 to-zinc-900' }
];

export default function WidgetSimulator({
  style,
  setStyle,
  settings,
  uvData,
  onRefreshWidget
}: WidgetSimulatorProps) {
  const [activeWallpaper, setActiveWallpaper] = useState(WALLPAPERS[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Trigger temporary refresh animation inside the simulator when tapping the widget
  const handleWidgetTap = () => {
    setIsRefreshing(true);
    onRefreshWidget();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const uvInfo = getUvLevelInfo(uvData.uvIndex);

  // Accent color mappings
  const accentColorMap: { [key: string]: { hex: string, bg: string, text: string } } = {
    amber: { hex: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-400' },
    emerald: { hex: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    sky: { hex: '#0ea5e9', bg: 'bg-sky-500/10', text: 'text-sky-400' },
    rose: { hex: '#f43f5e', bg: 'bg-rose-500/10', text: 'text-rose-400' },
    violet: { hex: '#8b5cf6', bg: 'bg-violet-500/10', text: 'text-violet-400' }
  };

  const currentAccent = accentColorMap[style.accentColor] || accentColorMap.amber;

  // Widget themes background options
  const getWidgetThemeClasses = () => {
    const opacityVal = style.opacity / 100;
    switch (style.theme) {
      case 'light':
        return {
          bg: `rgba(255, 255, 255, ${opacityVal})`,
          text: 'text-slate-900',
          desc: 'text-slate-600',
          border: 'border-white/40',
          shadow: 'shadow-md shadow-black/10'
        };
      case 'amoled':
        return {
          bg: `rgba(0, 0, 0, ${opacityVal})`,
          text: 'text-white',
          desc: 'text-slate-400',
          border: 'border-slate-900/60',
          shadow: 'shadow-lg shadow-black/30'
        };
      case 'glass':
        return {
          bg: `rgba(15, 23, 42, ${opacityVal * 0.4})`,
          text: 'text-white',
          desc: 'text-slate-300',
          border: 'border-white/10 backdrop-blur-md',
          shadow: 'shadow-lg shadow-black/20'
        };
      case 'dark':
      default:
        return {
          bg: `rgba(30, 41, 59, ${opacityVal})`,
          text: 'text-slate-100',
          desc: 'text-slate-400',
          border: 'border-slate-700/50',
          shadow: 'shadow-md shadow-black/25'
        };
    }
  };

  const themes = getWidgetThemeClasses();

  return (
    <div className="space-y-6">
      {/* Visual Workspace Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Simulator Area: Left side, taking 7 cols on large screens */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-[340px] md:max-w-[350px] aspect-[9/18.5] rounded-[42px] border-8 border-slate-800 bg-slate-950 p-2.5 shadow-2.5xl relative overflow-hidden flex flex-col justify-between select-none">
            
            {/* Phone Front Camera Hole-punch */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-900 border border-slate-800/50 z-50 flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-blue-900/40" />
            </div>

            {/* Simulated Live Wallpaper Background */}
            <div className={`absolute inset-0 z-0 transition-all duration-700 ${activeWallpaper.bgClass}`} />

            {/* Smart Phone Content Screen Overlay (Safe Zone) */}
            <div className="relative z-10 flex-1 flex flex-col justify-between h-full text-slate-100 font-sans pt-1">
              
              {/* Phone Status bar */}
              <div className="flex items-center justify-between px-3.5 text-[11px] font-medium tracking-tight h-5">
                <div className="flex items-center gap-1">
                  <span className="font-mono">07:22</span>
                  <span className="text-[9px] font-semibold bg-white/15 px-1 py-0.5 rounded-sm scale-90">LTE</span>
                </div>
                <div className="flex items-center gap-1.5 pt-0.5 text-white/90">
                  <Wifi size={11} className="stroke-[2.5]" />
                  <span className="text-[10px] font-semibold font-mono">100%</span>
                  <Battery size={13} className="rotate-90 -mr-1.5" />
                </div>
              </div>

              {/* Widget Home Workspace Area */}
              <div className="flex-1 flex flex-col items-center justify-start pt-10 px-4 space-y-5">
                
                {/* Visual Widget Render Container based on selected settings */}
                <div className="w-full z-20 flex flex-col justify-center items-center">
                  
                  {/* Dynamic Interactive Widget Body */}
                  <div
                    onClick={handleWidgetTap}
                    style={{ backgroundColor: themes.bg }}
                    className={`w-full rounded-2xl p-4 border transition-all duration-300 backdrop-blur-xs cursor-pointer relative overflow-hidden active:scale-[0.98] ${themes.shadow} ${themes.border} group`}
                    title="위젯을 누르면 수동으로 위치기반 자외선지수를 갱신합니다."
                  >
                    
                    {/* Size and layout implementations */}

                    {/* 1. SMALL LAYOUT (2x1) */}
                    {style.size === 'small' && (
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-1">
                          {style.showLocation && (
                            <div className={`text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 ${style.theme === 'light' ? 'text-orange-600' : 'text-orange-400'}`}>
                              <MapPin size={10} />
                              <span className="max-w-[80px] truncate">{uvData.locationName.split(' ')[0]}</span>
                            </div>
                          )}
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-display font-bold leading-none tracking-tight">
                              {uvData.uvIndex}
                            </span>
                            {style.showUvLevelText && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: `${uvInfo.color}15`, color: uvInfo.color }}>
                                {uvInfo.level}
                              </span>
                            )}
                          </div>
                          {style.showLastUpdated && (
                            <span className={`text-[9px] block ${themes.desc} font-mono`}>
                              {settings.refreshFrequency === 'manual' ? '탭하여 갱신' : `${uvData.lastUpdated} 동기`}
                            </span>
                          )}
                        </div>

                        <div className="relative">
                          <div 
                            className="w-11 h-11 rounded-full flex items-center justify-center transition-transform"
                            style={{ 
                              backgroundColor: `${uvInfo.color}20`,
                              animation: isRefreshing ? 'spin 1s ease-in-out infinite' : undefined 
                            }}
                          >
                            <Sun 
                              size={24} 
                              style={{ color: uvInfo.color }}
                              className={isRefreshing ? 'animate-pulse' : 'animate-spin-slow'} 
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. MEDIUM LAYOUT (2x2) */}
                    {style.size === 'medium' && (
                      <div className="flex flex-col justify-between h-28">
                        <div className="flex items-start justify-between w-full">
                          <div className="space-y-0.5">
                            {style.showLocation && (
                              <div className={`text-[10px] font-bold tracking-wider flex items-center gap-1 ${style.theme === 'light' ? 'text-orange-600' : 'text-orange-400'}`}>
                                <MapPin size={8} />
                                <span className="max-w-[70px] truncate">{uvData.locationName}</span>
                              </div>
                            )}
                            <div className={`text-[10px] font-semibold ${themes.desc}`}>자외선 지수</div>
                          </div>

                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ 
                              backgroundColor: `${uvInfo.color}18`,
                              animation: isRefreshing ? 'spin 1s ease' : undefined 
                            }}
                          >
                            <Sun size={18} style={{ color: uvInfo.color }} />
                          </div>
                        </div>

                        <div className="flex items-end justify-between w-full mt-auto">
                          <div className="flex flex-col">
                            <span className="text-4xl font-display font-bold leading-none tracking-tight">
                              {uvData.uvIndex}
                            </span>
                            {style.showUvLevelText && (
                              <span className="text-[10px] font-bold mt-1 inline-block" style={{ color: uvInfo.color }}>
                                {uvInfo.level} 단계
                              </span>
                            )}
                          </div>
                          
                          {style.showLastUpdated && (
                            <div className={`text-[9px] font-mono text-right ${themes.desc}`}>
                              {settings.refreshFrequency === 'manual' ? '터치 시 갱신' : `${uvData.lastUpdated}`}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 3. LARGE LAYOUT (4x2) */}
                    {style.size === 'large' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: style.theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}>
                          <div className="space-y-0.5">
                            {style.showLocation && (
                              <div className={`text-[11px] font-bold tracking-tight flex items-center gap-1 ${style.theme === 'light' ? 'text-orange-600' : 'text-orange-400'}`}>
                                <MapPin size={10} />
                                <span>{uvData.locationName}</span>
                              </div>
                            )}
                            <div className={`text-[9px] font-mono ${themes.desc}`}>
                              오늘 최대 자외선 지수: <span className="font-semibold text-slate-200" style={{ color: uvInfo.color }}>{uvData.dailyMax} Max</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-mono ${themes.desc}`}>
                              {settings.refreshFrequency === 'manual' ? '탭하여 수동 갱신' : `동기화: ${uvData.lastUpdated}`}
                            </span>
                            <RefreshCw size={9} className={`text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-4xl font-display font-bold tracking-tight">
                              {uvData.uvIndex}
                            </span>
                            
                            <div>
                              {style.showUvLevelText && (
                                <div className="text-xs font-bold leading-tight" style={{ color: uvInfo.color }}>
                                  {uvInfo.level} 단계
                                </div>
                              )}
                              <p className={`text-[10px] leading-tight ${themes.desc} line-clamp-2 mt-0.5 max-w-[140px]`}>
                                {uvInfo.actionGuide.substring(0, 36)}...
                              </p>
                            </div>
                          </div>

                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${uvInfo.color}15` }}
                          >
                            <Sun size={22} style={{ color: uvInfo.color }} className="animate-spin-slow" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Manual Refresh Tap Overlay */}
                    <div className="absolute inset-0 bg-white/5 opacity-0 active:opacity-100 transition-opacity flex items-center justify-center rounded-2xl pointer-events-none">
                      <div className="bg-slate-900/80 text-white rounded-full p-1 text-[10px] font-sans scale-90 border border-slate-700 font-semibold px-2 animate-bounce flex items-center gap-1 shadow-md">
                        <RefreshCw size={10} className="animate-spin" />
                        갱신 완료!
                      </div>
                    </div>

                  </div>

                  <span className="text-[10px] text-white/50 bg-black/45 px-2 py-0.5 rounded-full mt-2 inline-flex items-center gap-1 shadow-xs border border-white/5 font-sans">
                    <Sparkles size={9} className="text-orange-400 animate-pulse" />
                    안드로이드 위젯 mock-up (터치 가능)
                  </span>
                </div>

                {/* Simulated Android App Shortcuts */}
                <div className="w-full grid grid-cols-4 gap-3 pt-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 bg-orange-600/40 border border-orange-400/20 rounded-xl flex items-center justify-center shadow-xs">
                      <Compass size={18} className="text-orange-300" />
                    </div>
                    <span className="text-[9px] text-white/70 font-medium">UVCast</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 hover:brightness-110 active:brightness-95 cursor-pointer">
                    <div className="w-10 h-10 bg-emerald-700/40 border border-emerald-400/20 rounded-xl flex items-center justify-center shadow-xs">
                      <MessageSquare size={17} className="text-emerald-300" />
                    </div>
                    <span className="text-[9px] text-white/70 font-medium font-sans">카카오톡</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 hover:brightness-110 active:brightness-95 cursor-pointer">
                    <div className="w-10 h-10 bg-rose-600/40 border border-rose-400/20 rounded-xl flex items-center justify-center shadow-xs">
                      <Music size={17} className="text-rose-300" />
                    </div>
                    <span className="text-[9px] text-white/70 font-medium">뮤직 플레이어</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 hover:brightness-110 active:brightness-95 cursor-pointer">
                    <div className="w-10 h-10 bg-slate-700/40 border border-slate-400/20 rounded-xl flex items-center justify-center shadow-xs">
                      <Camera size={17} className="text-slate-300" />
                    </div>
                    <span className="text-[9px] text-white/70 font-medium">기본 카메라</span>
                  </div>
                </div>

              </div>

              {/* Phone Navigation Bar */}
              <div className="flex items-center justify-around px-12 h-10 text-white/60">
                <div className="w-2.5 h-2.5 border-l-2 border-b-2 border-white/70 rotate-45" />
                <div className="w-3.5 h-3.5 border-2 border-white/70 rounded-full" />
                <div className="w-3 h-3 border-2 border-white/70 rounded-xs" />
              </div>

            </div>
          </div>
        </div>

        {/* Configuration Panel: Right side, taking 5 cols */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-850 backdrop-blur-md space-y-4">
            <h3 className="font-semibold text-zinc-100 text-sm md:text-base flex items-center gap-2">
              <Sliders className="text-orange-400" size={18} />
              위젯 디스플레이 커스텀
            </h3>
            <p className="text-xs text-zinc-400">위젯의 디자인, 테마, 투명도 및 정보 표시 여부를 세부 설정합니다.</p>

            <div className="space-y-4 pt-1">
              
              {/* Size Selectors */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">위젯 사각 형태 (안드로이드 규격)</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['small', 'medium', 'large'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStyle({ ...style, size: s })}
                      className={`text-zinc-300 px-2 py-2 rounded-xl text-xs font-medium border capitalize cursor-pointer transition-colors ${
                        style.size === s
                          ? 'bg-orange-500/10 border-orange-500 text-orange-450'
                          : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-750'
                      }`}
                    >
                      {s === 'small' && '미니형 2x1'}
                      {s === 'medium' && '표준형 2x2'}
                      {s === 'large' && '와이드형 4x2'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">위젯 스킨 테마 색상</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['dark', 'light', 'amoled', 'glass'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setStyle({ ...style, theme: t })}
                      className={`text-zinc-300 px-1.5 py-1.5 rounded-lg text-[11px] font-medium border cursor-pointer transition-colors capitalize ${
                        style.theme === t
                          ? 'bg-orange-500/10 border-orange-500 text-orange-450'
                          : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-750'
                      }`}
                    >
                      {t === 'dark' && '다크 에디션'}
                      {t === 'light' && '라이트 화이트'}
                      {t === 'amoled' && '완전 카본블랙'}
                      {t === 'glass' && '글라스 투과'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opacity Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-zinc-300">위젯 배경 투명도</span>
                  <span className="font-mono text-orange-450 font-bold">{style.opacity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={style.opacity}
                  onChange={(e) => setStyle({ ...style, opacity: Number(e.target.value) })}
                  className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>

              {/* Accent Color selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">위젯 강조 데코 컬러</label>
                <div className="flex items-center gap-3">
                  {Object.keys(accentColorMap).map((colorKey) => {
                    const cl = accentColorMap[colorKey];
                    const isSelected = style.accentColor === colorKey;
                    return (
                      <button
                        key={colorKey}
                        onClick={() => setStyle({ ...style, accentColor: colorKey })}
                        style={{ backgroundColor: cl.hex }}
                        className={`w-6 h-6 rounded-full cursor-pointer transition-all ${
                          isSelected ? 'scale-125 ring-2 ring-zinc-100 ring-offset-2 ring-offset-zinc-950' : 'opacity-70 hover:opacity-100'
                        }`}
                        title={colorKey}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Elements Toggles */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="text-[11px] uppercase font-bold tracking-wider text-zinc-500 block">수치 하단 필드 선택</label>
                
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-zinc-300">관측 위치 정보 (시, 군, 구) 노출</span>
                  <button
                    onClick={() => setStyle({ ...style, showLocation: !style.showLocation })}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold border ${
                      style.showLocation ? 'bg-orange-500/10 border-orange-500/30 text-orange-450' : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                    }`}
                  >
                    {style.showLocation ? '표시함' : '숨김'}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-zinc-300">자외선 레벨 문자열 표시</span>
                  <button
                    onClick={() => setStyle({ ...style, showUvLevelText: !style.showUvLevelText })}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold border ${
                      style.showUvLevelText ? 'bg-orange-500/10 border-orange-500/30 text-orange-450' : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                    }`}
                  >
                    {style.showUvLevelText ? '표시함' : '숨김'}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-zinc-300">동기화 시간 표시</span>
                  <button
                    onClick={() => setStyle({ ...style, showLastUpdated: !style.showLastUpdated })}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold border ${
                      style.showLastUpdated ? 'bg-orange-500/10 border-orange-500/30 text-orange-450' : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                    }`}
                  >
                    {style.showLastUpdated ? '표시함' : '숨김'}
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* Wallpaper Change Box */}
          <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800 space-y-2">
            <h4 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Wallpaper size={14} className="text-orange-400" />
              배경 바탕화면 체험하기
            </h4>
            <div className="grid grid-cols-5 gap-1.5">
              {WALLPAPERS.map((wp) => (
                <button
                  key={wp.id}
                  onClick={() => setActiveWallpaper(wp)}
                  className={`h-7 rounded-md cursor-pointer text-[9px] font-semibold transition-all border overflow-hidden truncate px-1 text-white flex items-center justify-center ${wp.bgClass} ${
                    activeWallpaper.id === wp.id ? 'ring-2 ring-orange-500 scale-102 border-transparent' : 'opacity-80 hover:opacity-100 border-zinc-850'
                  }`}
                  title={wp.name}
                >
                  {wp.name.substring(0, 2)}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
