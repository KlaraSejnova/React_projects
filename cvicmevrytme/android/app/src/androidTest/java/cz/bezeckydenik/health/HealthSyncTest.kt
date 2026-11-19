package cz.bezeckydenik.health

import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.metadata.Metadata
import androidx.health.connect.client.testing.AggregationResult
import androidx.health.connect.client.testing.FakeHealthConnectClient
import androidx.health.connect.client.testing.stubs.stub
import androidx.health.connect.client.units.Length
import androidx.test.ext.junit.runners.AndroidJUnit4
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import java.time.Instant
import java.time.temporal.ChronoUnit

@RunWith(AndroidJUnit4::class)
class HealthSyncTest {
    private fun exercise(type: Int, daysAgo: Long = 1): ExerciseSessionRecord {
        val start = Instant.now().minus(daysAgo, ChronoUnit.DAYS)
        return ExerciseSessionRecord(
            startTime = start,
            endTime = start.plusSeconds(1800),
            startZoneOffset = null,
            endZoneOffset = null,
            metadata = Metadata.manualEntry(),
            exerciseType = type,
            title = "Testovací běh",
        )
    }

    @Test
    fun synchronizesRunningSummaryWithoutDuplicatesInRepeatedReads() = runBlocking {
        val client = FakeHealthConnectClient()
        client.insertRecords(listOf(exercise(ExerciseSessionRecord.EXERCISE_TYPE_RUNNING)))
        client.overrides.aggregate = stub(AggregationResult(metrics = buildMap {
            put(DistanceRecord.DISTANCE_TOTAL, Length.kilometers(5.0))
            put(HeartRateRecord.BPM_AVG, 145L)
            put(HeartRateRecord.BPM_MAX, 170L)
        }))

        val first = HealthSync(client).readRuns(true)
        val second = HealthSync(client).readRuns(true)
        assertEquals(1, first.runs.size)
        assertEquals(0, first.skipped)
        val run = first.runs.single()
        assertEquals(run.getString("id"), second.runs.single().getString("id"))
        assertEquals("Health Connect", run.getString("source"))
        assertEquals(5.0, run.getDouble("distanceKm"), 0.0001)
        assertEquals(1800, run.getInt("durationSeconds"))
        assertEquals(360.0, run.getDouble("averagePaceSecondsPerKm"), 0.0001)
        assertEquals(145, run.getInt("averageHeartRate"))
        assertEquals(170, run.getInt("maxHeartRate"))
        assertEquals(0, run.getJSONArray("track").length())
    }

    @Test
    fun ignoresOtherSportsAndOldRecordsAndAllowsMissingHeartRate() = runBlocking {
        val client = FakeHealthConnectClient()
        client.insertRecords(listOf(
            exercise(ExerciseSessionRecord.EXERCISE_TYPE_RUNNING_TREADMILL),
            exercise(ExerciseSessionRecord.EXERCISE_TYPE_WALKING),
            exercise(ExerciseSessionRecord.EXERCISE_TYPE_RUNNING, daysAgo = 31),
        ))
        client.overrides.aggregate = stub(AggregationResult(metrics = buildMap {
            put(DistanceRecord.DISTANCE_TOTAL, Length.kilometers(3.01))
        }))

        val result = HealthSync(client).readRuns(false)
        assertEquals(1, result.runs.size)
        assertFalse(result.runs.single().has("averageHeartRate"))
        assertEquals(0, result.skipped)
    }

    @Test
    fun reportsRunsWithoutDistance() = runBlocking {
        val client = FakeHealthConnectClient()
        client.insertRecords(listOf(exercise(ExerciseSessionRecord.EXERCISE_TYPE_RUNNING)))
        client.overrides.aggregate = stub(AggregationResult())

        val result = HealthSync(client).readRuns(false)
        assertTrue(result.runs.isEmpty())
        assertEquals(1, result.skipped)
    }

    @Test
    fun skipsRunsAtOrBelowThreeKilometers() = runBlocking {
        for (distance in listOf(2.999, 3.0, 3.001)) {
            val client = FakeHealthConnectClient()
            client.insertRecords(listOf(exercise(ExerciseSessionRecord.EXERCISE_TYPE_RUNNING)))
            client.overrides.aggregate = stub(AggregationResult(metrics = buildMap {
                put(DistanceRecord.DISTANCE_TOTAL, Length.kilometers(distance))
            }))
            val result = HealthSync(client).readRuns(false)
            assertEquals(if (distance > 3.0) 1 else 0, result.runs.size)
            assertEquals(if (distance <= 3.0) 1 else 0, result.shortRuns)
            assertEquals(0, result.skipped)
        }
    }

    @Test
    fun readsAllPagesEvenWhenMostActivitiesAreNotRuns() = runBlocking {
        val client = FakeHealthConnectClient()
        val walks = List(1001) { exercise(ExerciseSessionRecord.EXERCISE_TYPE_WALKING, daysAgo = 2) }
        client.insertRecords(walks + exercise(ExerciseSessionRecord.EXERCISE_TYPE_RUNNING))
        client.overrides.aggregate = stub(AggregationResult(metrics = buildMap {
            put(DistanceRecord.DISTANCE_TOTAL, Length.kilometers(5.0))
        }))

        val result = HealthSync(client).readRuns(false)
        assertEquals(1, result.runs.size)
        assertEquals(0, result.skipped)
    }
}
