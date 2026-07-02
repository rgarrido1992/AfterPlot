import { NextRequest, NextResponse } from 'next/server'
import { getSeriesEpisodes } from '@/lib/tmdb'

export async function GET(request: NextRequest) {
  try {
    const seriesId = request.nextUrl.searchParams.get('seriesId')
    const seasonNumber = request.nextUrl.searchParams.get('season')

    if (!seriesId || !seasonNumber) {
      return NextResponse.json(
        { error: 'seriesId y season son requeridos' },
        { status: 400 }
      )
    }

    const data = await getSeriesEpisodes(parseInt(seriesId), parseInt(seasonNumber))

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Get episodes error:', error)
    return NextResponse.json(
      { error: 'Error al obtener episodios' },
      { status: 500 }
    )
  }
}
