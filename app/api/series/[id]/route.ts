import { NextRequest, NextResponse } from 'next/server'
import { getSeries, getSeriesEpisodes } from '@/lib/tmdb'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const seriesId = parseInt(params.id)

    if (isNaN(seriesId)) {
      return NextResponse.json(
        { error: 'ID de serie inválido' },
        { status: 400 }
      )
    }

    const series = await getSeries(seriesId)

    return NextResponse.json(series, { status: 200 })
  } catch (error) {
    console.error('Get series error:', error)
    return NextResponse.json(
      { error: 'Error al obtener la serie' },
      { status: 500 }
    )
  }
}
