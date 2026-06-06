import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Settings, 
  Sliders, 
  HelpCircle, 
  Compass, 
  MapPin, 
  Bell, 
  ShieldAlert, 
  Info, 
  Cpu, 
  RefreshCw, 
  Sparkles,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Locate,
  Volume2
} from 'lucide-react';
import { WidgetStyle, WidgetSettings, UvData, getUvLevelInfo, RefreshFrequency } from './types';
import WidgetSimulator from './components/WidgetSimulator';
import WidgetSettingsComponent from './components/WidgetSettings';
import UvForecast from './components/UvForecast';
import WidgetSetupGuide from './components/WidgetSetupGuide';

// Initial default widgets state
const DEFAULT_STYLE: WidgetStyle = {
  theme: 'glass',
  size: 'medium',
  opacity: 80,
  showLocation: true,
  showLastUpdated: true,
  showUvLevelText: true,
  accentColor: 'amber'
};

const DEFAULT_SETTINGS: WidgetSettings = {
  refreshFrequency: 'manual', // Default: manually update on tap as request!
  notificationEnabled: true,
  notificationThreshold: 6,
  alertOzoneIndex: false,
  gpsTracking: true
};

const DEFAULT_UV: UvData = {
  uvIndex: 4,
  locationName: '서울특별시 종로구 (기본 위치)',
  latitude: 37.5665,
  longitude: 126.9780,
  lastUpdated: '12:00',
  hourlyForecast: [
    { time: '08:00', uv: 1 },
    { time: '10:00', uv: 3 },
    { time: '12:00', uv: 5 },
    { time: '14:00', uv: 4 },
    { time: '16:00', uv: 3 },
    { time: '18:00', uv: 1 },
    { time: '20:00', uv: 0 }
  ],
  dailyMax: 5,
  status: 'idle',
  errorMessage: null
};

