package com.uvcast.app

data class UvData(
    val uvIndex: Int,
    val locationName: String,
    val latitude: Double,
    val longitude: Double,
    val lastUpdated: String,
    val hourlyForecast: List<HourlyForecast>
) {
    fun getLevelText(): String {
        return when {
            uvIndex <= 2 -> "낮음"
            uvIndex <= 5 -> "보통"
            uvIndex <= 7 -> "높음"
            uvIndex <= 10 -> "매우높음"
            else -> "위험"
        }
    }

    fun getHexColor(): String {
        return when {
            uvIndex <= 2 -> "#10B981" // Emerald
            uvIndex <= 5 -> "#FABF2C" // Amber
            uvIndex <= 7 -> "#FFF97316" // Orange
            uvIndex <= 10 -> "#EF4444" // Red
            else -> "A855F7" // Purple
        }
    }
}

data class HourlyForecast(
    val time: String,
    val uvIndex: Int
)
