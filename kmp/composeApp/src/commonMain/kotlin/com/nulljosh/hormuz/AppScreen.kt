package com.nulljosh.hormuz

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import kotlin.math.abs

@Composable
fun HormuzTheme(content: @Composable () -> Unit) =
    MaterialTheme(colorScheme = darkColorScheme(), content = content)

@Composable
fun AppScreen(client: HormuzClient = HormuzClient()) {
    var status by remember { mutableStateOf<Status?>(null) }
    var oil by remember { mutableStateOf<Oil?>(null) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        runCatching {
            status = client.status()
            oil = client.oil("5d")
        }.onFailure { error = it.message ?: "failed to load" }
        loading = false
    }

    Surface {
        Column(Modifier.fillMaxSize().padding(24.dp)) {
            when {
                loading -> CircularProgressIndicator(Modifier.padding(top = 24.dp))
                error != null -> Text(error!!, modifier = Modifier.padding(top = 16.dp))
                else -> {
                    val o = oil
                    val call = o?.let { data ->
                        val closes = data.closes.filterNotNull()
                        val pct = ((closes.last() - closes.first()) / closes.first()) * 100
                        Triple(if (pct >= 0) "LONG" else "SHORT", pct, abs(pct))
                    }
                    Text(
                        call?.let { "${it.first}" } ?: "—",
                        style = MaterialTheme.typography.displayMedium,
                    )
                    call?.let {
                        Text(
                            "${if (it.second >= 0) "Up" else "Down"} ${it.third.let { p -> "%.1f".format(p) }}% over 5d",
                            modifier = Modifier.padding(top = 4.dp, bottom = 16.dp),
                        )
                    }
                    o?.let {
                        Text(
                            "WTI Crude $${"%.2f".format(it.price)}",
                            style = MaterialTheme.typography.headlineSmall,
                        )
                    }
                    status?.let {
                        Text(
                            "Strait of Hormuz: ${if (it.open) "Open" else "Closed"}",
                            modifier = Modifier.padding(top = 16.dp),
                        )
                        Text(it.note, modifier = Modifier.padding(top = 4.dp))
                    }
                }
            }
        }
    }
}
