package cz.bezeckydenik.health

import android.app.Activity
import android.os.Bundle
import android.widget.TextView

class PermissionsRationaleActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(TextView(this).apply {
            setPadding(32, 32, 32, 32)
            textSize = 16f
            text = """
                Běžecký deník čte cvičení, vzdálenost a volitelně tep z Health Connectu pouze po tvém souhlasu a stisknutí tlačítka synchronizace.

                Souhrny běhů za posledních 30 dní odesílá zabezpečeným připojením do tvého účtu Supabase, aby se zobrazily ve webovém deníku. GPS trasy aplikace nečte. Žádné zdravotní údaje neprodáváme ani nepoužíváme pro reklamu.

                Oprávnění můžeš kdykoli odebrat v nastavení Health Connectu. Odebrání oprávnění nesmaže již synchronizované běhy; ty můžeš odstranit ve webovém deníku.
            """.trimIndent()
        })
    }
}
