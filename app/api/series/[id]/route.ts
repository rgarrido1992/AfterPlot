import { NextRequest, NextResponse } from 'next/server'
import { getSeries } from '@/lib/tmdb'
import { upsertSeries } from '@/lib/cache'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const seriesId = parseInt(id)

    if (isNaN(seriesId)) {
      return NextResponse.json(
        { error: 'ID de serie inválido' },
        { status: 400 }
      )
    }

    const series = await getSeries(seriesId)

    // Keep the local catalog cache fresh (FK target for user_series/episodes)
    await upsertSeries(series).catch((err) =>
      console.error('Series cache error:', err)
    )

    return NextResponse.json(series, { status: 200 })
  } catch (error) {
    console.error('Get series error:', error)
    return NextResponse.json(
      { error: 'Error al obtener la serie' },
      { status: 500 }
    )
  }
}
