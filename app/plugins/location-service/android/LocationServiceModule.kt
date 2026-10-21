package __PKG__.location

import android.content.Intent
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class LocationServiceModule(private val ctx: ReactApplicationContext) : ReactContextBaseJavaModule(ctx) {

    override fun getName() = "LocationService"

    @ReactMethod
    fun startTracking(apiUrl: String?, token: String?) {
        LocationPrefs.save(ctx, apiUrl, token, true)
        val i = Intent(ctx, LocationForegroundService::class.java).setAction(LocationForegroundService.ACTION_START)
        ContextCompat.startForegroundService(ctx, i)
    }

    @ReactMethod
    fun stopTracking() {
        LocationPrefs.setTracking(ctx, false)
        ctx.stopService(Intent(ctx, LocationForegroundService::class.java))
    }

    @ReactMethod
    fun updateConfig(apiUrl: String?, token: String?) {
        LocationPrefs.save(ctx, apiUrl, token, LocationPrefs.isTracking(ctx))
    }

    @ReactMethod
    fun updateToken(token: String?) {
        LocationPrefs.saveToken(ctx, token)
    }

    @ReactMethod
    fun isTracking(promise: Promise) {
        promise.resolve(LocationForegroundService.running && LocationPrefs.isTracking(ctx))
    }

    @ReactMethod fun addListener(eventName: String?) {}
    @ReactMethod fun removeListeners(count: Double) {}
}
