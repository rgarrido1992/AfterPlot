import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { ensureSeries } from '@/lib/cache'

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

    const { seriesId } = await request.json()

    if (!seriesId) {
      return NextResponse.json(
        { error: 'ID de serie requerido' },
        { status: 400 }
      )
    }

    // The series must exist in the local cache before the FK insert
    await ensureSeries(parseInt(seriesId))

    const result = await query(
      `INSERT INTO user_series (user_id, series_id, status)
       VALUES ($1, $2, 'SIGUIENDO')
       ON CONFLICT (user_id, series_id) DO UPDATE SET status = 'SIGUIENDO'
       RETURNING *`,
      [decoded.userId, seriesId]
    )

    return NextResponse.json(
      { message: 'Serie añadida', userSeries: result.rows[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error('Add series error:', error)
    return NextResponse.json(
      { error: 'Error al añadir serie' },
      { status: 500 }
    )
  }
}
