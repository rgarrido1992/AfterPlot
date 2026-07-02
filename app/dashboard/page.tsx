'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth')
      return
    }

    // TODO: Fetch user data from API
    // For now, we'll show a placeholder
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
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
      <div className="bg-white border-b border-afterplot-cyan border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-afterplot-blue to-afterplot-cyan bg-clip-text text-transparent">
              AfterPlot
            </h1>
          </Link>
          <div className="flex gap-4">
            <Link
              href="/explore"
              className="px-4 py-2 rounded-lg hover:bg-afterplot-light transition"
            >
              Explorar
            </Link>
            <Link
              href="/my-series"
              className="px-4 py-2 rounded-lg hover:bg-afterplot-light transition"
            >
              Mis Series
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Banner */}
        <div className="bg-gradient-to-r from-afterplot-blue to-afterplot-cyan rounded-2xl h-40 mb-8 shadow-lg"></div>

        {/* Profile Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-afterplot-cyan border-opacity-20">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-afterplot-blue to-afterplot-cyan rounded-full flex items-center justify-center text-white text-4xl">
                  👤
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-afterplot-blue">Usuario</h2>
                  <p className="text-afterplot-blue opacity-70">usuario@email.com</p>
                  <div className="flex gap-6 mt-4 text-sm">
                    <div>
                      <p className="font-semibold text-afterplot-blue">0</p>
                      <p className="text-afterplot-blue opacity-70">Siguiendo</p>
                    </div>
                    <div>
                      <p className="font-semibold text-afterplot-blue">0</p>
                      <p className="text-afterplot-blue opacity-70">Seguidores</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-afterplot-blue mb-4">Tus Estadísticas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Episodios Vistos', value: '0' },
                  { label: 'Series Añadidas', value: '0' },
                  { label: 'Tiempo Total', value: '0h' },
                  { label: 'Géneros Favoritos', value: '-' },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-4 shadow-lg border border-afterplot-cyan border-opacity-20"
                  >
                    <p className="text-2xl font-bold text-afterplot-cyan">{stat.value}</p>
                    <p className="text-sm text-afterplot-blue opacity-70 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-afterplot-cyan border-opacity-20">
              <h3 className="font-bold text-afterplot-blue mb-4">Acciones Rápidas</h3>
              <div className="space-y-3">
                <Link
                  href="/explore"
                  className="block w-full py-3 bg-gradient-to-r from-afterplot-blue to-afterplot-teal text-white font-semibold rounded-lg hover:shadow-lg text-center transition"
                >
                  Buscar Series
                </Link>
                <Link
                  href="/my-series"
                  className="block w-full py-3 border-2 border-afterplot-cyan text-afterplot-blue font-semibold rounded-lg hover:bg-afterplot-light text-center transition"
                >
                  Mis Series
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
