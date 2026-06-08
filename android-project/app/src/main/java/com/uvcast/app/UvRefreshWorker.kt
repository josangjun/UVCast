package com.uvcast.app

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters

class UvRefreshWorker(
    context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        return try {
            val (lat, lgt) = UvLocationStore.load(applicationContext) ?: (37.5665 to 126.9780)
            val uvData = UvWeatherService.fetchUvData(applicationContext, lat, lgt)
            
            // 캐시 저장
            UvLocationStore.saveUvData(applicationContext, uvData)
            
            // 모든 위젯 갱신
            UvWidgetHelper.renderAllWidgetsWithData(applicationContext, uvData)
            
            Result.success()
        } catch (e: Exception) {
            e.printStackTrace()
            Result.retry()
        }
    }
}
