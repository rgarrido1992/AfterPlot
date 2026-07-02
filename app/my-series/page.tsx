'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MySeriesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'pending' | 'upcoming'>('pending')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth')
    }
  }, [router])

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
              href="/dashboard"
              className="px-4 py-2 rounded-lg hover:bg-afterplot-light transition"
            >
              Perfil
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 border-b border-afterplot-cyan border-opacity-30 mb-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 px-4 font-semibold transition ${
              activeTab === 'pending'
                ? 'text-afterplot-cyan border-b-2 border-afterplot-cyan'
                : 'text-afterplot-blue opacity-70 hover:opacity-100'
            }`}
          >
            📺 Lista Pendiente
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-3 px-4 font-semibold transition ${
              activeTab === 'upcoming'
                ? 'text-afterplot-cyan border-b-2 border-afterplot-cyan'
                : 'text-afterplot-blue opacity-70 hover:opacity-100'
            }`}
          >
            🗓️ Próximamente
          </button>
        </div>

        {/* Content */}
        <div className="text-center py-12">
          <div className="text-6xl mb-4">
            {activeTab === 'pending' ? '📋' : '📅'}
          </div>
          <h2 className="text-2xl font-bold text-afterplot-blue mb-2">
            {activeTab === 'pending' ? 'Sin episodios pendientes' : 'Sin próximos estrenos'}
          </h2>
          <p className="text-afterplot-blue opacity-70 mb-6">
            {activeTab === 'pending'
              ? 'Añade series desde Explorar para empezar'
              : 'Los próximos estrenos aparecerán aquí'}
          </p>
          <Link
            href="/explore"
            className="inline-block px-6 py-3 bg-gradient-to-r from-afterplot-blue to-afterplot-teal text-white font-semibold rounded-lg hover:shadow-lg transition"
          >
            Explorar Series
          </Link>
        </div>
      </div>
    </div>
  )
}
