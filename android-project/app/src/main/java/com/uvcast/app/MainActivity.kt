package com.uvcast.app

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
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
        } else {
            Toast.makeText(this, "실시간 자외선 측정을 위해 위치 권한 수락이 필요합니다.", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initial fetch with default coordinates
        fetchLocationAndUv()

        setContent {
            UvCastTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF09090B) // zinc-950 dark theme matching web
                ) {
                    MainScreen()
                }
            }
        }
    }

    private fun fetchLocationAndUv() {
        val fineGranted = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        val coarseGranted = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED

        if (!fineGranted && !coarseGranted) {
            requestPermissionLauncher.launch(
                arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
            )
            return
        }

        isLoadingState.value = true
        locationNameState.value = "GPS 좌표 획득 중..."

        val fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        
        try {
            fusedLocationClient.getCurrentLocation(Priority.PRIORITY_BALANCED_POWER_ACCURACY, null)
                .addOnSuccessListener { loc ->
                    val lat = loc?.latitude ?: 37.5665
                    val lgt = loc?.longitude ?: 126.9780
                    
                    CoroutineScope(Dispatchers.IO).launch {
                        val uvData = UvWeatherService.fetchUvData(this@MainActivity, lat, lgt)
                        withContext(Dispatchers.Main) {
                            uvIndexState.value = uvData.uvIndex
                            locationNameState.value = uvData.locationName
                            lastUpdatedState.value = uvData.lastUpdated
                            isLoadingState.value = false
                            
                            // Instantly force update active Widgets
                            UvWidgetHelper.updateAllWidgets(this@MainActivity)
                        }
                    }
                }
                .addOnFailureListener {
                    // Fallback 서울
                    queryUvForecast(37.5665, 126.9780, "서울 특별시")
                }
        } catch (e: SecurityException) {
            queryUvForecast(37.5665, 126.9780, "서울 특별시 (보안 우회)")
        }
    }

    private fun queryUvForecast(lat: Double, lgt: Double, fallbackCity: String) {
        CoroutineScope(Dispatchers.IO).launch {
            val uvData = UvWeatherService.fetchUvData(this@MainActivity, lat, lgt)
            withContext(Dispatchers.Main) {
                uvIndexState.value = uvData.uvIndex
                locationNameState.value = if (uvData.locationName.startsWith("위도 ")) fallbackCity else uvData.locationName
                lastUpdatedState.value = uvData.lastUpdated
                isLoadingState.value = false
                UvWidgetHelper.updateAllWidgets(this@MainActivity)
            }
        }
    }

    @Composable
    fun MainScreen() {
        val scrollState = rememberScrollState()
        
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header Card
            Text(
                text = "UVCast",
                fontSize = 28.sp,
                color = Color(0xFFF97316), // theme orange
                fontWeight = FontWeight.ExtraBold,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 10.dp)
            )
            
            Text(
                text = "안드로이드 네이티브 자외선 위젯 관제탑",
                fontSize = 13.sp,
                color = Color(0xFFA1A1AA),
                textAlign = TextAlign.Center
            )

            // Current UV Card
            Card(
                modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF18181B))
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "현재 측정 위치",
                        fontSize = 12.sp,
                        color = Color(0xFFA1A1AA)
                    )
                    
                    Text(
                        text = locationNameState.value,
                        fontSize = 16.sp,
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    val rawUv = uvIndexState.value ?: 0
                    Text(
                        text = "$rawUv",
                        fontSize = 72.sp,
                        color = Color(0xFFF97316),
                        fontWeight = FontWeight.Black
                    )

                    Text(
                        text = "자외선 강점 등급: ${getUvOpinion(rawUv)}",
                        fontSize = 15.sp,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )

                    Text(
                        text = "최근 수집 시점: ${lastUpdatedState.value}",
                        fontSize = 11.sp,
                        color = Color(0xFF71717A)
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Button(
                        onClick = { fetchLocationAndUv() },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF97316)),
                        shape = RoundedCornerShape(12.dp),
                        enabled = !isLoadingState.value,
                        modifier = Modifier.fillMaxWidth().height(48.dp)
                    ) {
                        Text(
                            text = if (isLoadingState.value) "실시간 관측 갱신 중..." else "GPS 위치 수동 측정 및 위젯 동기화",
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            // Widget Guide Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF18181B))
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "📱 홈 위젯 등록 순서 가이드",
                        fontSize = 14.sp,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "1. 홈화면 빈 공간을 1초간 누른다\n" +
                               "2. 아래 메뉴에서 [위젯] 선택 후 'UVCast'를 검색한다\n" +
                               "3. 마음에 드는 위젯 타입(2x1, 2x2, 4x2)을 끌어서 배치한 후 홈 위젯을 탭해 동기화합니다.",
                        fontSize = 12.sp,
                        color = Color(0xFFA1A1AA),
                        lineHeight = 18.sp
                    )
                }
            }
        }
    }

    private fun getUvOpinion(uv: Int): String {
        return when {
            uv <= 2 -> "안심 (야외활동 안심 구역)"
            uv <= 5 -> "보통 (자외선 선크림 도포 권장)"
            uv <= 7 -> "주의 (장시간 노출 삼가)"
            uv <= 10 -> "위험 (양산 및 모자 지참 필수)"
            else -> "치명 (외출을 즉시 보류하십시오)"
        }
    }
}

@Composable
fun UvCastTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = Color(0xFFF97316),
            background = Color(0xFF09090B),
            surface = Color(0xFF18181B)
        ),
        content = content
    )
}
