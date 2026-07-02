'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Series {
  id: number
  name: string
  poster_path: string
  overview: string
  vote_average: number
  first_air_date: string
}

export default function ExplorePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<Series[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth')
    }
  }, [router])

  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 3) {
      setShowResults(false)
      return
    }

    setIsSearching(true)
    try {
      const res = await fetch(`/api/series/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.results || [])
      setShowResults(true)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, handleSearch])

  return (
    <div className="min-h-screen bg-gradient-to-br from-afterplot-light via-white to-afterplot-light">
      {/* Header */}
      <div className="bg-white border-b border-afterplot-cyan border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-afterplot-blue to-afterplot-cyan bg-clip-text text-transparent">
                AfterPlot
              </h1>
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-afterplot-cyan text-white hover:bg-afterplot-teal transition"
            >
              Mi Perfil
            </Link>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Busca una serie (ej: Breaking Bad, Game of Thrones)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-3 border-2 border-afterplot-cyan border-opacity-30 rounded-xl focus:outline-none focus:ring-2 focus:ring-afterplot-cyan text-afterplot-blue"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-5 w-5 border-2 border-afterplot-cyan border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showResults ? (
          <>
            <h2 className="text-2xl font-bold text-afterplot-blue mb-8">
              {results.length} serie{results.length !== 1 ? 's' : ''} encontrada{results.length !== 1 ? 's' : ''}
            </h2>

            {results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {results.map((series) => (
                  <div key={series.id} className="group">
                    <Link
                      href={`/series/${series.id}`}
                      className="block"
                    >
                      <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition duration-300">
                      <div className="relative h-64 bg-gradient-to-br from-afterplot-blue to-afterplot-cyan overflow-hidden">
                        {series.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${series.poster_path}`}
                            alt={series.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-white text-center opacity-50">
                              <p>Sin imagen</p>
                            </div>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                          ⭐ {series.vote_average.toFixed(1)}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-afterplot-blue group-hover:text-afterplot-cyan transition">
                          {series.name}
                        </h3>
                        <p className="text-sm text-afterplot-blue opacity-70 mt-2 line-clamp-2">
                          {series.overview}
                        </p>
                        <p className="text-xs text-afterplot-teal mt-3">
                          {series.first_air_date ? new Date(series.first_air_date).getFullYear() : 'Año desconocido'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-afterplot-blue opacity-70">
                  No se encontraron series. Intenta con otro término.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-afterplot-blue mb-2">
              Explora series
            </h2>
            <p className="text-afterplot-blue opacity-70">
              Busca tu serie favorita para empezar a hacer seguimiento
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
