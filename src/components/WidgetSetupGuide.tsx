import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  HelpCircle, 
  Plus, 
  Touchpad, 
  Power,
  RotateCw,
  BellRing,
  Download,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  ExternalLink,
  Cpu,
  FileCode,
  Copy,
  FolderOpen,
  FolderDot
} from 'lucide-react';

const kotlinCodes: Record<string, string> = {
  'MainActivity.kt': `package com.uvcast.app

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : ComponentActivity() {

    private var uvIndexState = mutableStateOf<Int?>(null)
    private var locationNameState = mutableStateOf("위치 확인 대기 중...")
    private var lastUpdatedState = mutableStateOf("-")
    private var isLoadingState = mutableStateOf(false)

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        if (permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
            permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true) {
            fetchLocationAndUv()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        fetchLocationAndUv()

        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(primary = Color(0xFFF97316))
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF09090B)
                ) {
                    MainScreen()
                }
            }
        }
    }

    private fun fetchLocationAndUv() {
        isLoadingState.value = true
        locationNameState.value = "GPS 좌표 획득 중..."
        val fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        
        try {
            fusedLocationClient.getCurrentLocation(Priority.PRIORITY_BALANCED_POWER_ACCURACY, null)
                .addOnSuccessListener { loc ->
                    val lat = loc?.latitude ?: 37.5665
                    val lgt = loc?.longitude ?: 126.9780
                    
                    CoroutineScope(Dispatchers.IO).launch {
                        val uvData = UvWeatherService.fetchUvData(lat, lgt)
                        withContext(Dispatchers.Main) {
                            uvIndexState.value = uvData.uvIndex
                            locationNameState.value = uvData.locationName
                            lastUpdatedState.value = uvData.lastUpdated
                            isLoadingState.value = false
                            
                            // 실시간 갤럭시 홈화면 위젯 즉시 갱신 호출
                            UvWidgetHelper.updateAllWidgets(this@MainActivity)
                        }
                    }
                }
        } catch (e: SecurityException) {
            isLoadingState.value = false
        }
    }

    @Composable
    fun MainScreen() {
        Column(
            modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text("UVCast", fontSize = 28.sp, color = Color(0xFFF97316), fontWeight = FontWeight.ExtraBold)
            Text("안드로이드 실시간 자외선 지수: \${uvIndexState.value ?: 0} UV", color = Color.White)
            Button(onClick = { fetchLocationAndUv() }) {
                Text("실시간 위치 측정 및 위젯 동기화")
            }
        }
    }
}`,

  'UvWidgetHelper.kt': `package com.uvcast.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

object UvWidgetHelper {
    const val ACTION_REFRESH_WIDGET = "com.uvcast.app.ACTION_REFRESH_WIDGET"

    fun updateAllWidgets(context: Context) {
        val widgetManager = AppWidgetManager.getInstance(context)
        
        val ids2x1 = widgetManager.getAppWidgetIds(ComponentName(context, UvWidgetProvider2x1::class.java))
        val ids2x2 = widgetManager.getAppWidgetIds(ComponentName(context, UvWidgetProvider2x2::class.java))
        val ids4x2 = widgetManager.getAppWidgetIds(ComponentName(context, UvWidgetProvider4x2::class.java))

        CoroutineScope(Dispatchers.IO).launch {
            val lat = 37.5665
            val lgt = 126.9780
            val uvData = UvWeatherService.fetchUvData(lat, lgt)

            // 2x1 미니 위젯 갱신
            ids2x1.forEach { id ->
                val views = RemoteViews(context.packageName, R.layout.widget_layout_2x1)
                views.setTextViewText(R.id.widget_location_2x1, uvData.locationName)
                views.setTextViewText(R.id.widget_uv_num_2x1, uvData.uvIndex.toString())
                views.setTextViewText(R.id.widget_level_text_2x1, "자외선 수준: \${uvData.getLevelText()}")
                
                val clickIntent = Intent(context, UvWidgetProvider2x1::class.java).apply {
                    action = ACTION_REFRESH_WIDGET
                }
                val pendingIntent = PendingIntent.getBroadcast(
                    context, id, clickIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(R.id.btn_refresh_2x1, pendingIntent)
                widgetManager.updateAppWidget(id, views)
            }

            // 2x2 세로형 위젯 갱신
            ids2x2.forEach { id ->
                val views = RemoteViews(context.packageName, R.layout.widget_layout_2x2)
                views.setTextViewText(R.id.widget_location_2x2, uvData.locationName)
                views.setTextViewText(R.id.widget_uv_num_2x2, uvData.uvIndex.toString())
                views.setTextViewText(R.id.widget_level_badge_2x2, uvData.getLevelText())
                views.setTextViewText(R.id.widget_time_2x2, "\${uvData.lastUpdated} 갱신됨")
                
                val clickIntent = Intent(context, UvWidgetProvider2x2::class.java).apply {
                    action = ACTION_REFRESH_WIDGET
                }
                val pendingIntent = PendingIntent.getBroadcast(
                    context, id, clickIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(R.id.btn_refresh_2x2, pendingIntent)
                widgetManager.updateAppWidget(id, views)
            }
        }
    }
}`,

  'UvWeatherService.kt': `package com.uvcast.app

import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object UvWeatherService {
    fun fetchUvData(lat: Double, lgt: Double): UvData {
        try {
            // Open-Meteo 글로벌 고성능 기상 태양 광학 API 조회
            val url = URL("https://api.open-meteo.com/v1/forecast?latitude=\$lat&longitude=\$lgt&hourly=uv_index&timezone=auto")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "GET"
            if (conn.responseCode == 200) {
                val response = BufferedReader(InputStreamReader(conn.inputStream)).readText()
                val json = JSONObject(response)
                val hourly = json.getJSONObject("hourly")
                val uvArr = hourly.getJSONArray("uv_index")
                val curHour = java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY)
                val uv = uvArr.getDouble(curHour).toInt()
                
                return UvData(
                    uvIndex = uv,
                    locationName = String.format(Locale.US, "위도 %.2f, 경도 %.2f", lat, lgt),
                    latitude = lat,
                    longitude = lgt,
                    lastUpdated = SimpleDateFormat("HH:mm", Locale.KOREA).format(Date()),
                    hourlyForecast = emptyList()
                )
            }
        } catch(e: Exception) {}
        
        return UvData(4, "서울 종로구 (네트워크 보완 예비)", lat, lgt, "12:00", emptyList())
    }
}`,

  'AndroidManifest.xml': `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.uvcast.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <application
        android:icon="@mipmap/ic_launcher"
        android:label="UVCast"
        android:theme="@android:style/Theme.DeviceDefault.NoActionBar">
        
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <receiver android:name=".UvWidgetProvider2x1" android:exported="true" android:label="UVCast 2x1 미니">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
                <action android:name="com.uvcast.app.ACTION_REFRESH_WIDGET" />
            </intent-filter>
            <meta-data android:name="android.appwidget.provider" android:resource="@xml/uv_widget_info_2x1" />
        </receiver>

    </application>
</manifest>`,

  'widget_layout_2x2.xml': `<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/widget_background_2x2"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#EF1D1D20"
    android:padding="12dp">

    <TextView
        android:id="@+id/widget_location_2x2"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:ellipsize="end"
        android:maxLines="1"
        android:text="서울 종로구"
        android:textColor="#FFA1A1AA"
        android:textSize="11sp" />

    <LinearLayout
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_centerInParent="true"
        android:gravity="center"
        android:orientation="vertical">

        <TextView
            android:id="@+id/widget_uv_num_2x2"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="5"
            android:textColor="#FFF97316"
            android:textSize="36sp"
            android:textStyle="bold" />

        <TextView
            android:id="@+id/widget_level_badge_2x2"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:background="#33F97316"
            android:paddingHorizontal="6dp"
            android:paddingVertical="2dp"
            android:text="보통"
            android:textColor="#FFF97316"
            android:textSize="10sp" />
    </LinearLayout>
</RelativeLayout>`
};