export default function App() {
  const [appTheme, setAppTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<'simulator' | 'settings' | 'forecast' | 'guide'>('simulator');
  
  const [widgetStyle, setWidgetStyle] = useState<WidgetStyle>(() => {
    const saved = localStorage.getItem('uv_widget_style');
    return saved ? JSON.parse(saved) : DEFAULT_STYLE;
  });

  const [widgetSettings, setWidgetSettings] = useState<WidgetSettings>(() => {
    const saved = localStorage.getItem('uv_widget_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [uvData, setUvData] = useState<UvData>(() => {
    const saved = localStorage.getItem('uv_index_data');
    return saved ? JSON.parse(saved) : DEFAULT_UV;
  });

  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [activeNotification, setActiveNotification] = useState<{
    show: boolean;
    title: string;
    body: string;
    uv: number;
  } | null>(null);

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem('uv_widget_style', JSON.stringify(widgetStyle));
  }, [widgetStyle]);

  useEffect(() => {
    localStorage.setItem('uv_widget_settings', JSON.stringify(widgetSettings));
  }, [widgetSettings]);

  useEffect(() => {
    localStorage.setItem('uv_index_data', JSON.stringify(uvData));
  }, [uvData]);

  // Synthesize a beautiful Android OS notification sound using Web Audio API
  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // First tone (high pitch spike)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.setValueAtTime(680, ctx.currentTime);
      gain1.gain.setValueAtTime(0.15, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      
      osc1.start();
      osc1.stop(ctx.currentTime + 0.12);

      // Second tone (slightly higher and cheerful pitch)
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, ctx.currentTime);
        gain2.gain.setValueAtTime(0.15, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.18);
      }, 80);
    } catch (e) {
      console.warn("Web Audio Not fully authorized or initialized by user yet.", e);
    }
  };

  // Trigger simulated push notification banner
  const triggerNotificationAlert = (customUv?: number) => {
    const alertUv = customUv !== undefined ? customUv : uvData.uvIndex;
    let title = '☀️ 자외선 주의보 발령';
    let body = `현재 자외선 지수가 주의 레벨(${alertUv})까지 도달했습니다. 선크림을 주기적으로 도포하시고 가급적 직사광선을 피해야 합니다.`;
    
    if (alertUv < 3) {
      title = '🟢 자외선 지수 낮음';
      body = `현재 자외선 우려가 매우 낮은 단계(${alertUv})입니다. 일조 차단 장비 없이 안전한 정오 산책을 즐기셔도 좋습니다.`;
    } else if (alertUv < 6) {
      title = '🟡 자외선 지수 보통 단계';
      body = `자외선 강도가 평범한 야외 관측 수준(${alertUv})입니다. 피부가 예민하다면 선크림을 준비하세요.`;
    } else if (alertUv < 8) {
      title = '🟠 자외선 차단 대책 수립 요구';
      body = `자외선 강도가 제법 높은 수치(${alertUv})입니다. 선글라스와 양산을 사용하시고 장시간 옥외 대기를 금합니다.`;
    } else if (alertUv >= 11) {
      title = '🚨 [경보] 자외선 지수 치명적 위험';
      body = `자외선 지수가 한계치 극상인 ${alertUv} 단계를 가리키고 있습니다. 외출을 전면 제어하고 그늘 건물 내에 체류하십시오.`;
    }

    setActiveNotification({
      show: true,
      title,
      body,
      uv: alertUv
    });
    playNotificationSound();

    // Auto dismiss after 7.5 seconds
    setTimeout(() => {
      setActiveNotification(prev => prev ? { ...prev, show: false } : null);
    }, 7500);
  };

  // Fetch coordinates using Geolocation and retrieve real UV Index from free Open-Meteo
  const handleFetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      setUvData(prev => ({
        ...prev,
        errorMessage: '생체 브라우저에서 위치 서비스를 지원하지 않습니다.'
      }));
      return;
    }

    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // 1. Try to fetch Korean City local name from OpenStreetMap free nominatim reverse geocoding API
          let resolvedCityName = `${latitude.toFixed(2)}N, ${longitude.toFixed(2)}E`;
          try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`, {
              headers: { 'Accept-Language': 'ko-KR,ko;q=0.9' }
            });
            const geoData = await geoRes.json();
            if (geoData && geoData.address) {
              const address = geoData.address;
              resolvedCityName = address.city || address.province || address.county || address.borough || address.suburb || '측정 가능 지역';
              if (address.borough) {
                resolvedCityName = `${resolvedCityName} ${address.borough}`;
              }
            }
          } catch (osmError) {
            console.warn("Nominatim Geocoding rate-limited or offline, using coordinate format", osmError);
          }

          // 2. Fetch UV Index forecast using free Open-Meteo solar forecast
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=uv_index&daily=uv_index_max&timezone=auto`
          );
          const weatherData = await weatherRes.json();

          if (weatherData && weatherData.hourly && weatherData.daily) {
            // Find current hour UV index (or nearest to local hour)
            const currentHour = new Date().getHours();
            const hourlyUv = weatherData.hourly.uv_index;
            const currentUv = hourlyUv[currentHour] !== undefined ? Math.round(hourlyUv[currentHour]) : Math.round(weatherData.daily.uv_index_max[0] * 0.7);
            
            // Format 7-point hourly preview (08:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00)
            const hourlyTimes = weatherData.hourly.time;
            const customHourlyList = [8, 10, 12, 14, 16, 18, 20].map(h => {
              // Find index matching hour
              const idx = h; // since index 0-23 represents hours for today in Open-Meteo standard output
              return {
                time: `${String(h).padStart(2, '0')}:00`,
                uv: Math.round(hourlyUv[idx] || 0)
              };
            });

            const updatedUvData: UvData = {
              uvIndex: currentUv,
              locationName: resolvedCityName,
              latitude,
              longitude,
              lastUpdated: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
              hourlyForecast: customHourlyList,
              dailyMax: Math.round(weatherData.daily.uv_index_max[0] || currentUv),
              status: 'success',
              errorMessage: null
            };

            setUvData(updatedUvData);
            setGeoStatus('success');

            // Trigger notification alert if UV Index exceeds the notification settings criteria
            if (widgetSettings.notificationEnabled && currentUv >= widgetSettings.notificationThreshold) {
              triggerNotificationAlert(currentUv);
            }
          } else {
            throw new Error("Invalid response format from server");
          }
        } catch (apiError) {
          console.error("Failed to query weather APIs:", apiError);
          setGeoStatus('error');
          setUvData(prev => ({
            ...prev,
            status: 'error',
            errorMessage: '기상 서버와의 통신에 장애가 발생해 기본값으로 복구합니다.'
          }));
        }
      },
      (error) => {
        console.warn("Geolocation coordinate acquisition failed or rejected:", error);
        setGeoStatus('error');
      },
      { timeout: 7000 }
    );
  };

  // Perform quick city manual override setup
  const handleCitySelect = async (cityName: string, lat: number, lon: number) => {
    setGeoStatus('loading');
    try {
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=uv_index&daily=uv_index_max&timezone=auto`
      );
      const weatherData = await weatherRes.json();

      if (weatherData && weatherData.hourly && weatherData.daily) {
        const hourlyUv = weatherData.hourly.uv_index;
        const currentHour = new Date().getHours();
        const currentUv = hourlyUv[currentHour] !== undefined ? Math.round(hourlyUv[currentHour]) : 5;

        // format list
        const customHourlyList = [8, 10, 12, 14, 16, 18, 20].map(h => {
          return {
            time: `${String(h).padStart(2, '0')}:00`,
            uv: Math.round(hourlyUv[h] || 0)
          };
        });

        const updatedUvData: UvData = {
          uvIndex: currentUv,
          locationName: `${cityName}`,
          latitude: lat,
          longitude: lon,
          lastUpdated: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
          hourlyForecast: customHourlyList,
          dailyMax: Math.round(weatherData.daily.uv_index_max[0] || currentUv),
          status: 'success',
          errorMessage: null
        };

        setUvData(updatedUvData);
        setGeoStatus('success');

        if (widgetSettings.notificationEnabled && currentUv >= widgetSettings.notificationThreshold) {
          triggerNotificationAlert(currentUv);
        }
      }
    } catch (e) {
      console.error(e);
      setGeoStatus('error');
    }
  };

  // Start initialization of coordinates
  useEffect(() => {
    // Lazy auto-load on start if tracking enabled
    if (widgetSettings.gpsTracking && uvData.latitude === DEFAULT_UV.latitude) {
      handleFetchCurrentLocation();
    }
  }, []);

  return (
    <div className={`min-h-screen font-sans ${
      appTheme === 'dark' ? 'bg-[#09090b] text-zinc-100' : 'bg-[#f4f4f5] text-zinc-900'
    } transition-colors duration-350 relative pb-16`}>
      
      {/* 1. TOP FLOATING NOTIFICATION EMULATION (Android Inspired Push Alert) */}
      {activeNotification && activeNotification.show && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] bg-zinc-900/95 border-b-4 border border-orange-500 rounded-2xl shadow-xl p-4 z-50 animate-slideDown backdrop-blur-lg text-zinc-150">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-orange-500/15 rounded-xl text-orange-400 shrink-0 animate-pulse">
              <Sun size={20} className="fill-orange-500" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400 font-mono">UVCast 알림 경보</span>
                <span className="text-[10px] text-zinc-500">지금 바로</span>
              </div>
              <h4 className="text-xs font-bold font-sans text-zinc-100">{activeNotification.title}</h4>
              <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">{activeNotification.body}</p>
              
              <div className="pt-2 flex items-center justify-between text-[10px] text-orange-500 font-semibold">
                <span>안드로이드 위젯 탭 수동 갱신 기능 탑재</span>
                <span>모바일 푸시알람</span>
              </div>
            </div>
            <button 
              onClick={() => setActiveNotification(prev => prev ? { ...prev, show: false } : null)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0 text-xs font-bold"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN NAVIGATION HEADER */}
      <header className={`border-b ${appTheme === 'dark' ? 'border-zinc-800 bg-zinc-900/80' : 'border-zinc-200 bg-white/95'} sticky top-0 z-30 transition-colors backdrop-blur-md`}>
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-accent rounded-xl text-white shadow-md shadow-orange-500/20 bg-orange-500">
              <Sun size={22} className="animate-spin-slow fill-yellow-250 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-display font-bold text-base md:text-lg tracking-tight">UVCast</h1>
                <span className="text-[9px] font-bold px-1.5 py-0.25 rounded-md bg-orange-500 text-white leading-none">Android Widget</span>
              </div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono font-medium">자외선 지수 위젯 빌더</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Geolocation Search Quick Indicator */}
            <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium ${
              geoStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              geoStatus === 'loading' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse' :
              'bg-zinc-800 text-zinc-450 border border-zinc-700/50'
            }`}>
              <MapPin size={11} className={geoStatus === 'loading' ? 'animate-bounce' : ''} />
              <span className="max-w-[120px] truncate">{geoStatus === 'success' ? uvData.locationName : '인공 GPS 미인가'}</span>
            </div>

            {/* App Dark Toggle */}
            <button
              onClick={() => setAppTheme(appTheme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                appTheme === 'dark' 
                  ? 'border-zinc-800 hover:bg-zinc-900 text-orange-400' 
                  : 'border-zinc-200 hover:bg-zinc-100 text-orange-600'
              }`}
              title={appTheme === 'dark' ? '라이트 모드' : '다크 모드'}
            >
              {appTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </div>
      </header>

      {/* 3. MAIN DASHBOARD CONTENT GRID */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        
        {/* Welcome Pitch Board */}
        <div className={`p-5 rounded-2xl border mb-6 relative overflow-hidden backdrop-blur-md transition-all ${
          appTheme === 'dark' 
            ? 'bg-gradient-to-r from-zinc-900/60 via-zinc-950/40 to-zinc-900 border-zinc-800' 
            : 'bg-gradient-to-r from-orange-50/20 via-white to-zinc-50 border-zinc-200'
        }`}>
          <div className="absolute top-0 right-0 w-48 h-full bg-radial from-orange-500/5 to-transparent pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-orange-400 font-mono flex items-center gap-1">
                <Sparkles size={11} className="animate-pulse text-orange-450" />
                스마트폰 맞춤 자외선 일기예보
              </span>
              <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight">
                안드로이드 자외선지수 위젯 매니저
              </h2>
              <p className={`text-xs ${appTheme === 'dark' ? 'text-zinc-400' : 'text-zinc-650'} leading-relaxed max-w-2xl`}>
                외출 전 스마트폰 홈 화면에서 선제적으로 현 위치 자외선강도를 확인하세요. 본 동반자 앱에서 위젯의 테마 디자인을 인쇄하고 동기 주기를 제어하며 정전 알람 임계치를 실사구시로 디자인할 수 있습니다.
              </p>
            </div>
            
            <button
              onClick={handleFetchCurrentLocation}
              disabled={geoStatus === 'loading'}
              className="shrink-0 bg-orange-500 hover:bg-orange-600 active:bg-orange-750 text-white text-xs px-4 py-2.5 rounded-xl font-bold transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Locate size={14} className={geoStatus === 'loading' ? 'animate-spin' : ''} />
              GPS 현재 실시간 위치 연동
            </button>
          </div>
        </div>

        {/* TAB CONTROLS */}
        <div className="flex border-b border-zinc-800 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
          <TabButton 
            active={activeTab === 'simulator'} 
            onClick={() => setActiveTab('simulator')}
            label="위젯 시뮬레이터 ( homescreen 프리뷰)"
            icon={<Smartphone size={15} />}
          />
          <TabButton 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
            label="동기 주기 및 푸시 알림 설정"
            icon={<Settings size={15} />}
          />
          <TabButton 
            active={activeTab === 'forecast'} 
            onClick={() => setActiveTab('forecast')}
            label="자외선 상세정보 & 예보"
            icon={<Compass size={15} />}
          />
          <TabButton 
            active={activeTab === 'guide'} 
            onClick={() => setActiveTab('guide')}
            label="실제 안드로이드 위젯 설치 가이드"
            icon={<HelpCircle size={15} />}
          />
        </div>

        {/* TAB CONTENTS PANELS */}
        <div className="transition-all duration-300">
          
          {activeTab === 'simulator' && (
            <WidgetSimulator 
              style={widgetStyle}
              setStyle={setWidgetStyle}
              settings={widgetSettings}
              uvData={uvData}
              onRefreshWidget={handleFetchCurrentLocation}
            />
          )}

          {activeTab === 'settings' && (
            <WidgetSettingsComponent 
              settings={widgetSettings}
              setSettings={setWidgetSettings}
              onRequestGeolocation={handleFetchCurrentLocation}
              geoStatus={geoStatus}
              coords={{ lat: uvData.latitude, lon: uvData.longitude }}
              locationName={uvData.locationName}
              onSendTestNotification={() => triggerNotificationAlert()}
            />
          )}

          {activeTab === 'forecast' && (
            <UvForecast 
              uvData={uvData}
              onCitySelect={handleCitySelect}
            />
          )}

          {activeTab === 'guide' && (
            <WidgetSetupGuide />
          )}

        </div>

      </main>

      {/* 4. FOOTER */}
      <footer className={`border-t ${
        appTheme === 'dark' ? 'border-zinc-800 text-zinc-500' : 'border-zinc-200 text-zinc-400'
      } text-xs py-10 mt-16 text-center transition-colors`}>
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-zinc-400 flex items-center justify-center gap-1.5 font-display text-sm">
            <Sun className="text-orange-500 fill-current animate-pulse" size={15} />
            UVCast Widget Companion Tool
          </p>
          <p className="font-sans">
            안드로이드 시스템 자외선 측정기용 커스텀 위젯 스킨 조율 데모 환경입니다.<br />
            실제 백그라운드 구동은 기기 배터리 모니터 및 인가 권한 설정에 보초를 받습니다.
          </p>
          <p className="text-[10px] font-mono pt-2">
            © 2026 UVCast Mobile Labs. All rights reserved. Built with Vite & Tailwind v4.
          </p>
        </div>
      </footer>

    </div>
  );
}

// Custom Tab Button helper inside App
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}

function TabButton({ active, onClick, label, icon }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 border-b-2 ${
        active 
          ? 'text-orange-400 border-orange-500 bg-orange-500/5' 
          : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-900/10'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
