import java.util.Properties

plugins {
    id("com.android.application")
}

val configuration = Properties().apply {
    val envFile = rootProject.file("../.env.local")
    if (envFile.isFile) envFile.inputStream().use(::load)
}

fun configString(name: String): String {
    val value = providers.environmentVariable(name).orNull
        ?: configuration.getProperty(name)
        ?: error("Chybí $name v prostředí nebo v souboru cvicmevrytme/.env.local.")
    require(value.isNotBlank()) { "Hodnota $name nesmí být prázdná." }
    return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\""
}

android {
    namespace = "cz.bezeckydenik.health"
    compileSdk = 37

    defaultConfig {
        applicationId = "cz.bezeckydenik.health"
        minSdk = 26
        targetSdk = 37
        versionCode = 1
        versionName = "1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        buildConfigField("String", "SUPABASE_URL", configString("NEXT_PUBLIC_SUPABASE_URL"))
        buildConfigField("String", "SUPABASE_KEY", configString("NEXT_PUBLIC_SUPABASE_ANON_KEY"))
    }

    buildFeatures {
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("androidx.activity:activity-ktx:1.12.4")
    implementation("androidx.health.connect:connect-client:1.1.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.10.0")
    androidTestImplementation("androidx.health.connect:connect-testing:1.0.0-alpha04")
    androidTestImplementation("androidx.test.ext:junit:1.3.0")
    androidTestImplementation("androidx.test:runner:1.7.0")
}
