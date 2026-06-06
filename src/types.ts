export type WidgetTheme = 'dark' | 'light' | 'amoled' | 'glass';
export type WidgetSize = 'small' | 'medium' | 'large';

export interface WidgetStyle {
  theme: WidgetTheme;
  size: WidgetSize;
  opacity: number; // 0 to 100
  showLocation: boolean;
  showLastUpdated: boolean;
  showUvLevelText: boolean;
  accentColor: string; // Tailwind color class or hex, e.g., 'amber' | 'emerald' | 'blue' | 'rose'
}

export type RefreshFrequency = 'manual' | '15m' | '30m' | '1h' | '3h';

export interface WidgetSettings {
  refreshFrequency: RefreshFrequency;
  notificationEnabled: boolean;
  notificationThreshold: number; // e.g. 3, 6, 8, 11
  alertOzoneIndex: boolean;
  gpsTracking: boolean;
}

export interface HourlyForecast {
  time: string; // e.g., "09:00"
  uv: number;
}

export interface UvData {
  uvIndex: number;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  lastUpdated: string;
  hourlyForecast: HourlyForecast[];
  dailyMax: number;
  status: 'idle' | 'loading' | 'success' | 'error';
  errorMessage: string | null;
}

export interface UvsInfo {
  level: '낮음' | '보통' | '높음' | '매우높음' | '위험';
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  actionGuide: string;
}

export function getUvLevelInfo(uv: number): UvsInfo {
  if (uv < 3) {
    return {
      level: '낮음',
      color: '#10B981', // emerald-500
      textColor: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      actionGuide: '자외선 자극이 낮은 상태입니다. 특별한 보호 조치 없이 안심하고 야외 활동을 하셔도 좋습니다.',
    };
  } else if (uv < 6) {
    return {
      level: '보통',
      color: '#F59E0B', // amber-500
      textColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      actionGuide: '자외선 지수가 다소 올라가는 시간대입니다. 햇볕에 민감한 피부를 가졌다면 자외선 차단제를 바르고 모자를 착용하세요.',
    };
  } else if (uv < 8) {
    return {
      level: '높음',
      color: '#F97316', // orange-500
      textColor: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      actionGuide: '햇볕 아래 1~2시간만 서 있어도 피부 화상을 입을 수 있습니다. 외출 시 긴소매, 선글라스, SPF 30+ 차단제는 필수입니다.',
    };
  } else if (uv < 11) {
    return {
      level: '매우높음',
      color: '#EF4444', // rose-500
      textColor: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      actionGuide: '위험한 수준의 자외선입니다. 오전 10시부터 오후 3시 사이에는 실외 활동을 줄이고 반드시 그늘과 피부 안전 조치 속에서 야외 작업을 진행하세요.',
    };
  } else {
    return {
      level: '위험',
      color: '#7C3AED', // violet-600
      textColor: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/30',
      actionGuide: '생명체 및 피부 세포에 지극히 극심한 손상을 줄 수 있는 수치이므로 외출을 가급적 자제하고 실내에 머무르는 것을 적극 권장합니다.',
    };
  }
}
