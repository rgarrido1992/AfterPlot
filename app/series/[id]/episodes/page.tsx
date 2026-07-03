'use client'

import { useEffect, useState, useCallback } from 'react'
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

interface WatchedLog {
  episode_id: number
  season_number: number
  episode_number: number
}

interface CastMember {
  name: string
  character: string
  profile_path: string | null
}

interface Provider {
  provider_name: string
  logo_path: string
}

const EMOTIONS = [
  { name: 'Sorprendido', emoji: '😲' },
  { name: 'Enfadado', emoji: '😠' },
  { name: 'Triste', emoji: '😢' },
  { name: 'Pensativo', emoji: '🤔' },
  { name: 'Emocionado', emoji: '🤩' },
  { name: 'Divertido', emoji: '😄' },
  { name: 'Asustado', emoji: '😨' },
  { name: 'Aburrido', emoji: '😒' },
  { name: 'Previsible', emoji: '🙄' },
  { name: 'Entusiasmado', emoji: '🤗' },
  { name: 'Confundido', emoji: '😵' },
  { name: 'Intranquilo', emoji: '😰' },
]

export default function EpisodesPage() {
  const params = useParams()
  const router = useRouter()
  const seriesId = params.id as string

  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [seasons, setSeasons] = useState<number[]>([])
  const [seasonSizes, setSeasonSizes] = useState<Record<number, number>>({})
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [loading, setLoading] = useState(true)
  const [seriesTitle, setSeriesTitle] = useState('')
  const [cast, setCast] = useState<CastMember[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [watchedEpisodes, setWatchedEpisodes] = useState<Set<number>>(new Set())
  const [watchedLogs, setWatchedLogs] = useState<WatchedLog[]>([])

  // Modal state
  const [previousPrompt, setPreviousPrompt] = useState<Episode | null>(null)
  const [reviewEpisode, setReviewEpisode] = useState<Episode | null>(null)
  const [rating, setRating] = useState(0)
  const [platform, setPlatform] = useState('')
  const [emotion, setEmotion] = useState('')
  const [character, setCharacter] = useState('')
  const [characterSearch, setCharacterSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const getToken = () => localStorage.getItem('token')

  const fetchWatched = useCallback(async () => {
    try {
      const res = await fetch(`/api/episode-logs?seriesId=${seriesId}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      })
      if (res.ok) {
        const data = await res.json()
        const logs: WatchedLog[] = data.logs || []
        setWatchedLogs(logs)
        setWatchedEpisodes(new Set(logs.map((l) => l.episode_id)))
      }
    } catch (error) {
      console.error('Error fetching watched episodes:', error)
    }
  }, [seriesId])

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push('/auth')
      return
    }

    const fetchData = async () => {
      try {
        const seriesRes = await fetch(`/api/series/${seriesId}`)
        const seriesData = await seriesRes.json()
        setSeriesTitle(seriesData.name)

        const seasonList = Array.from(
          { length: seriesData.number_of_seasons },
          (_, i) => i + 1
        )
        setSeasons(seasonList)

        const sizes: Record<number, number> = {}
        for (const s of seriesData.seasons || []) {
          if (s.season_number > 0) sizes[s.season_number] = s.episode_count
        }
        setSeasonSizes(sizes)

        const castData = (seriesData.aggregate_credits?.cast || [])
          .slice(0, 30)
          .map((c: any) => ({
            name: c.name,
            character: c.roles?.[0]?.character || '',
            profile_path: c.profile_path,
          }))
        setCast(castData)

        const flatrate = seriesData['watch/providers']?.results?.ES?.flatrate || []
        setProviders(flatrate)

        const episodesRes = await fetch(
          `/api/episodes?seriesId=${seriesId}&season=${selectedSeason}`
        )
        const episodesData = await episodesRes.json()
        setEpisodes(episodesData.episodes || [])

        // After /api/episodes caches the season, logs can join correctly
        await fetchWatched()

        setLoading(false)
      } catch (error) {
        console.error('Error fetching episodes:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [seriesId, selectedSeason, router, fetchWatched])

  const hasUnwatchedPrevious = (episode: Episode): boolean => {
    // Earlier episodes in the current season
    const currentSeasonUnwatched = episodes.some(
      (ep) =>
        ep.episode_number < episode.episode_number &&
        !watchedEpisodes.has(ep.id)
    )
    if (currentSeasonUnwatched) return true

    // Earlier seasons: compare watched count against season size
    for (let s = 1; s < episode.season_number; s++) {
      const total = seasonSizes[s] || 0
      const watched = watchedLogs.filter((l) => l.season_number === s).length
      if (watched < total) return true
    }
    return false
  }

  const markWatched = async (episode: Episode) => {
    const res = await fetch('/api/episode-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ episodeId: episode.id, isWatched: true }),
    })
    if (res.ok) {
      setWatchedEpisodes((prev) => new Set(prev).add(episode.id))
      setWatchedLogs((prev) => [
        ...prev,
        {
          episode_id: episode.id,
          season_number: episode.season_number,
          episode_number: episode.episode_number,
        },
      ])
      openReview(episode)
    }
  }

  const unmarkWatched = async (episode: Episode) => {
    const res = await fetch('/api/episode-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ episodeId: episode.id, isWatched: false }),
    })
    if (res.ok) {
      setWatchedEpisodes((prev) => {
        const next = new Set(prev)
        next.delete(episode.id)
        return next
      })
      setWatchedLogs((prev) => prev.filter((l) => l.episode_id !== episode.id))
    }
  }

  const handleToggleWatched = (episode: Episode) => {
    if (watchedEpisodes.has(episode.id)) {
      unmarkWatched(episode)
      return
    }
    if (hasUnwatchedPrevious(episode)) {
      setPreviousPrompt(episode)
    } else {
      markWatched(episode)
    }
  }

  const handleMarkPrevious = async (markAll: boolean) => {
    const episode = previousPrompt
    setPreviousPrompt(null)
    if (!episode) return

    if (markAll) {
      const res = await fetch('/api/episode-logs/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          seriesId: parseInt(seriesId),
          seasonNumber: episode.season_number,
          episodeNumber: episode.episode_number,
        }),
      })
      if (res.ok) {
        await fetchWatched()
        openReview(episode)
      }
    } else {
      await markWatched(episode)
    }
  }

  const openReview = (episode: Episode) => {
    setRating(0)
    setPlatform('')
    setEmotion('')
    setCharacter('')
    setCharacterSearch('')
    setReviewEpisode(episode)
  }

  const handleSaveReview = async () => {
    if (!reviewEpisode) return
    setSaving(true)
    try {
      await fetch('/api/episode-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          episodeId: reviewEpisode.id,
          isWatched: true,
          rating: rating || null,
          platform: platform || null,
          emotionEmoji: emotion || null,
          favoriteCharacter: character || null,
        }),
      })
    } catch (error) {
      console.error('Error saving review:', error)
    }
    setSaving(false)
    setReviewEpisode(null)
  }

  const filteredCast = cast.filter(
    (c) =>
      !characterSearch ||
      c.name.toLowerCase().includes(characterSearch.toLowerCase()) ||
      c.character.toLowerCase().includes(characterSearch.toLowerCase())
  )

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
      <div className="bg-white border-b border-afterplot-cyan border-opacity-20 sticky top-0 z-40">
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
                          ⭐ {episode.vote_average?.toFixed(1) ?? '-'}
                        </span>
                        <button
                          onClick={() => handleToggleWatched(episode)}
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

      {/* Modal: mark previous episodes */}
      {previousPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-afterplot-blue mb-3">
              Episodios anteriores sin ver
            </h3>
            <p className="text-afterplot-blue opacity-80 mb-6">
              Tienes episodios anteriores a{' '}
              <span className="font-semibold">
                T{previousPrompt.season_number}·E{previousPrompt.episode_number}
              </span>{' '}
              sin marcar. ¿Deseas marcar todos los episodios anteriores como vistos de forma automática?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleMarkPrevious(true)}
                className="w-full py-3 bg-gradient-to-r from-afterplot-blue to-afterplot-teal text-white font-semibold rounded-lg hover:shadow-lg transition"
              >
                Sí, marcar todos los anteriores
              </button>
              <button
                onClick={() => handleMarkPrevious(false)}
                className="w-full py-3 border-2 border-afterplot-cyan text-afterplot-blue font-semibold rounded-lg hover:bg-afterplot-light transition"
              >
                No, solo este episodio
              </button>
              <button
                onClick={() => setPreviousPrompt(null)}
                className="w-full py-2 text-afterplot-blue opacity-60 hover:opacity-100 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: post-visionado */}
      {reviewEpisode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-afterplot-blue mb-1">
              ¿Qué te ha parecido?
            </h3>
            <p className="text-sm text-afterplot-blue opacity-70 mb-6">
              T{reviewEpisode.season_number}·E{reviewEpisode.episode_number} — {reviewEpisode.name}
            </p>

            {/* Platform */}
            <div className="mb-6">
              <p className="font-semibold text-afterplot-blue mb-3">¿Dónde lo viste?</p>
              <div className="flex flex-wrap gap-3">
                {providers.map((p) => (
                  <button
                    key={p.provider_name}
                    onClick={() => setPlatform(p.provider_name)}
                    title={p.provider_name}
                    className={`rounded-xl overflow-hidden border-2 transition ${
                      platform === p.provider_name
                        ? 'border-afterplot-cyan ring-2 ring-afterplot-cyan'
                        : 'border-transparent hover:border-afterplot-cyan'
                    }`}
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                      alt={p.provider_name}
                      className="w-12 h-12 object-cover"
                    />
                  </button>
                ))}
                <button
                  onClick={() => setPlatform('Otro')}
                  title="Soporte físico / Otro"
                  className={`w-12 h-12 rounded-xl border-2 text-2xl flex items-center justify-center transition ${
                    platform === 'Otro'
                      ? 'border-afterplot-cyan ring-2 ring-afterplot-cyan bg-afterplot-light'
                      : 'border-afterplot-cyan border-opacity-30 hover:border-opacity-100'
                  }`}
                >
                  📀
                </button>
                <button
                  onClick={() => setPlatform('No oficial')}
                  title="Sitio no oficial"
                  className={`w-12 h-12 rounded-xl border-2 text-2xl flex items-center justify-center transition ${
                    platform === 'No oficial'
                      ? 'border-afterplot-cyan ring-2 ring-afterplot-cyan bg-afterplot-light'
                      : 'border-afterplot-cyan border-opacity-30 hover:border-opacity-100'
                  }`}
                >
                  🏴‍☠️
                </button>
              </div>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <p className="font-semibold text-afterplot-blue mb-3">Calificación</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-3xl transition ${
                      star <= rating ? 'opacity-100' : 'opacity-25 hover:opacity-60'
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            {/* Emotions */}
            <div className="mb-6">
              <p className="font-semibold text-afterplot-blue mb-3">¿Cómo te ha hecho sentir?</p>
              <div className="grid grid-cols-4 gap-2">
                {EMOTIONS.map((e) => (
                  <button
                    key={e.name}
                    onClick={() => setEmotion(e.emoji)}
                    className={`p-2 rounded-lg text-center transition border-2 ${
                      emotion === e.emoji
                        ? 'border-afterplot-cyan bg-afterplot-light'
                        : 'border-transparent hover:bg-afterplot-light'
                    }`}
                  >
                    <span className="text-2xl block">{e.emoji}</span>
                    <span className="text-xs text-afterplot-blue opacity-70">{e.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* MVP Character */}
            {cast.length > 0 && (
              <div className="mb-6">
                <p className="font-semibold text-afterplot-blue mb-3">MVP del episodio</p>
                <input
                  type="text"
                  value={characterSearch}
                  onChange={(e) => setCharacterSearch(e.target.value)}
                  placeholder="Buscar personaje..."
                  className="w-full px-4 py-2 mb-3 border border-afterplot-cyan border-opacity-30 rounded-lg focus:outline-none focus:border-afterplot-cyan text-afterplot-blue"
                />
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {filteredCast.slice(0, 10).map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setCharacter(c.character || c.name)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition ${
                        character === (c.character || c.name)
                          ? 'bg-afterplot-light border border-afterplot-cyan'
                          : 'hover:bg-afterplot-light'
                      }`}
                    >
                      {c.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w45${c.profile_path}`}
                          alt={c.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="w-8 h-8 rounded-full bg-afterplot-light flex items-center justify-center">👤</span>
                      )}
                      <span className="text-sm">
                        <span className="font-semibold text-afterplot-blue">{c.character || '—'}</span>
                        <span className="text-afterplot-blue opacity-60"> · {c.name}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSaveReview}
                disabled={saving}
                className="flex-1 py-3 bg-gradient-to-r from-afterplot-blue to-afterplot-teal text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => setReviewEpisode(null)}
                className="px-6 py-3 text-afterplot-blue opacity-60 hover:opacity-100 transition"
              >
                Omitir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
