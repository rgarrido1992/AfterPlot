import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const userId = decoded.userId

    // Total episodes watched
    const episodesResult = await query(
      `SELECT COUNT(*) as count FROM episode_logs
       WHERE user_id = $1 AND is_watched = true`,
      [userId]
    )
    const totalEpisodes = parseInt(episodesResult.rows[0].count)

    // Total time watched (sum of episode runtimes)
    const timeResult = await query(
      `SELECT COALESCE(SUM(e.runtime), 0) as total_minutes
       FROM episode_logs el
       JOIN episodes e ON el.episode_id = e.id
       WHERE el.user_id = $1 AND el.is_watched = true`,
      [userId]
    )
    const totalMinutes = parseInt(timeResult.rows[0].total_minutes)
    const totalHours = Math.floor(totalMinutes / 60)

    // Total series added
    const seriesResult = await query(
      `SELECT COUNT(*) as count FROM user_series
       WHERE user_id = $1`,
      [userId]
    )
    const totalSeries = parseInt(seriesResult.rows[0].count)

    // Top genres
    const genresResult = await query(
      `SELECT s.genres FROM user_series us
       JOIN series s ON us.series_id = s.id
       WHERE us.user_id = $1`,
      [userId]
    )

    // Top platforms
    const platformsResult = await query(
      `SELECT platform, COUNT(*) as count
       FROM episode_logs
       WHERE user_id = $1 AND is_watched = true AND platform IS NOT NULL
       GROUP BY platform
       ORDER BY count DESC
       LIMIT 5`,
      [userId]
    )

    return NextResponse.json(
      {
        stats: {
          totalEpisodes,
          totalHours,
          totalMinutes,
          totalSeries,
          topPlatforms: platformsResult.rows,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
