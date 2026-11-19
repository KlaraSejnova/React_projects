package cz.bezeckydenik.health

import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.aggregate.AggregateMetric
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import org.json.JSONArray
import org.json.JSONObject
import java.time.Duration
import java.time.Instant
import java.time.temporal.ChronoUnit

data class SyncResult(val runs: List<JSONObject>, val skipped: Int, val shortRuns: Int)

class HealthSync(private val client: HealthConnectClient) {
    suspend fun readRuns(readHeartRate: Boolean): SyncResult {
        val now = Instant.now()
        val since = now.minus(30, ChronoUnit.DAYS)
        val range = TimeRangeFilter.between(since, now)
        val runs = mutableListOf<JSONObject>()
        var skipped = 0
        var shortRuns = 0
        var pageToken: String? = null
        do {
            val response = client.readRecords(
                ReadRecordsRequest(ExerciseSessionRecord::class, range, pageToken = pageToken)
            )
            for (record in response.records) {
                if (record.exerciseType != ExerciseSessionRecord.EXERCISE_TYPE_RUNNING &&
                    record.exerciseType != ExerciseSessionRecord.EXERCISE_TYPE_RUNNING_TREADMILL) continue
                if (record.startTime.isBefore(since)) continue
                val duration = Duration.between(record.startTime, record.endTime).seconds
                if (duration <= 0 || record.endTime.isAfter(now) || record.metadata.id.isBlank()) {
                    skipped++
                    continue
                }
                val metrics = mutableSetOf<AggregateMetric<*>>(DistanceRecord.DISTANCE_TOTAL)
                if (readHeartRate) {
                    metrics.add(HeartRateRecord.BPM_AVG)
                    metrics.add(HeartRateRecord.BPM_MAX)
                }
                val summary = client.aggregate(
                    AggregateRequest(
                        metrics = metrics,
                        timeRangeFilter = TimeRangeFilter.between(record.startTime, record.endTime),
                        dataOriginFilter = setOf(record.metadata.dataOrigin),
                    )
                )
                val distanceKm = summary[DistanceRecord.DISTANCE_TOTAL]?.inKilometers
                if (distanceKm == null || !distanceKm.isFinite() || distanceKm <= 0) {
                    skipped++
                    continue
                }
                if (distanceKm <= 3.0) {
                    shortRuns++
                    continue
                }
                val run = JSONObject()
                    .put("id", "health-connect:${record.metadata.id}")
                    .put("title", record.title?.takeIf { it.isNotBlank() } ?: "Běh z Health Connect")
                    .put("date", record.startTime.toString())
                    .put("distanceKm", distanceKm)
                    .put("durationSeconds", duration)
                    .put("averagePaceSecondsPerKm", duration / distanceKm)
                    .put("source", "Health Connect")
                    .put("track", JSONArray())
                summary[HeartRateRecord.BPM_AVG]?.let { run.put("averageHeartRate", it) }
                summary[HeartRateRecord.BPM_MAX]?.let { run.put("maxHeartRate", it) }
                runs.add(run)
            }
            pageToken = response.pageToken
        } while (pageToken != null)
        return SyncResult(runs, skipped, shortRuns)
    }
}
