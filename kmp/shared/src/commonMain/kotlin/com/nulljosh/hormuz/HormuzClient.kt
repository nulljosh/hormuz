package com.nulljosh.hormuz

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.get
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class Status(
    val strait: String,
    val open: Boolean,
    val note: String,
)

@Serializable
data class Oil(
    val symbol: String,
    val timestamps: List<Long>,
    val closes: List<Double?>,
    val price: Double,
    val prevClose: Double,
)

// Reads the same public endpoints the web app does. No key needed, the
// Worker holds the Yahoo Finance proxy + cache.
class HormuzClient(private val baseUrl: String = "https://hormuz.heyitsmejosh.com") {
    private val http = HttpClient {
        install(ContentNegotiation) { json(Json { ignoreUnknownKeys = true }) }
    }

    suspend fun status(): Status = http.get("$baseUrl/api/status").body()
    suspend fun oil(range: String = "5d"): Oil = http.get("$baseUrl/api/oil?range=$range").body()
}
