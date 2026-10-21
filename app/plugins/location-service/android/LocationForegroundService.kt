package __PKG__.location

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.location.Location
import android.os.Build
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import java.util.concurrent.Executors

class LocationForegroundService : Service() {

    companion object {
        const val TAG = "BSFLocation"
        const val ACTION_START = "BSF_LOCATION_START"
        const val CHANNEL_ID = "bsf_location_tracking"
        const val NOTIF_ID = 47021
        const val INTERVAL_MS = 10_000L
        const val MIN_INTERVAL_MS = 5_000L
        @Volatile var running = false
    }

    private lateinit var fused: FusedLocationProviderClient
    private val net = Executors.newSingleThreadExecutor()
    private var wakeLock: PowerManager.WakeLock? = null
    private var updatesOn = false

    private val callback = object : LocationCallback() {
        override fun onLocationResult(result: LocationResult) {
            result.lastLocation?.let { send(it) }
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        fused = LocationServices.getFusedLocationProviderClient(this)
        createChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // intent == null -> system restarted us (START_STICKY)
        if (!LocationPrefs.isTracking(this)) {
            stopSelf()
            return START_NOT_STICKY
        }
        if (!hasLocationPermission()) {
            Log.w(TAG, "Location permission missing, stopping")
            LocationPrefs.setTracking(this, false)
            stopSelf()
            return START_NOT_STICKY
        }
        try {
            val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION else 0
            ServiceCompat.startForeground(this, NOTIF_ID, buildNotification("Live location sharing is on"), type)
        } catch (e: Exception) {
            Log.e(TAG, "startForeground failed", e)
            stopSelf()
            return START_NOT_STICKY
        }
        running = true
        acquireWakeLock()
        startUpdates()
        return START_STICKY
    }

    private fun hasLocationPermission(): Boolean {
        val fine = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
        val coarse = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION)
        return fine == PackageManager.PERMISSION_GRANTED || coarse == PackageManager.PERMISSION_GRANTED
    }

    @Suppress("MissingPermission")
    private fun startUpdates() {
        if (updatesOn) return
        val req = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, INTERVAL_MS)
            .setMinUpdateIntervalMillis(MIN_INTERVAL_MS)
            .setWaitForAccurateLocation(false)
            .build()
        try {
            fused.requestLocationUpdates(req, callback, Looper.getMainLooper())
            updatesOn = true
            fused.lastLocation.addOnSuccessListener { it?.let { l -> send(l) } }
        } catch (e: SecurityException) {
            Log.e(TAG, "No permission", e)
            stopSelf()
        }
    }

    private fun send(loc: Location) {
        val url = LocationPrefs.url(this)
        val token = LocationPrefs.token(this)
        val time = SimpleDateFormat("hh:mm:ss a", Locale.getDefault()).format(Date())
        updateNotification("Last update: $time")
        if (url.isBlank()) return
        net.execute {
            var conn: HttpURLConnection? = null
            try {
                val iso = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
                    timeZone = TimeZone.getTimeZone("UTC")
                }.format(Date(loc.time))
                val body = JSONObject().apply {
                    put("latitude", loc.latitude)
                    put("longitude", loc.longitude)
                    put("timestamp", iso)
                    put("accuracy", loc.accuracy.toDouble())
                    put("speed", loc.speed.toDouble())
                    put("bearing", loc.bearing.toDouble())
                }.toString()
                conn = (URL(url).openConnection() as HttpURLConnection).apply {
                    requestMethod = "POST"
                    connectTimeout = 15000
                    readTimeout = 15000
                    doOutput = true
                    setRequestProperty("Content-Type", "application/json")
                    setRequestProperty("Accept", "application/json")
                    if (token.isNotBlank()) setRequestProperty("Authorization", "Bearer $token")
                }
                conn.outputStream.use { it.write(body.toByteArray(Charsets.UTF_8)) }
                val code = conn.responseCode
                Log.d(TAG, "POST $code ${loc.latitude},${loc.longitude}")
            } catch (e: Exception) {
                Log.e(TAG, "POST failed: ${e.message}")
            } finally {
                conn?.disconnect()
            }
        }
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ch = NotificationChannel(CHANNEL_ID, "Location Tracking", NotificationManager.IMPORTANCE_LOW).apply {
                description = "Shows while your live location is shared"
                setShowBadge(false)
            }
            getSystemService(NotificationManager::class.java).createNotificationChannel(ch)
        }
    }

    private fun smallIcon(): Int {
        val id = resources.getIdentifier("notification_icon", "drawable", packageName)
        return if (id != 0) id else applicationInfo.icon
    }

    private fun buildNotification(text: String): Notification {
        val launch = packageManager.getLaunchIntentForPackage(packageName) ?: Intent()
        val pi = PendingIntent.getActivity(
            this, 0, launch,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Bharat Scrap Facilities")
            .setContentText(text)
            .setSmallIcon(smallIcon())
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setContentIntent(pi)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
            .build()
    }

    private fun updateNotification(text: String) {
        try {
            getSystemService(NotificationManager::class.java).notify(NOTIF_ID, buildNotification(text))
        } catch (_: Exception) {}
    }

    private fun acquireWakeLock() {
        if (wakeLock?.isHeld == true) return
        val pm = getSystemService(POWER_SERVICE) as PowerManager
        wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "BSF::LocationWakeLock").apply {
            setReferenceCounted(false)
            acquire()
        }
    }

    override fun onTaskRemoved(rootIntent: Intent?) {
        // App swipe se band hui -> service chalti rahe (foreground service)
        super.onTaskRemoved(rootIntent)
    }

    override fun onDestroy() {
        running = false
        try { fused.removeLocationUpdates(callback) } catch (_: Exception) {}
        updatesOn = false
        try { wakeLock?.let { if (it.isHeld) it.release() } } catch (_: Exception) {}
        net.shutdown()
        super.onDestroy()
    }
}
