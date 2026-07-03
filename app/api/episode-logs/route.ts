import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
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

    const {
      episodeId,
      isWatched,
      rating,
      platform,
      emotionEmoji,
      favoriteCharacter,
    } = await request.json()

    if (!episodeId) {
      return NextResponse.json(
        { error: 'ID de episodio requerido' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO episode_logs (user_id, episode_id, is_watched, watched_at, rating, platform, emotion_emoji, favorite_character)
       VALUES ($1, $2, $3, CASE WHEN $3 THEN NOW() ELSE NULL END, $4, $5, $6, $7)
       ON CONFLICT (user_id, episode_id) DO UPDATE SET
         is_watched = EXCLUDED.is_watched,
         watched_at = CASE WHEN EXCLUDED.is_watched THEN NOW() ELSE episode_logs.watched_at END,
         rating = COALESCE(EXCLUDED.rating, episode_logs.rating),
         platform = COALESCE(EXCLUDED.platform, episode_logs.platform),
         emotion_emoji = COALESCE(EXCLUDED.emotion_emoji, episode_logs.emotion_emoji),
         favorite_character = COALESCE(EXCLUDED.favorite_character, episode_logs.favorite_character),
         updated_at = NOW()
       RETURNING *`,
      [decoded.userId, episodeId, isWatched, rating, platform, emotionEmoji, favoriteCharacter]
    )

    // Refresh last_watched_at so PAUSADA triggers and list ordering work
    if (isWatched) {
      await query(
        `UPDATE user_series us SET last_watched_at = NOW()
         FROM episodes e
         WHERE e.id = $2 AND us.series_id = e.series_id AND us.user_id = $1`,
        [decoded.userId, episodeId]
      )
    }

    return NextResponse.json(
      { message: 'Episodio actualizado', log: result.rows[0] },
      { status: 200 }
    )
  } catch (error) {
    console.error('Episode log error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar episodio' },
      { status: 500 }
    )
  }
}

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

    const episodeId = request.nextUrl.searchParams.get('episodeId')
    const seriesId = request.nextUrl.searchParams.get('seriesId')

    if (episodeId) {
      const result = await query(
        `SELECT * FROM episode_logs
         WHERE user_id = $1 AND episode_id = $2`,
        [decoded.userId, episodeId]
      )
      return NextResponse.json({ log: result.rows[0] || null }, { status: 200 })
    }

    if (seriesId) {
      const result = await query(
        `SELECT el.*, e.season_number, e.episode_number
         FROM episode_logs el
         JOIN episodes e ON el.episode_id = e.id
         WHERE el.user_id = $1 AND e.series_id = $2 AND el.is_watched = true`,
        [decoded.userId, seriesId]
      )
      return NextResponse.json({ logs: result.rows }, { status: 200 })
    }

    return NextResponse.json(
      { error: 'episodeId o seriesId requerido' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Get episode log error:', error)
    return NextResponse.json(
      { error: 'Error al obtener log de episodio' },
      { status: 500 }
    )
  }
}
