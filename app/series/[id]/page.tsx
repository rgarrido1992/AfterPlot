'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Series {
  id: number
  name: string
  overview: string
  poster_path: string
  backdrop_path: string
  first_air_date: string
  status: string
  vote_average: number
  number_of_seasons: number
  genres: Array<{ id: number; name: string }>
  aggregate_credits?: {
    cast: Array<{ id: number; name: string; character: string; profile_path: string }>
  }
}

export default function SeriesDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const seriesId = params.id as string

  const [series, setSeries] = useState<Series | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth')
      return
    }

    const fetchSeries = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/series/${seriesId}`)
        if (!res.ok) throw new Error('Error al cargar la serie')
        const data = await res.json()
        setSeries(data)
      } catch (err) {
        setError('No se pudo cargar la serie')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSeries()
  }, [seriesId, router])

  const handleFollowSeries = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/user-series/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ seriesId: parseInt(seriesId) }),
      })

      if (res.ok) {
        setIsFollowing(true)
      }
    } catch (error) {
      console.error('Error following series:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-afterplot-light via-white to-afterplot-light flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-afterplot-cyan border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error || !series) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-afterplot-light via-white to-afterplot-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Serie no encontrada'}</p>
          <Link href="/explore" className="text-afterplot-cyan hover:text-afterplot-blue">
            Volver a explorar
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-afterplot-light via-white to-afterplot-light">
      {/* Header */}
      <div className="bg-white border-b border-afterplot-cyan border-opacity-20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-afterplot-blue to-afterplot-cyan bg-clip-text text-transparent">
            AfterPlot
          </Link>
          <Link href="/explore" className="text-afterplot-blue hover:text-afterplot-cyan">
            ← Volver
          </Link>
        </div>
      </div>

      {/* Banner */}
      <div className="relative h-64 sm:h-80 bg-gradient-to-r from-afterplot-blue to-afterplot-cyan overflow-hidden">
        {series.backdrop_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w1280${series.backdrop_path}`}
            alt={series.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-afterplot-blue to-afterplot-cyan"></div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Poster */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden h-fit sticky top-24">
              {series.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${series.poster_path}`}
                  alt={series.name}
                  className="w-full"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-afterplot-blue to-afterplot-cyan flex items-center justify-center">
                  <span className="text-white text-4xl">🎬</span>
                </div>
              )}
              <div className="p-4 space-y-3">
                <button
                  onClick={handleFollowSeries}
                  disabled={isFollowing}
                  className={`w-full py-3 font-semibold rounded-lg transition ${
                    isFollowing
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : 'bg-gradient-to-r from-afterplot-blue to-afterplot-teal text-white hover:shadow-lg'
                  }`}
                >
                  {isFollowing ? '✓ Siguiendo' : '+ Seguir'}
                </button>

                {isFollowing && (
                  <Link
                    href={`/series/${seriesId}/episodes`}
                    className="block w-full py-3 border-2 border-afterplot-cyan text-afterplot-cyan font-semibold rounded-lg hover:bg-afterplot-cyan hover:text-white text-center transition"
                  >
                    Ver Episodios
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-xl p-8">
            <h1 className="text-4xl font-bold text-afterplot-blue mb-2">{series.name}</h1>

            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold">
                ⭐ {series.vote_average.toFixed(1)}
              </span>
              <span className="text-afterplot-blue opacity-70">
                {new Date(series.first_air_date).getFullYear()}
              </span>
              <span className={`px-4 py-2 rounded-full font-semibold ${
                series.status === 'Returning Series'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {series.status === 'Returning Series' ? '🟢 En emisión' : '🔴 Finalizada'}
              </span>
            </div>

            <p className="text-afterplot-blue opacity-80 mb-6 leading-relaxed">
              {series.overview}
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8 p-6 bg-afterplot-light rounded-lg">
              <div>
                <p className="text-sm text-afterplot-blue opacity-70">Temporadas</p>
                <p className="text-2xl font-bold text-afterplot-cyan">{series.number_of_seasons}</p>
              </div>
              <div>
                <p className="text-sm text-afterplot-blue opacity-70">Géneros</p>
                <p className="text-sm font-semibold text-afterplot-blue">
                  {series.genres?.map(g => g.name).join(', ')}
                </p>
              </div>
            </div>

            {/* Cast */}
            {series.aggregate_credits?.cast && series.aggregate_credits.cast.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-afterplot-blue mb-4">Reparto Principal</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {series.aggregate_credits.cast.slice(0, 6).map((actor) => (
                    <div key={actor.id} className="text-center">
                      <div className="w-full aspect-square bg-afterplot-light rounded-lg overflow-hidden mb-2">
                        {actor.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                            alt={actor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-afterplot-blue">{actor.name}</p>
                      <p className="text-xs text-afterplot-blue opacity-70">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
