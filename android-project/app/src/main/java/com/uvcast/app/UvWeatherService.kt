package com.uvcast.app

import android.util.Log
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object UvWeatherService {
    private const val TAG = "UvWeatherService"

    // Fetch UV Index from free Open-Meteo coordinate weather API
    fun fetchUvData(lat: Double, lgt: Double): UvData {
        var connection: HttpURLConnection? = null
        try {
            val urlString = "https://api.open-meteo.com/v1/forecast?latitude=$lat&longitude=$lgt&hourly=uv_index&daily=uv_index_max&timezone=auto"
            val url = URL(urlString)
            connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "GET"
            connection.connectTimeout = 8000
            connection.readTimeout = 8000

            val responseCode = connection.responseCode
            if (responseCode == HttpURLConnection.HTTP_OK) {
                val reader = BufferedReader(InputStreamReader(connection.inputStream))
                val response = StringBuilder()
                var line: String?
                while (reader.readLine().also { line = it } != null) {
                    response.append(line)
                }
                reader.close()

                val json = JSONObject(response.toString())
                val hourly = json.getJSONObject("hourly")
                val hourlyUvArray = hourly.getJSONArray("uv_index")
                
                // Find current hour UV index
                val currentHour = java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY)
                val currentUv = if (currentHour < hourlyUvArray.length()) {
                    hourlyUvArray.getDouble(currentHour).toInt()
                } else {
                    4
                }

                // Parse standard forecasting hours (12시, 15시, 18시)
                val hourlyForecast = mutableListOf<HourlyForecast>()
                listOf(12, 15, 18).forEach { hour ->
                    val uv = if (hour < hourlyUvArray.length()) {
                        hourlyUvArray.getDouble(hour).toInt()
                    } else {
                        0
                    }
                    hourlyForecast.add(HourlyForecast("${hour}시", uv))
                }

                val df = SimpleDateFormat("HH:mm", Locale.KOREA)
                val lastUpdatedTime = df.format(Date())

                // Clean-up coordinates to string location for indicator
                val rawLocationName = String.format(Locale.US, "위도: %.2f 경도: %.2f", lat, lgt)

                return UvData(
                    uvIndex = currentUv,
                    locationName = rawLocationName,
                    latitude = lat,
                    longitude = lgt,
                    lastUpdated = lastUpdatedTime,
                    hourlyForecast = hourlyForecast
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Network task failed, falling back to cached simulation data", e)
        } finally {
            connection?.disconnect()
        }

        // Return a realistic mock-seed forecast if offline/timeout
        val df = SimpleDateFormat("HH:mm", Locale.KOREA)
        val currentHour = java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY)
        val mockUv = when {
            currentHour in 9..11 -> 3
            currentHour in 12..15 -> 6
            currentHour in 16..17 -> 2
            else -> 0
        }

        return UvData(
            uvIndex = mockUv,
            locationName = "광화문 광장 (시뮬레이션)",
            latitude = lat,
            longitude = lgt,
            lastUpdated = df.format(Date()),
            hourlyForecast = listOf(
                HourlyForecast("12시", 6),
                HourlyForecast("15시", 4),
                HourlyForecast("18시", 1)
            )
        )
    }
}
