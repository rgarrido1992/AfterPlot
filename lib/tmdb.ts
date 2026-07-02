const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY

export interface TMDBSeries {
  id: number
  name: string
  overview: string
  poster_path: string
  backdrop_path: string
  first_air_date: string
  genres: Array<{ id: number; name: string }>
  vote_average: number
  number_of_seasons: number
  status: string
}

export interface TMDBEpisode {
  id: number
  name: string
  overview: string
  episode_number: number
  season_number: number
  still_path: string
  air_date: string
  vote_average: number
  runtime: number
}

export interface TMDBGenre {
  id: number
  name: string
}

async function tmdbFetch(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`)
  url.searchParams.append('api_key', API_KEY || '')

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })

  const response = await fetch(url.toString())
  if (!response.ok) throw new Error(`TMDB API error: ${response.statusText}`)
  return response.json()
}

export async function searchSeries(query: string, page = 1) {
  return tmdbFetch('/search/tv', {
    query,
    page: page.toString(),
    language: 'es-ES',
  })
}

export async function getSeries(seriesId: number) {
  return tmdbFetch(`/tv/${seriesId}`, {
    language: 'es-ES',
    append_to_response: 'aggregate_credits,watch/providers',
  })
}

export async function getSeriesEpisodes(seriesId: number, seasonNumber: number) {
  return tmdbFetch(`/tv/${seriesId}/season/${seasonNumber}`, {
    language: 'es-ES',
  })
}

export async function getTrendingSeries(page = 1) {
  return tmdbFetch('/trending/tv/week', {
    page: page.toString(),
    language: 'es-ES',
  })
}

export async function getGenres() {
  return tmdbFetch('/genre/tv/list', {
    language: 'es-ES',
  })
}

export async function getSeriesByGenre(genreId: number, page = 1) {
  return tmdbFetch('/discover/tv', {
    with_genres: genreId.toString(),
    sort_by: 'popularity.desc',
    page: page.toString(),
    language: 'es-ES',
  })
}

export async function getSeriesProviders(seriesId: number) {
  const data = await getSeries(seriesId)
  return data['watch/providers']?.results?.ES || null
}