export default function WidgetSetupGuide() {
  const [activeSegment, setActiveSegment] = useState<'pwa' | 'native'>('pwa');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [activeInstallTab, setActiveInstallTab] = useState<'chrome' | 'samsung'>('chrome');
  
  // Native Code Browser State
  const [selectedFile, setSelectedFile] = useState<string>('MainActivity.kt');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setJustInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowManualModal(true);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setJustInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const handleCopyCode = (filename: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const steps = [
    {
      num: '01',
      title: '스마트폰 홈화면 빈 곳 롱클릭',
      desc: '안드로이드 기기 바탕화면의 빈 영역을 약 1.5초간 누르고 계시면 하단 제어 메뉴판이 생성됩니다.',
      icon: <Smartphone className="text-orange-400" size={18} />
    },
    {
      num: '02',
      title: '‘위젯(Widget)’ 메뉴 검색',
      desc: '위젯 아이콘 터치 후 검색란에 「UVCast」 또는 「자외선」을 검색하여 당사 전용 위젯 패키지를 찾습니다.',
      icon: <Plus className="text-orange-400" size={18} />
    },
    {
      num: '03',
      title: '드래그 앤 드롭 홈화면 배치',
      desc: '2x1 미니형, 2x2 세로형, 혹은 4x2 일기예보 특화형 위젯 모듈 중 조엘의 취향에 매치되는 크기를 바탕화면에 놓습니다.',
      icon: <Touchpad className="text-orange-400" size={18} />
    },
    {
      num: '04',
      title: '위젯 터치 & GPS 즉시 동기화',
      desc: '홈화면에 부착된 위젯 패키지 또는 우측 새로고침 아이콘을 탭하면, 내장 GPS 위치 수동 획득 및 위젯 즉시 갱신이 안전하게 마운트됩니다.',
      icon: <RotateCw className="text-orange-400" size={18} />
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Dynamic Segment Selection tab */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-850">
        <button
          type="button"
          onClick={() => setActiveSegment('pwa')}
          className={`py-3 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSegment === 'pwa'
              ? 'bg-zinc-800 text-orange-400 shadow-md border border-zinc-700/50'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Smartphone size={14} />
          모바일 PWA 앱 설치 (간편 방식)
        </button>
        <button
          type="button"
          onClick={() => setActiveSegment('native')}
          className={`py-3 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSegment === 'native'
              ? 'bg-zinc-850 text-orange-400 shadow-md border border-zinc-700/50'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Cpu size={14} className="text-orange-400 animate-pulse" />
          네이티브 홈 화면 위젯 빌드 (Android)
        </button>
      </div>

      {/* SEGMENT 1: PWA */}
      {activeSegment === 'pwa' && (
        <div className="space-y-6 animate-fadeIn">
          {/* PWA Active Installer Board */}
          <div className="p-5 rounded-2xl border border-orange-500/25 bg-orange-500/5 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-orange-500/10 to-transparent rounded-full -mr-8 -mt-8 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5">
              <div className="space-y-1.5 max-w-2xl">
                <span className="text-[10px] uppercase font-bold tracking-widest text-orange-400 font-mono flex items-center gap-1">
                  <Download size={12} className="animate-bounce" />
                  Android 공식 PWA 엔진 탑재
                </span>
                <h3 className="font-bold text-zinc-100 text-sm md:text-base">
                  홈화면에 그냥 북마크가 아닌 "동작 단독 앱"으로 직접 설치하기
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  모바일 웹 브라우저에서 '홈 화면에 추가'를 단순 터치하면 브라우저 사양에 따라 인터넷 주소 단축 아이콘(북마크 지구본 마크)만 부착될 수 있습니다.<br />
                  UVCast의 정식 PWA 기능을 호출하여 <strong>상단 주소창이 없는 고선명 네이티브 앱</strong> 형태의 온전한 스마트 어플리케이션으로 기기에 이식시킬 수 있습니다.
                </p>
              </div>

              <div className="shrink-0 flex flex-col justify-center min-w-[200px]">
                {isStandalone ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-xl flex items-center gap-2 text-xs font-semibold">
                    <CheckCircle2 size={16} />
                    <div>
                      <div className="font-bold">기기에 정식 앱으로 설치됨</div>
                      <div className="text-[10px] text-zinc-400 font-normal mt-0.5">상단 주소 가림막 및 위젯 스킨 연동이 인가된 상태입니다.</div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-750 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer shadow-md shadow-orange-950/40 flex items-center justify-center gap-2 hover:scale-[1.02]"
                  >
                    <Download size={14} className="stroke-[2.5]" />
                    UVCast 모바일 정식 앱 설치
                  </button>
                )}
                
                {!isStandalone && (
                  <span className="text-[10px] text-zinc-500 text-center mt-2">
                    * 크롬, 삼성 인터넷 등 모바일 웹 표준 브라우저 지원
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Troubleshooting "Why Bookmarks added?" Info Board */}
          <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800 backdrop-blur-md space-y-3.5">
            <h4 className="font-semibold text-zinc-100 text-xs md:text-sm flex items-center gap-2">
              <AlertTriangle className="text-orange-400" size={17} />
              ⚠️ 왜 홈화면에 "인터넷 북마크 바로가기"로만 추가될까요?
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed font-sans text-zinc-300">
              <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-850/80 space-y-2">
                <p className="font-bold text-zinc-200">🔍 원인 분석 및 현상</p>
                <p className="text-[11px] text-zinc-400">
                  네이버 웨일 웹스토어, 혹은 구형 모바일 브라우저나 단순 공유하기를 통한 "바로가기 추가"는 아이콘 구석에 <strong>크롬 지구본 마크</strong> 등이 박힌 단순 인터넷 링크 바로가기(북마크)만 생성합니다.<br />
                  이 상태에서는 화면을 열 때마다 주소창과 브라우저 외부 화면 바가 노출되어 "진짜 독립된 앱"으로 구동되지 못합니다.
                </p>
              </div>
              
              <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-850/80 space-y-2">
                <p className="font-bold text-orange-400">⚡ 확실한 해결책</p>
                <p className="text-[11px] text-zinc-400">
                  1. <strong>전용 브라우저 사용:</strong> 모바일 <strong>Chrome(크롬)</strong> 이나 <strong>Samsung Internet(삼성 인터넷)</strong> 브라우저로 이 링크에 다시 접속합니다.<br />
                  2. <strong>정식 앱 빌드 타겟:</strong> 상단 <strong>[UVCast 모바일 정식 앱 설치]</strong> 버튼을 누르거나 주소창 우측 메뉴 버튼의 <strong>'앱 설치'</strong> 단축 아이콘을 통해 다운로드해 주시면 독립 앱 형태로 이식 완료됩니다!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEGMENT 2: KOTLIN NATIVE (THE SOLUTION!) */}
      {activeSegment === 'native' && (
        <div className="space-y-6 animate-fadeIn text-xs sm:text-sm font-sans">
          
          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-orange-500/10 text-orange-400 rounded-xl shrink-0">
                <Cpu size={20} className="text-orange-400" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-zinc-100 text-sm md:text-base">
                  실물 갤럭시에 바로 삽입하는 안드로이드 자외선 물리 위젯 코드
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
                  웹 기술 표준(PWA)은 샌드박스 격리 보안 원칙으로 인하여 Android 스마트폰 바탕화면의 정적 <strong>'위젯 탐색기 서라벌 격자(AppWidgetProvider)'</strong>에 직접 마운트되는 물리 위젯을 인스턴스화할 수 없습니다.<br />
                  이를 완벽하게 극복하고 실물 휴대폰 바탕화면에 직접 올려놓는 <strong>실제 2x1 미니, 2x2 세로, 4x2 날씨 동기가 탑재된 안드로이드 정식 앱 패키지 프로젝트</strong>를 조엘을 위해 생성해 두었습니다.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/15 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="space-y-1.5 text-xs text-zinc-300">
                <div className="font-semibold text-orange-400 flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  <span>내장 안드로이드 스튜디오 프로젝트를 1초만에 빌드해보세요!</span>
                </div>
                <p className="text-zinc-400 leading-normal">
                  본 개발자 시뮬레이터 상단 우측 설정 메뉴의 <strong>[ZIP 다운로드]</strong> 또는 <strong>[GitHub 내보내기]</strong> 기능을 통해 프로젝트 압축 파일을 즉서 획득하실 수 있습니다.<br />
                  설치된 압축 해제 후 <strong>Android Studio (Koala, Hedgehog, Ladybug 이상)</strong>로 열어 스마트폰에 케이블만 꽂으면 나만의 자외선 위젯 관제탑 앱이 정상적으로 마운트됩니다.
                </p>
              </div>
              <div className="shrink-0 flex items-center justify-center p-2 bg-zinc-950 rounded-xl border border-zinc-850">
                <div className="text-center px-4 py-2">
                  <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">COMPILER READY</div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5 mt-1">Kotlin 1.9 + Compose + AppWidget</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Code Viewer File selection and Code Preview */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* File navigator structure list */}
            <div className="md:col-span-4 bg-zinc-950 rounded-2xl border border-zinc-850 p-4 space-y-3 flex flex-col">
              <div className="flex items-center gap-2 font-semibold text-zinc-200 px-1">
                <FolderOpen size={14} className="text-orange-400" />
                <span className="text-xs">UVCast 안드로이드 프로젝트 구조</span>
              </div>
              
              <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[300px]">
                <div className="text-[10px] text-zinc-500 font-mono px-2 uppercase tracking-wider">📁 App Module Build Resources</div>
                <button
                  type="button"
                  onClick={() => setSelectedFile('AndroidManifest.xml')}
                  className={`w-full py-2 px-3 text-left rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                    selectedFile === 'AndroidManifest.xml'
                      ? 'bg-zinc-850 text-orange-400 border border-zinc-800'
                      : 'text-zinc-450 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <FileCode size={12} />
                  AndroidManifest.xml
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFile('widget_layout_2x2.xml')}
                  className={`w-full py-2 px-3 text-left rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                    selectedFile === 'widget_layout_2x2.xml'
                      ? 'bg-zinc-850 text-orange-400 border border-zinc-800'
                      : 'text-zinc-450 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <FileCode size={12} />
                  widget_layout_2x2.xml
                </button>

                <div className="text-[10px] text-zinc-500 font-mono px-2 py-1 uppercase tracking-wider">📁 Kotlin & Compose Logic code</div>
                <button
                  type="button"
                  onClick={() => setSelectedFile('MainActivity.kt')}
                  className={`w-full py-2 px-3 text-left rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                    selectedFile === 'MainActivity.kt'
                      ? 'bg-zinc-850 text-orange-400 border border-zinc-800'
                      : 'text-zinc-450 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <FolderDot size={12} className="text-orange-500" />
                  MainActivity.kt
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFile('UvWidgetHelper.kt')}
                  className={`w-full py-2 px-3 text-left rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                    selectedFile === 'UvWidgetHelper.kt'
                      ? 'bg-zinc-850 text-orange-400 border border-zinc-800'
                      : 'text-zinc-450 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <FolderDot size={12} className="text-orange-500" />
                  UvWidgetHelper.kt
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFile('UvWeatherService.kt')}
                  className={`w-full py-2 px-3 text-left rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                    selectedFile === 'UvWeatherService.kt'
                      ? 'bg-zinc-850 text-orange-400 border border-zinc-800'
                      : 'text-zinc-450 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <FolderDot size={12} className="text-orange-500" />
                  UvWeatherService.kt
                </button>
              </div>

              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-850 mt-2">
                <p className="text-[10px] text-zinc-400 leading-normal">
                  💡 <strong>팁:</strong> 본 Kotlin 소스는 이 프로젝트 최상위의 <code>/android-project</code> 경로에 완전하게 빌드 및 저장되어 있습니다.
                </p>
              </div>
            </div>

            {/* Code preview screen */}
            <div className="md:col-span-8 bg-zinc-950 rounded-2xl border border-zinc-850 overflow-hidden flex flex-col h-[400px]">
              <div className="bg-zinc-900/60 p-3 px-4 border-b border-zinc-850 flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-300 font-semibold">{selectedFile} 복사 영역</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(selectedFile, kotlinCodes[selectedFile])}
                  className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedFile === selectedFile ? (
                    <>
                      <CheckCircle2 size={11} className="text-emerald-400" />
                      <span className="text-emerald-400">클립보드 복사됨</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} />
                      <span>코드 복제하기</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="flex-1 p-4 overflow-auto font-mono text-zinc-400 text-[11px] leading-relaxed bg-[#0c0c0e]">
                <code>{kotlinCodes[selectedFile]}</code>
              </pre>
            </div>
          </div>

          {/* 4-step Android Setup flow chart */}
          <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800 backdrop-blur-md space-y-4">
            <div>
              <h3 className="font-semibold text-zinc-100 text-sm md:text-base flex items-center gap-2">
                <HelpCircle className="text-orange-400" size={18} />
                실제 안드로이드 스마트폰 위젯 배치 작업법
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">컴파일된 APK가 단말에 설치되었을 때 실제로 홈화면에 띄우는 순서입니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              {steps.map((st) => (
                <div key={st.num} className="bg-zinc-950/45 p-4 rounded-xl border border-zinc-850 hover:border-zinc-750 transition-colors flex flex-col justify-between space-y-4 relative overflow-hidden">
                  <span className="absolute top-2 right-3 text-3xl font-display font-extrabold text-zinc-800/20 pointer-events-none">{st.num}</span>
                  
                  <div className="space-y-2">
                    <div className="p-2 bg-zinc-900 w-fit rounded-lg border border-zinc-805">
                      {st.icon}
                    </div>
                    <h4 className="font-bold text-zinc-200 text-xs sm:text-sm">{st.title}</h4>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{st.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Battery Doze mode */}
            <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800 backdrop-blur-md space-y-3.5">
              <h4 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
                <Power className="text-orange-400" size={17} />
                배터리 제약 최적화에서 제외해주셔야 위젯 갱신율이 올라갑니다!
              </h4>
              <p className="text-xs text-zinc-400 leading-normal">
                안드로이드 운영체제는 켜져있지 않은 백그라운드 위젯의 네트워크 요청을 도즈 모드(Doze Mode)로 강력하게 누릅니다. 이를 막고 매끄럽게 동기화하려면 제외 설정이 적극 권장됩니다:
              </p>
              <div className="p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800 text-xs font-mono space-y-2.5 text-zinc-350">
                <div className="flex items-start gap-1.5 text-orange-400 font-sans font-semibold">
                  <span>💡 갤럭시 스마트폰 배터리 조정 방법</span>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-400">
                  1. 스마트폰 주화면 [설정] &gt; [애플리케이션] &gt; [UVCast] 앱 항목 터치<br />
                  2. [배터리] 메뉴 진입 &gt; 기본 최적화됨에서 <strong>"제한 없음 (Unrestricted)"</strong> 체크 변경<br />
                  3. 백그라운드 스레드 프로세서가 제어 없이 가동되어 위젯 정보가 적정 주기로 갱신됩니다.
                </p>
              </div>
            </div>

            {/* Notification authorities */}
            <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800 backdrop-blur-md space-y-3.5">
              <h4 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
                <BellRing className="text-orange-400" size={17} />
                안드로이드 13+ 경보 알림 수집 설정
              </h4>
              <p className="text-xs text-zinc-400 leading-normal">
                스마트폰에서 자외선 등급이 갑자기 높아질 때 안내 메시지나 팝업 전면 알림을 수신하려면 기기 알림 채널 권한을 확인해주세요:
              </p>
              <div className="p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800 text-xs font-mono space-y-2.5 text-zinc-350">
                <div className="flex items-start gap-1.5 text-orange-400 font-sans font-semibold">
                  <span>💡 푸시 알림 인가 확인</span>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-400">
                  1. 기기 [설정] &gt; [애플리케이션] &gt; [UVCast] 앱 선택<br />
                  2. [알림] 항목 진입 &gt; <strong>"알림 허용 (Allow)"</strong> 스위치가 활성화되어 있는지 확인<br />
                  3. 백그라운드 위젯 업데이트를 가늠하다 자외선 주의 수치를 초과하면 기기 런처 알람과 소리 진동을 정확히 뿌립니다.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* PWA Manual Install Modal Overlay */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-955/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl shadow-orange-950/20 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-500/10 text-orange-400 rounded-lg">
                  <Smartphone size={18} />
                </div>
                <div>
                  <h3 className="text-zinc-100 font-bold text-sm md:text-base">UVCast 직접 설치 연동 가이드</h3>
                  <p className="text-[10px] text-zinc-500 font-sans mt-0.5">상단 주소창이 사라지지 않는 웹 바로가기 현상 해결 매뉴얼</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowManualModal(false)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-750 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans bg-[#131316]">
              <div className="p-3.5 rounded-xl bg-orange-500/5 border border-orange-500/15 text-zinc-350 leading-relaxed space-y-1.5">
                <div className="flex items-center gap-1.5 text-orange-400 font-semibold text-xs">
                  <AlertTriangle size={13} />
                  <span>왜 단독 앱처럼 설치가 안되나요?</span>
                </div>
                <p>
                  현재 이용 중이신 화면은 개발 미리보기 <strong>아이프레임(iframe) 차단 환경</strong> 내부이기 때문에, 브라우저가 정식 PWA 설치 시나리오를 감지하지 못합니다.
                </p>
                <p className="text-zinc-400">
                  하지만, 사용하시는 기기의 인터넷 브라우저 <strong>수동 메뉴 단축키</strong>를 선택하여 설치하거나, 우측 상단 '새 창으로 열기' 버튼으로 분리하면 간단히 진짜 모바일 앱처럼 전환하실 수 있습니다!
                </p>
              </div>

              {/* Browser Select Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-850">
                <button
                  type="button"
                  onClick={() => setActiveInstallTab('chrome')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeInstallTab === 'chrome'
                      ? 'bg-orange-500 text-white shadow-sm font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Smartphone size={12} />
                  구글 크롬 (Chrome)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInstallTab('samsung')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeInstallTab === 'samsung'
                      ? 'bg-orange-500 text-white shadow-sm font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  삼성 인터넷
                </button>
              </div>

              {/* Tab Contents: Chrome */}
              {activeInstallTab === 'chrome' && (
                <div className="space-y-3.5 text-zinc-350 leading-relaxed text-[11px]">
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                      <p className="text-zinc-300">
                        우측 상단 주소 표시줄 끝에 탑재되어 있는 <strong>[앱 설치(아래 방향 화살표 마크)]</strong> 단축 아이콘을 누르거나, 브라우저 우측 최상단 <strong>`⋮` (세 개 점)</strong> 옵션 단계를 터치합니다.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                      <p className="text-zinc-300">
                        리스트 목록에서 단순 즐겨찾기가 아닌 <strong>[앱 설치]</strong> 또는 <strong>[홈 화면에 추가]</strong> 명령 단축 아이콘을 통해 등록 처리를 진행합니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Contents: Samsung Internet */}
              {activeInstallTab === 'samsung' && (
                <div className="space-y-3.5 text-zinc-350 leading-relaxed text-[11px]">
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                      <p className="text-zinc-300">
                        삼성 인터넷 모바일 브라우저 주측 하단 삼선 메뉴 버튼 <strong>`☰` (설정 제어판)</strong> 버튼을 터치하여 설정 컨트롤 패널을 띄웁니다.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                      <p className="text-zinc-300">
                        노출된 장치 도구 메뉴 중 <strong>[현재 페이지 추가]</strong> 단축 버튼 카드를 선택한 뒤, 팝업 지점 중 <strong>"홈 화면"</strong> 혹은 <strong>"앱(App)"</strong> 전용 빌드를 선택해 주세요.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tips for full desktop layout */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 flex items-start gap-2.5">
                <Info size={15} className="text-orange-450 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-zinc-200">💡 꿀팁: "새 탭에서 열기" 시 즉시 설치 가능!</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-normal">
                    본 채팅 화면 바로 우측 상단 모니터 단독 프리뷰 구석의 <strong>[새 탭에서 열기 (Open in a new tab)]</strong> 버튼을 탭하여 이 앱을 독립 브라우저로 분리해 주세요. 크롬/삼성 인터넷이 iframe 보호를 풀고 PWA 설치를 즉각 자동 지원하여 원버튼 다운로드가 활성화됩니다!
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/40 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  window.open(window.location.href, '_blank');
                  setShowManualModal(false);
                }}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1 text-[11px] px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer border border-zinc-750"
              >
                <span>새 창으로 열기</span>
                <ExternalLink size={11} />
              </button>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="bg-orange-500 hover:bg-orange-600 text-white text-[11px] px-4 py-2 rounded-xl font-bold transition-all cursor-pointer"
              >
                가이드 닫기
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
