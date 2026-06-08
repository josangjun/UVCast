package com.uvcast.app

import android.Manifest
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.widget.RemoteViews
import androidx.core.content.ContextCompat
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.Tasks
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

object UvWidgetHelper {
    const val ACTION_REFRESH_WIDGET = "com.uvcast.app.ACTION_REFRESH_WIDGET"

    // 1. 단순 날씨 기반 전체 위젯 업데이트 (기본/주기적 갱신용)
    fun updateAllWidgets(context: Context) {
        CoroutineScope(Dispatchers.IO).launch {
            val (lat, lgt) = UvLocationStore.load(context) ?: (37.5665 to 126.9780)
            val uvData = UvWeatherService.fetchUvData(context, lat, lgt)
            // 캐시 저장
            UvLocationStore.saveUvData(context, uvData)
            renderAllWidgetsWithData(context, uvData)
        }
    }

    // 2. 탭했을 때 실시간 위치 정보(GPS)를 기기에서 획득하고 날씨 데이터를 받아와 갱신
    fun refreshWidgetWithGps(context: Context) {
        // 즉시 로딩 UI 반영
        updateWidgetsToLoading(context)

        CoroutineScope(Dispatchers.IO).launch {
            var lat = 37.5665
            var lgt = 126.9780
            
            // 기존 저장된 위치 로드 (폴백용)
            val cachedLoc = UvLocationStore.load(context)
            if (cachedLoc != null) {
                lat = cachedLoc.first
                lgt = cachedLoc.second
            }

            // 위치 권한 체크
            val hasFine = ContextCompat.checkSelfPermission(
                context, Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
            val hasCoarse = ContextCompat.checkSelfPermission(
                context, Manifest.permission.ACCESS_COARSE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED

            if (hasFine || hasCoarse) {
                try {
                    val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)
                    // Tasks.await을 사용해 동기식으로 대기
                    val task = fusedLocationClient.getCurrentLocation(
                        Priority.PRIORITY_BALANCED_POWER_ACCURACY, null
                    )
                    val loc = Tasks.await(task)
                    if (loc != null) {
                        lat = loc.latitude
                        lgt = loc.longitude
                        UvLocationStore.save(context, lat, lgt)
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }

            // 자외선 데이터 갱신 및 캐시 저장
            val uvData = UvWeatherService.fetchUvData(context, lat, lgt)
            UvLocationStore.saveUvData(context, uvData)

            // UI 렌더링
            renderAllWidgetsWithData(context, uvData)
        }
    }

    // 3. 로딩 상태 UI 렌더링
    fun updateWidgetsToLoading(context: Context) {
        val widgetManager = AppWidgetManager.getInstance(context)
        
        val ids2x1 = widgetManager.getAppWidgetIds(ComponentName(context, UvWidgetProvider2x1::class.java))
        val ids2x2 = widgetManager.getAppWidgetIds(ComponentName(context, UvWidgetProvider2x2::class.java))
        val ids4x2 = widgetManager.getAppWidgetIds(ComponentName(context, UvWidgetProvider4x2::class.java))

        ids2x1.forEach { id ->
            val views = RemoteViews(context.packageName, R.layout.widget_layout_2x1)
            views.setTextViewText(R.id.widget_location_2x1, "위치 정보 갱신 중...")
            views.setTextViewText(R.id.widget_uv_num_2x1, "-")
            views.setTextViewText(R.id.widget_level_text_2x1, "자외선 수준: 측정 중...")
            
            val clickIntent = Intent(context, UvWidgetProvider2x1::class.java).apply {
                action = ACTION_REFRESH_WIDGET
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context, id, clickIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_background_2x1, pendingIntent)
            widgetManager.updateAppWidget(id, views)
        }

        ids2x2.forEach { id ->
            val views = RemoteViews(context.packageName, R.layout.widget_layout_2x2)
            views.setTextViewText(R.id.widget_location_2x2, "위치 정보 갱신 중...")
            views.setTextViewText(R.id.widget_uv_num_2x2, "-")
            views.setTextViewText(R.id.widget_level_badge_2x2, "측정 중")
            views.setTextViewText(R.id.widget_time_2x2, "갱신 대기")
            
            val clickIntent = Intent(context, UvWidgetProvider2x2::class.java).apply {
                action = ACTION_REFRESH_WIDGET
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context, id, clickIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.btn_refresh_2x2, pendingIntent)
            widgetManager.updateAppWidget(id, views)
        }

        ids4x2.forEach { id ->
            val views = RemoteViews(context.packageName, R.layout.widget_layout_4x2)
            views.setTextViewText(R.id.widget_location_4x2, "위치 정보 갱신 중...")
            views.setTextViewText(R.id.widget_uv_num_4x2, "-")
            views.setTextViewText(R.id.widget_level_text_4x2, "자외선 수준: 측정 중")
            views.setTextViewText(R.id.widget_time_4x2, "갱신 대기")
            
            val clickIntent = Intent(context, UvWidgetProvider4x2::class.java).apply {
                action = ACTION_REFRESH_WIDGET
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context, id, clickIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_background_4x2, pendingIntent)
            widgetManager.updateAppWidget(id, views)
        }
    }

    // 4. 순수 UI 렌더링 함수
    fun renderAllWidgetsWithData(context: Context, uvData: UvData) {
        val widgetManager = AppWidgetManager.getInstance(context)
        
        val ids2x1 = widgetManager.getAppWidgetIds(ComponentName(context, UvWidgetProvider2x1::class.java))
        val ids2x2 = widgetManager.getAppWidgetIds(ComponentName(context, UvWidgetProvider2x2::class.java))
        val ids4x2 = widgetManager.getAppWidgetIds(ComponentName(context, UvWidgetProvider4x2::class.java))

        ids2x1.forEach { id ->
            val views = RemoteViews(context.packageName, R.layout.widget_layout_2x1)
            views.setTextViewText(R.id.widget_location_2x1, uvData.locationName)
            views.setTextViewText(R.id.widget_uv_num_2x1, uvData.uvIndex.toString())
            views.setTextViewText(R.id.widget_level_text_2x1, "자외선 수준: ${uvData.getLevelText()}")
            
            val clickIntent = Intent(context, UvWidgetProvider2x1::class.java).apply {
                action = ACTION_REFRESH_WIDGET
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context, id, clickIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_background_2x1, pendingIntent)
            widgetManager.updateAppWidget(id, views)
        }

        ids2x2.forEach { id ->
            val views = RemoteViews(context.packageName, R.layout.widget_layout_2x2)
            views.setTextViewText(R.id.widget_location_2x2, uvData.locationName)
            views.setTextViewText(R.id.widget_uv_num_2x2, uvData.uvIndex.toString())
            views.setTextViewText(R.id.widget_level_badge_2x2, uvData.getLevelText())
            views.setTextViewText(R.id.widget_time_2x2, "${uvData.lastUpdated} 갱신됨")
            
            val clickIntent = Intent(context, UvWidgetProvider2x2::class.java).apply {
                action = ACTION_REFRESH_WIDGET
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context, id, clickIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.btn_refresh_2x2, pendingIntent)
            widgetManager.updateAppWidget(id, views)
        }

        ids4x2.forEach { id ->
            val views = RemoteViews(context.packageName, R.layout.widget_layout_4x2)
            views.setTextViewText(R.id.widget_location_4x2, uvData.locationName)
            views.setTextViewText(R.id.widget_uv_num_4x2, uvData.uvIndex.toString())
            views.setTextViewText(R.id.widget_level_text_4x2, "자외선 수준: ${uvData.getLevelText()}")
            views.setTextViewText(R.id.widget_time_4x2, "${uvData.lastUpdated} 갱신됨")

            if (uvData.hourlyForecast.size >= 3) {
                views.setTextViewText(R.id.f1_time, uvData.hourlyForecast[0].time)
                views.setTextViewText(R.id.f1_val, uvData.hourlyForecast[0].uvIndex.toString())
                
                views.setTextViewText(R.id.f2_time, uvData.hourlyForecast[1].time)
                views.setTextViewText(R.id.f2_val, uvData.hourlyForecast[1].uvIndex.toString())

                views.setTextViewText(R.id.f3_time, uvData.hourlyForecast[2].time)
                views.setTextViewText(R.id.f3_val, uvData.hourlyForecast[2].uvIndex.toString())
            }

            val clickIntent = Intent(context, UvWidgetProvider4x2::class.java).apply {
                action = ACTION_REFRESH_WIDGET
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context, id, clickIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_background_4x2, pendingIntent)
            widgetManager.updateAppWidget(id, views)
        }
    }
}
