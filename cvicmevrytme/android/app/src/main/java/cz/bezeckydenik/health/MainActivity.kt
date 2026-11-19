package cz.bezeckydenik.health

import android.os.Bundle
import android.text.InputType
import android.view.Gravity
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    private lateinit var email: EditText
    private lateinit var password: EditText
    private lateinit var signIn: Button
    private lateinit var signOut: Button
    private lateinit var sync: Button
    private lateinit var status: TextView
    private var session: Session? = null
    private var busy = false

    private val requiredPermissions = setOf(
        HealthPermission.getReadPermission(ExerciseSessionRecord::class),
        HealthPermission.getReadPermission(DistanceRecord::class),
    )
    private val heartPermission = HealthPermission.getReadPermission(HeartRateRecord::class)
    private val requestedPermissions = requiredPermissions + heartPermission
    private val permissionLauncher = registerForActivityResult(
        PermissionController.createRequestPermissionResultContract()
    ) { granted ->
        if (granted.containsAll(requiredPermissions)) {
            runSynchronization()
        } else {
            showStatus("Pro synchronizaci je potřeba povolit čtení cvičení a vzdálenosti.")
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val content = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(32, 32, 32, 32)
        }
        fun text(value: String, size: Float): TextView = TextView(this).apply {
            text = value
            textSize = size
            setPadding(0, 12, 0, 12)
        }
        content.addView(text("Běžecký deník", 26f))
        content.addView(text(
            "Přihlas se stejným účtem jako ve webovém deníku. Synchronizace se spustí pouze po stisknutí tlačítka.",
            15f,
        ))
        email = EditText(this).apply {
            hint = "E-mail"
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS
            setSingleLine()
        }
        password = EditText(this).apply {
            hint = "Heslo"
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
            setSingleLine()
        }
        signIn = Button(this).apply { text = "Přihlásit se"; setOnClickListener { authenticate() } }
        signOut = Button(this).apply { text = "Odhlásit se"; setOnClickListener { signOut() } }
        sync = Button(this).apply { text = "Synchronizovat běhy"; setOnClickListener { requestSync() } }
        status = text("Zatím nejsi přihlášená.", 14f).apply {
            accessibilityLiveRegion = View.ACCESSIBILITY_LIVE_REGION_POLITE
            gravity = Gravity.START
        }
        listOf(email, password, signIn, signOut, sync, status).forEach(content::addView)
        val scrollView = ScrollView(this).apply { addView(content) }
        ViewCompat.setOnApplyWindowInsetsListener(scrollView) { view, windowInsets ->
            val insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars())
            view.setPadding(insets.left, insets.top, insets.right, insets.bottom)
            windowInsets
        }
        setContentView(scrollView)
        updateControls()
    }

    private fun updateControls() {
        email.isEnabled = !busy && session == null
        password.isEnabled = !busy && session == null
        signIn.isEnabled = !busy && session == null
        signOut.isEnabled = !busy && session != null
        sync.isEnabled = !busy && session != null
    }

    private fun showStatus(message: String) {
        status.text = message
    }

    private fun authenticate() {
        val address = email.text.toString().trim()
        val secret = password.text.toString()
        if (address.isEmpty() || secret.isEmpty()) {
            showStatus("Vyplň e-mail a heslo.")
            return
        }
        perform("Přihlašuji…") {
            session = SupabaseApi.signIn(address, secret)
            password.text.clear()
            showStatus("Přihlášeno. Nyní můžeš povolit Health Connect a synchronizovat běhy.")
        }
    }

    private fun signOut() {
        session = null
        email.text.clear()
        password.text.clear()
        showStatus("Odhlášeno z této aplikace.")
        updateControls()
    }

    private fun requestSync() {
        when (HealthConnectClient.getSdkStatus(this)) {
            HealthConnectClient.SDK_AVAILABLE -> {
                perform("Kontroluji oprávnění…") {
                    val granted = HealthConnectClient.getOrCreate(this).permissionController.getGrantedPermissions()
                    if (granted.containsAll(requiredPermissions)) {
                        synchronize(granted.contains(heartPermission))
                    } else {
                        permissionLauncher.launch(requestedPermissions)
                    }
                }
            }
            HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED ->
                showStatus("Health Connect je potřeba v telefonu nainstalovat nebo aktualizovat.")
            else -> showStatus("Health Connect není na tomto zařízení dostupný.")
        }
    }

    private fun runSynchronization() {
        perform("Načítám běhy…") {
            val granted = HealthConnectClient.getOrCreate(this).permissionController.getGrantedPermissions()
            if (!granted.containsAll(requiredPermissions)) {
                showStatus("Oprávnění pro Health Connect byla odebrána. Zkus synchronizaci znovu.")
                return@perform
            }
            synchronize(granted.contains(heartPermission))
        }
    }

    private suspend fun synchronize(readHeartRate: Boolean) {
        val currentSession = session ?: error("Přihlas se znovu.")
        val result = HealthSync(HealthConnectClient.getOrCreate(this)).readRuns(readHeartRate)
        if (result.runs.isNotEmpty()) SupabaseApi.uploadRuns(currentSession, result.runs)
        val skipped = if (result.skipped > 0) " Vynecháno ${result.skipped} běhů bez vzdálenosti, platné doby nebo identifikátoru." else ""
        val short = if (result.shortRuns > 0) " Vynecháno ${result.shortRuns} běhů o vzdálenosti 3 km nebo méně." else ""
        val heart = if (!readHeartRate) " Tep nebyl povolen." else ""
        showStatus("Synchronizováno ${result.runs.size} běhů za posledních 30 dní.$skipped$short$heart")
    }

    private fun perform(message: String, action: suspend () -> Unit) {
        if (busy) return
        busy = true
        updateControls()
        showStatus(message)
        lifecycleScope.launch {
            try {
                action()
            } catch (error: CancellationException) {
                throw error
            } catch (error: Exception) {
                showStatus("Operace se nezdařila: ${error.message ?: "neznámá chyba"}")
            } finally {
                busy = false
                updateControls()
            }
        }
    }
}
