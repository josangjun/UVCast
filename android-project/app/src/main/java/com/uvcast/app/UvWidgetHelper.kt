package com.uvcast.app

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
        
        // Update 2x1 widgets
        val ids2x1 = widgetManager.getAppWidgetIds(ComponentName(context, UvWidgetProvider2x1::class.java))
        // Update 2x2 widgets
        val ids2x2 = widgetManager.getAppWidgetIds(ComponentName(context, UvWidgetProvider2x2::class.java))
        // Update 4x2 widgets
        val ids4x2 = widgetManager.getAppWidgetIds(ComponentName(context, UvWidgetProvider4x2::class.java))

        CoroutineScope(Dispatchers.IO).launch {
            // Retrieve coordinates (Seoul standard center, 37.56, 126.97)
            val lat = 37.5665
            val lgt = 126.9780
            val uvData = UvWeatherService.fetchUvData(context, lat, lgt)

            // Helper to render RemoteViews
            ids2x1.forEach { id ->
                val views = RemoteViews(context.packageName, R.layout.widget_layout_2x1)
                views.setTextViewText(R.id.widget_location_2x1, uvData.locationName)
                views.setTextViewText(R.id.widget_uv_num_2x1, uvData.uvIndex.toString())
                views.setTextViewText(R.id.widget_level_text_2x1, "자외선 수준: ${uvData.getLevelText()}")
                
                // Add Click-to-Refresh mapping
                val clickIntent = Intent(context, UvWidgetProvider2x1::class.java).apply {
                    action = ACTION_REFRESH_WIDGET
                }
                val pendingIntent = PendingIntent.getBroadcast(
                    context, id, clickIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(R.id.btn_refresh_2x1, pendingIntent)
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

                // Update forecast text columns
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
}
