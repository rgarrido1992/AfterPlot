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

    const status = request.nextUrl.searchParams.get('status')

    let sql = `SELECT us.*, s.title, s.poster_path
               FROM user_series us
               JOIN series s ON us.series_id = s.id
               WHERE us.user_id = $1`

    const params: any[] = [decoded.userId]

    if (status) {
      sql += ` AND us.status = $2`
      params.push(status)
    }

    sql += ` ORDER BY us.last_watched_at DESC NULLS LAST`

    const result = await query(sql, params)

    return NextResponse.json(
      { userSeries: result.rows },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get user series error:', error)
    return NextResponse.json(
      { error: 'Error al obtener series' },
      { status: 500 }
    )
  }
}
