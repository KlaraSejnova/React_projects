package cz.bezeckydenik.health

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class Session(val accessToken: String, val userId: String)

object SupabaseApi {
    suspend fun signIn(email: String, password: String): Session = withContext(Dispatchers.IO) {
        val body = JSONObject().put("email", email).put("password", password)
        val result = JSONObject(request("/auth/v1/token?grant_type=password", body.toString()))
        Session(result.getString("access_token"), result.getJSONObject("user").getString("id"))
    }

    suspend fun uploadRuns(session: Session, runs: List<JSONObject>) = withContext(Dispatchers.IO) {
        val rows = JSONArray()
        runs.forEach { run ->
            rows.put(JSONObject().put("user_id", session.userId).put("id", run.getString("id")).put("run", run))
        }
        request("/rest/v1/runs?on_conflict=user_id,id", rows.toString(), session.accessToken)
        Unit
    }

    private fun request(path: String, body: String, token: String? = null): String {
        require(BuildConfig.SUPABASE_URL.startsWith("https://")) { "Supabase URL musí používat HTTPS." }
        val connection = URL(BuildConfig.SUPABASE_URL.trimEnd('/') + path).openConnection() as HttpURLConnection
        try {
            connection.requestMethod = "POST"
            connection.connectTimeout = 15_000
            connection.readTimeout = 30_000
            connection.doOutput = true
            connection.setRequestProperty("Content-Type", "application/json")
            connection.setRequestProperty("apikey", BuildConfig.SUPABASE_KEY)
            if (token != null) {
                connection.setRequestProperty("Authorization", "Bearer $token")
                connection.setRequestProperty("Prefer", "resolution=merge-duplicates,return=minimal")
            }
            connection.outputStream.use { it.write(body.toByteArray(Charsets.UTF_8)) }
            val status = connection.responseCode
            if (status !in 200..299) {
                val message = when (status) {
                    400, 401 -> "Ověření nebo požadavek byl odmítnut (HTTP $status). Zkontroluj přihlášení."
                    403 -> "Přístup byl odmítnut (HTTP 403)."
                    else -> "Server Supabase odpověděl chybou HTTP $status."
                }
                throw IllegalStateException(message)
            }
            return connection.inputStream.bufferedReader().use { it.readText() }
        } finally {
            connection.disconnect()
        }
    }
}
