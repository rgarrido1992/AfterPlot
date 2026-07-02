'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Episode {
  id: number
  name: string
  episode_number: number
  season_number: number
  overview: string
  air_date: string
  runtime: number
  vote_average: number
  still_path: string
}

export default function EpisodesPage() {
  const params = useParams()
  const router = useRouter()
  const seriesId = params.id as string

  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [seasons, setSeasons] = useState<number[]>([])
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [loading, setLoading] = useState(true)
  const [seriesTitle, setSeriesTitle] = useState('')
  const [watchedEpisodes, setWatchedEpisodes] = useState<Set<number>>(new Set())

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth')
      return
    }

    const fetchData = async () => {
      try {
        // Fetch series info
        const seriesRes = await fetch(`/api/series/${seriesId}`)
        const seriesData = await seriesRes.json()
        setSeriesTitle(seriesData.name)

        // Create season list
        const seasonList = Array.from(
          { length: seriesData.number_of_seasons },
          (_, i) => i + 1
        )
        setSeasons(seasonList)

        // Fetch first season episodes
        const episodesRes = await fetch(
          `/api/episodes?seriesId=${seriesId}&season=${selectedSeason}`
        )
        const episodesData = await episodesRes.json()
        setEpisodes(episodesData.episodes || [])

        setLoading(false)
      } catch (error) {
        console.error('Error fetching episodes:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [seriesId, selectedSeason, router])

  const handleMarkWatched = async (episodeId: number) => {
    try {
      const token = localStorage.getItem('token')
      const isWatched = !watchedEpisodes.has(episodeId)

      const res = await fetch('/api/episode-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          episodeId,
          isWatched,
        }),
      })

      if (res.ok) {
        if (isWatched) {
          watchedEpisodes.add(episodeId)
        } else {
          watchedEpisodes.delete(episodeId)
        }
        setWatchedEpisodes(new Set(watchedEpisodes))
      }
    } catch (error) {
      console.error('Error marking episode:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-afterplot-light via-white to-afterplot-light flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-afterplot-cyan border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-afterplot-light via-white to-afterplot-light">
      {/* Header */}
      <div className="bg-white border-b border-afterplot-cyan border-opacity-20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-afterplot-blue to-afterplot-cyan bg-clip-text text-transparent">
              AfterPlot
            </Link>
            <p className="text-sm text-afterplot-blue opacity-70">{seriesTitle}</p>
          </div>
          <Link
            href={`/series/${seriesId}`}
            className="text-afterplot-blue hover:text-afterplot-cyan"
          >
            ← Volver
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Season Selector */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-afterplot-blue mb-4">Temporadas</h2>
          <div className="flex flex-wrap gap-2">
            {seasons.map((season) => (
              <button
                key={season}
                onClick={() => setSelectedSeason(season)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedSeason === season
                    ? 'bg-afterplot-cyan text-white'
                    : 'bg-white text-afterplot-blue border border-afterplot-cyan border-opacity-30 hover:bg-afterplot-light'
                }`}
              >
                T{season}
              </button>
            ))}
          </div>
        </div>

        {/* Episodes */}
        <div className="space-y-4">
          {episodes.length > 0 ? (
            episodes.map((episode) => (
              <div
                key={episode.id}
                className="bg-white rounded-xl shadow-lg p-6 border border-afterplot-cyan border-opacity-20"
              >
                <div className="flex items-start gap-6">
                  {episode.still_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${episode.still_path}`}
                      alt={episode.name}
                      className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-32 h-20 bg-afterplot-light rounded-lg flex items-center justify-center flex-shrink-0">
                      📺
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-afterplot-blue">
                          {episode.episode_number}. {episode.name}
                        </h3>
                        <p className="text-sm text-afterplot-blue opacity-70">
                          {episode.air_date ? new Date(episode.air_date).toLocaleDateString('es-ES') : 'Fecha no disponible'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-afterplot-teal">
                          ⭐ {episode.vote_average.toFixed(1)}
                        </span>
                        <button
                          onClick={() => handleMarkWatched(episode.id)}
                          className={`px-4 py-2 rounded-lg font-semibold transition ${
                            watchedEpisodes.has(episode.id)
                              ? 'bg-green-100 text-green-700'
                              : 'bg-afterplot-light text-afterplot-blue hover:bg-afterplot-cyan hover:text-white'
                          }`}
                        >
                          {watchedEpisodes.has(episode.id) ? '✓ Visto' : 'Marcar'}
                        </button>
                      </div>
                    </div>

                    <p className="text-afterplot-blue opacity-80 text-sm line-clamp-2">
                      {episode.overview}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-afterplot-blue opacity-70">
                No hay episodios disponibles para esta temporada
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
