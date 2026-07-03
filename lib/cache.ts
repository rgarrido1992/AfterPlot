import { query } from '@/lib/db'
import { getSeries, TMDBEpisode } from '@/lib/tmdb'

const SYNC_MAX_AGE_HOURS = 24

export async function upsertSeries(tmdb: any) {
  await query(
    `INSERT INTO series (id, title, description, poster_path, backdrop_path, first_air_date, last_air_date, status, vote_average, total_seasons, genres, last_synced_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
     ON CONFLICT (id) DO UPDATE SET
       title = EXCLUDED.title,
       description = EXCLUDED.description,
       poster_path = EXCLUDED.poster_path,
       backdrop_path = EXCLUDED.backdrop_path,
       first_air_date = EXCLUDED.first_air_date,
       last_air_date = EXCLUDED.last_air_date,
       status = EXCLUDED.status,
       vote_average = EXCLUDED.vote_average,
       total_seasons = EXCLUDED.total_seasons,
       genres = EXCLUDED.genres,
       last_synced_at = NOW()`,
    [
      tmdb.id,
      tmdb.name,
      tmdb.overview || null,
      tmdb.poster_path || null,
      tmdb.backdrop_path || null,
      tmdb.first_air_date || null,
      tmdb.last_air_date || null,
      tmdb.status || null,
      tmdb.vote_average != null ? Math.round(tmdb.vote_average * 10) / 10 : null,
      tmdb.number_of_seasons || null,
      JSON.stringify(tmdb.genres || []),
    ]
  )
}

// Guarantees the series exists in the local cache (FK target for
// user_series and episodes). Fetches from TMDB only when missing or stale.
export async function ensureSeries(seriesId: number) {
  const existing = await query(
    `SELECT id, last_synced_at FROM series WHERE id = $1`,
    [seriesId]
  )

  const isStale =
    existing.rows.length > 0 &&
    (!existing.rows[0].last_synced_at ||
      Date.now() - new Date(existing.rows[0].last_synced_at).getTime() >
        SYNC_MAX_AGE_HOURS * 3600 * 1000)

  if (existing.rows.length === 0 || isStale) {
    const tmdb = await getSeries(seriesId)
    await upsertSeries(tmdb)
    return tmdb
  }

  return null
}

export async function upsertEpisodes(seriesId: number, episodes: TMDBEpisode[]) {
  for (const ep of episodes) {
    await query(
      `INSERT INTO episodes (id, series_id, season_number, episode_number, title, description, air_date, runtime, still_path, vote_average)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         air_date = EXCLUDED.air_date,
         runtime = EXCLUDED.runtime,
         still_path = EXCLUDED.still_path,
         vote_average = EXCLUDED.vote_average`,
      [
        ep.id,
        seriesId,
        ep.season_number,
        ep.episode_number,
        ep.name || null,
        ep.overview || null,
        ep.air_date || null,
        ep.runtime || null,
        ep.still_path || null,
        ep.vote_average != null ? Math.round(ep.vote_average * 10) / 10 : null,
      ]
    )
  }
}
