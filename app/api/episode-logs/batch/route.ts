import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { getSeriesEpisodes } from '@/lib/tmdb'
import { ensureSeries, upsertEpisodes } from '@/lib/cache'

// Marks as watched every episode up to (and including) the given one.
// Seasons not yet cached locally are fetched from TMDB first.
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { seriesId, seasonNumber, episodeNumber } = await request.json()

    if (!seriesId || !seasonNumber || !episodeNumber) {
      return NextResponse.json(
        { error: 'seriesId, seasonNumber y episodeNumber son requeridos' },
        { status: 400 }
      )
    }

    await ensureSeries(seriesId)

    // Cache any earlier season that is missing or incomplete locally
    for (let season = 1; season <= seasonNumber; season++) {
      const cached = await query(
        `SELECT COUNT(*) as count FROM episodes
         WHERE series_id = $1 AND season_number = $2`,
        [seriesId, season]
      )
      if (parseInt(cached.rows[0].count) === 0) {
        try {
          const data = await getSeriesEpisodes(seriesId, season)
          await upsertEpisodes(seriesId, data.episodes || [])
        } catch (err) {
          console.error(`Error caching season ${season}:`, err)
        }
      }
    }

    const result = await query(
      `INSERT INTO episode_logs (user_id, episode_id, is_watched, watched_at)
       SELECT $1, e.id, true, NOW()
       FROM episodes e
       WHERE e.series_id = $2
         AND (e.season_number < $3
              OR (e.season_number = $3 AND e.episode_number <= $4))
       ON CONFLICT (user_id, episode_id) DO UPDATE SET
         is_watched = true,
         watched_at = COALESCE(episode_logs.watched_at, NOW()),
         updated_at = NOW()
       RETURNING episode_id`,
      [decoded.userId, seriesId, seasonNumber, episodeNumber]
    )

    await query(
      `UPDATE user_series SET last_watched_at = NOW()
       WHERE user_id = $1 AND series_id = $2`,
      [decoded.userId, seriesId]
    )

    return NextResponse.json(
      { message: 'Episodios marcados', count: result.rowCount },
      { status: 200 }
    )
  } catch (error) {
    console.error('Batch episode log error:', error)
    return NextResponse.json(
      { error: 'Error al marcar episodios' },
      { status: 500 }
    )
  }
}
