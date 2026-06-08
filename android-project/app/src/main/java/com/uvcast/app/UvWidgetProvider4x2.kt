package com.uvcast.app

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent

class UvWidgetProvider4x2 : android.appwidget.AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        super.onUpdate(context, appWidgetManager, appWidgetIds)
        UvWidgetHelper.updateAllWidgets(context)
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == UvWidgetHelper.ACTION_REFRESH_WIDGET) {
            UvWidgetHelper.refreshWidgetWithGps(context)
        }
    }
}
