import React, { useState } from 'react';
import { 
  Bell, 
  MapPin, 
  RefreshCw, 
  Compass, 
  HelpCircle, 
  Smartphone, 
  Sliders, 
  Clock, 
  ChevronRight, 
  AlertTriangle,
  Locate,
  Check
} from 'lucide-react';
import { WidgetSettings, RefreshFrequency } from '../types';

interface WidgetSettingsProps {
  settings: WidgetSettings;
  setSettings: (settings: WidgetSettings) => void;
  onRequestGeolocation: () => void;
  geoStatus: 'idle' | 'loading' | 'success' | 'error';
  coords: { lat: number | null; lon: number | null };
  locationName: string;
  onSendTestNotification: () => void;
}

export default function WidgetSettingsComponent({
  settings,
  setSettings,
  onRequestGeolocation,
  geoStatus,
  coords,
  locationName,
  onSendTestNotification
}: WidgetSettingsProps) {
  const [showFreqHelp, setShowFreqHelp] = useState(false);

  const freqOptions: { value: RefreshFrequency; label: string; desc: string }[] = [
    { 
      value: 'manual', 
      label: '위젯 터치 시 갱신', 
      desc: '배터리와 데이터를 가장 절약하며, 홈 화면의 위젯을 직접 탭했을 때 수동으로 즉시 갱신합니다.' 
    },
    { 
      value: '15m', 
      label: '15분 간격', 
      desc: '자외선 변화량이 급격한 정오 시간대에 최적의 정확도로 백그라운드 갱신합니다.' 
    },
    { 
      value: '30m', 
      label: '30분 간격', 
      desc: '안드로이드 기본 절전 모드와 타협하여 적당한 주기로 백그라운드 갱신합니다.' 
    },
    { 
      value: '1h', 
      label: '1시간 간격', 
      desc: '배터리 소모를 최적화하면서 매 시간 정시 주기적으로 자외선 지수를 가져옵니다.' 
    },
    { 
      value: '3h', 
      label: '3시간 간격', 
      desc: '낮은 전력 모드로 넓은 주기에 따라 위젯 데이터를 무선 동기화합니다.' 
    }
  ];

  const thresholdLabels: { [key: number]: string } = {
    1: '모든 자외선 (1 이상)',
    3: '보통 이상 (3 이상)',
    6: '높음 이상 (6 이상)',
    8: '매우 높음 이상 (8 이상)',
    11: '위험 수준 (11 이상)',
  };

  const handleFreqChange = (freq: RefreshFrequency) => {
    setSettings({ ...settings, refreshFrequency: freq });
  };

  const toggleNotification = () => {
    setSettings({ ...settings, notificationEnabled: !settings.notificationEnabled });
  };

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, notificationThreshold: Number(e.target.value) });
  };

  const handleGpsToggle = () => {
    if (!settings.gpsTracking) {
      onRequestGeolocation();
    }
    setSettings({ ...settings, gpsTracking: !settings.gpsTracking });
  };

  return (
    <div className="space-y-6">
      {/* 1. Location Settings Section */}
      <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500/15 rounded-lg text-orange-400">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-100 text-sm md:text-base">GPS 위치 권한 및 서비스</h3>
              <p className="text-xs text-zinc-400">위젯 및 앱에서 현 위치 기반의 자외선 수치를 가져옵니다.</p>
            </div>
          </div>
          <button
            onClick={handleGpsToggle}
            className={`w-11 h-6 rounded-full transition-colors relative focus:outline-hidden cursor-pointer ${
              settings.gpsTracking ? 'bg-orange-500' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                settings.gpsTracking ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {settings.gpsTracking ? (
          <div className="mt-3 p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 flex items-center gap-1.5 text-xs font-medium">
                <Compass className="animate-pulse text-orange-400" size={14} />
                현 위치 연동 상태
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                geoStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                geoStatus === 'loading' ? 'bg-amber-500/10 text-amber-400 animate-pulse' :
                'bg-rose-500/10 text-rose-400'
              }`}>
                {geoStatus === 'success' && '연동 성공'}
                {geoStatus === 'loading' && '위치 찾는 중...'}
                {geoStatus === 'error' && '위치 검색 실패'}
                {geoStatus === 'idle' && '연동 중...'}
              </span>
            </div>

            <div className="flex items-start md:items-center justify-between gap-2 border-t border-zinc-800/60 pt-2.5">
              <div>
                <div className="font-medium text-zinc-200">
                  {locationName || '위치 정보 받아오는 중...'}
                </div>
                {coords.lat && coords.lon && (
                  <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                    경도: {coords.lat.toFixed(4)}° / 위도: {coords.lon.toFixed(4)}°
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={onRequestGeolocation}
                disabled={geoStatus === 'loading'}
                className="flex items-center gap-1 text-[11px] font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-750 px-2.5 py-1.5 rounded-lg transition-colors border border-zinc-700 disabled:opacity-50 cursor-pointer"
              >
                <Locate size={12} />
                재검색
              </button>
            </div>
            
            {geoStatus === 'error' && (
              <div className="text-xs text-rose-400 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10 mt-1 flex gap-1.5">
                <AlertTriangle className="shrink-0" size={14} />
                <span>브라우저의 GPS 위치 수신 권한을 확인해주세요. 기본값(서울)으로 표시됩니다.</span>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-2 text-xs text-zinc-400 italic">
            * GPS 기능을 끄면 수동으로 지정한 기상 측정망 기준(서울) 자외선 지수가 위젯에 노출됩니다.
          </div>
        )}
      </div>

      {/* 2. Refresh Frequency settings */}
      <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800 backdrop-blur-md space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500/15 rounded-lg text-orange-400">
              <RefreshCw size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-100 text-sm md:text-base">자외선지수 리프레시 빈도</h3>
              <p className="text-xs text-zinc-400">안드로이드 위젯의 전력 및 데이터 동기 주기를 조절합니다.</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setShowFreqHelp(!showFreqHelp)}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
          >
            <HelpCircle size={16} />
          </button>
        </div>

        {showFreqHelp && (
          <div className="p-3.5 bg-zinc-950/60 text-zinc-300 rounded-xl border border-zinc-800 text-xs leading-relaxed space-y-1.5">
            <p className="font-semibold text-orange-400 flex items-center gap-1">
              <span>💡 위젯 탭 수동 갱신 기능 탑재</span>
            </p>
            <p>
              안드로이드 환경은 주기적인 동기화가 배터리에 지대한 영향을 미칩니다.
              <strong> ‘위젯 터치 시 갱신’</strong> 모드로 두시면 스마트폰의 백그라운드 리소스를 일절 소모하지 않으며, 홈화면의 자외선 위젯을 터치할 때마다 즉각적으로 위치 정보를 확인하여 최신 UV Index를 보여줍니다.
            </p>
          </div>
        )}

        <div className="space-y-2 mt-2">
          {freqOptions.map((opt) => {
            const isSelected = settings.refreshFrequency === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleFreqChange(opt.value)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                  isSelected 
                    ? 'bg-orange-500/10 border-orange-500/40 text-orange-100 shadow-md shadow-orange-950/30' 
                    : 'bg-zinc-950/30 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-950/60 text-zinc-300'
                }`}
              >
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${isSelected ? 'text-orange-400' : 'text-zinc-200'}`}>
                      {opt.label}
                    </span>
                    {opt.value === 'manual' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-sm font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        배터리 절약 추천
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 leading-normal">{opt.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? 'border-orange-400 bg-orange-400 text-zinc-950' : 'border-zinc-700 bg-zinc-950/50'
                }`}>
                  {isSelected && <Check size={12} className="stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Notification Settings Section */}
      <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500/15 rounded-lg text-orange-400">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-100 text-sm md:text-base">태양 자외선 알림 수신</h3>
              <p className="text-xs text-zinc-400">지역 자외선 강도가 안전 기준을 초과하면 일일 스마트 경보를 발송합니다.</p>
            </div>
          </div>
          <button
            onClick={toggleNotification}
            className={`w-11 h-6 rounded-full transition-colors relative focus:outline-hidden cursor-pointer ${
              settings.notificationEnabled ? 'bg-orange-500' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                settings.notificationEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {settings.notificationEnabled && (
          <div className="space-y-4 mt-3 p-4 bg-zinc-950/40 rounded-xl border border-zinc-800 animate-fadeIn font-sans">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-semibold">경보 알림 기준 자외선 수치</span>
                <span className="text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded-md font-mono">
                  UV {settings.notificationThreshold} ({getThresholdName(settings.notificationThreshold)})
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-xs text-zinc-500 font-medium">기본</span>
                <input
                  type="range"
                  min="1"
                  max="11"
                  step="2" // Steps through 1, 3, 5, 7, 9, 11 (approx custom indexes)
                  value={settings.notificationThreshold}
                  onChange={handleThresholdChange}
                  className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <span className="text-xs text-zinc-500 font-medium">위험</span>
              </div>
              <div className="grid grid-cols-5 text-[10px] text-zinc-500 font-mono text-center pt-1 px-1">
                <span onClick={() => setSettings({...settings, notificationThreshold: 1})} className="cursor-pointer hover:text-zinc-350">1</span>
                <span onClick={() => setSettings({...settings, notificationThreshold: 3})} className="cursor-pointer hover:text-zinc-350">3</span>
                <span onClick={() => setSettings({...settings, notificationThreshold: 6})} className="cursor-pointer hover:text-zinc-350">6</span>
                <span onClick={() => setSettings({...settings, notificationThreshold: 8})} className="cursor-pointer hover:text-zinc-350">8</span>
                <span onClick={() => setSettings({...settings, notificationThreshold: 11})} className="cursor-pointer hover:text-zinc-350">11</span>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <span className="text-xs text-zinc-400 leading-normal">
                설정한 자외선 지수 {settings.notificationThreshold} 이상 도달 시 스마트폰 푸시알림이 울리는 모습을 지금 가상으로 시뮬레이션 버튼으로 확인하실 수 있습니다.
              </span>
              
              <button
                type="button"
                onClick={onSendTestNotification}
                className="shrink-0 bg-orange-500/10 hover:bg-orange-500/20 active:bg-orange-500/30 text-orange-400 border border-orange-500/30 hover:border-orange-500/40 text-xs px-3.5 py-2 rounded-xl font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Bell className="animate-bounce" size={13} />
                푸시알림 테스트
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Utility descriptor to help translate criteria
function getThresholdName(val: number): string {
  if (val <= 2) return '낮음 수준 경고';
  if (val <= 5) return '보통 수준 경고';
  if (val <= 7) return '높음 수준 주의보';
  if (val <= 10) return '매우 높음 경보';
  return '태양 자외선 위험 대피보';
}
