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
         rating = EXCLUDED.rating,
         platform = EXCLUDED.platform,
         emotion_emoji = EXCLUDED.emotion_emoji,
         favorite_character = EXCLUDED.favorite_character,
         updated_at = NOW()
       RETURNING *`,
      [decoded.userId, episodeId, isWatched, rating, platform, emotionEmoji, favoriteCharacter]
    )

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

    if (!episodeId) {
      return NextResponse.json(
        { error: 'episodeId requerido' },
        { status: 400 }
      )
    }

    const result = await query(
      `SELECT * FROM episode_logs
       WHERE user_id = $1 AND episode_id = $2`,
      [decoded.userId, episodeId]
    )

    return NextResponse.json(
      { log: result.rows[0] || null },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get episode log error:', error)
    return NextResponse.json(
      { error: 'Error al obtener log de episodio' },
      { status: 500 }
    )
  }
}
