import { NextRequest, NextResponse } from 'next/server'
import { getSeriesEpisodes } from '@/lib/tmdb'
import { ensureSeries, upsertEpisodes } from '@/lib/cache'

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

    // Cache locally so episode_logs FKs resolve and stats can join runtimes
    try {
      await ensureSeries(parseInt(seriesId))
      await upsertEpisodes(parseInt(seriesId), data.episodes || [])
    } catch (err) {
      console.error('Episodes cache error:', err)
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Get episodes error:', error)
    return NextResponse.json(
      { error: 'Error al obtener episodios' },
      { status: 500 }
    )
  }
}
