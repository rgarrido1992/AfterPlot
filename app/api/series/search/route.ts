import { NextRequest, NextResponse } from 'next/server'
import { searchSeries } from '@/lib/tmdb'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const page = searchParams.get('page') || '1'

    if (!query || query.length < 3) {
      return NextResponse.json(
        { error: 'Mínimo 3 caracteres para buscar' },
        { status: 400 }
      )
    }

    const data = await searchSeries(query, parseInt(page))

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Error al buscar series' },
      { status: 500 }
    )
  }
}
