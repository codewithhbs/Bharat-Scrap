package __PKG__.location

import android.content.Context

object LocationPrefs {
    private const val NAME = "bsf_location_prefs"
    private fun p(c: Context) = c.getSharedPreferences(NAME, Context.MODE_PRIVATE)

    fun save(c: Context, url: String?, token: String?, tracking: Boolean) {
        p(c).edit().apply {
            if (!url.isNullOrBlank()) putString("url", url)
            putString("token", token ?: "")
            putBoolean("tracking", tracking)
        }.apply()
    }
    fun saveToken(c: Context, token: String?) = p(c).edit().putString("token", token ?: "").apply()
    fun setTracking(c: Context, v: Boolean) = p(c).edit().putBoolean("tracking", v).apply()
    fun isTracking(c: Context) = p(c).getBoolean("tracking", false)
    fun url(c: Context) = p(c).getString("url", "") ?: ""
    fun token(c: Context) = p(c).getString("token", "") ?: ""
}
