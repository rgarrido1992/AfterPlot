'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [days, setDays] = useState(0)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const launchDate = new Date('2026-07-15').getTime()

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = launchDate - now

      setDays(Math.floor(distance / (1000 * 60 * 60 * 24)))
      setHours(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))
      setMinutes(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)))
      setSeconds(Math.floor((distance % (1000 * 60)) / 1000))

      if (distance < 0) {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-afterplot-cyan opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-afterplot-teal opacity-10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Logo/Brand */}
        <div className="mb-8">
          <div className="inline-block">
            <div className="text-6xl sm:text-7xl font-bold bg-gradient-to-r from-afterplot-blue via-afterplot-teal to-afterplot-cyan bg-clip-text text-transparent">
              AfterPlot
            </div>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-xl sm:text-2xl text-afterplot-blue opacity-80 mb-4 font-light">
          The ritual of tracking your favorite shows
        </p>
        <p className="text-sm sm:text-base text-afterplot-teal opacity-70 mb-12">
          Discover, track, and analyze your TV series journey with precision and emotion
        </p>

        {/* Countdown */}
        <div className="mb-12 p-8 bg-white bg-opacity-60 backdrop-blur-md rounded-3xl border border-afterplot-cyan border-opacity-30 shadow-xl">
          <h2 className="text-lg text-afterplot-blue mb-6 font-semibold">Coming Soon</h2>

          <div className="grid grid-cols-4 gap-4 sm:gap-6">
            {/* Days */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-afterplot-blue to-afterplot-teal text-white rounded-2xl p-4 sm:p-6 w-full min-h-24 sm:min-h-28 flex items-center justify-center">
                <span className="text-3xl sm:text-5xl font-bold">{String(days).padStart(2, '0')}</span>
              </div>
              <p className="text-xs sm:text-sm text-afterplot-blue font-semibold mt-2 uppercase tracking-wide">Days</p>
            </div>

            {/* Hours */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-afterplot-teal to-afterplot-cyan text-white rounded-2xl p-4 sm:p-6 w-full min-h-24 sm:min-h-28 flex items-center justify-center">
                <span className="text-3xl sm:text-5xl font-bold">{String(hours).padStart(2, '0')}</span>
              </div>
              <p className="text-xs sm:text-sm text-afterplot-blue font-semibold mt-2 uppercase tracking-wide">Hours</p>
            </div>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-afterplot-cyan to-afterplot-teal text-white rounded-2xl p-4 sm:p-6 w-full min-h-24 sm:min-h-28 flex items-center justify-center">
                <span className="text-3xl sm:text-5xl font-bold">{String(minutes).padStart(2, '0')}</span>
              </div>
              <p className="text-xs sm:text-sm text-afterplot-blue font-semibold mt-2 uppercase tracking-wide">Minutes</p>
            </div>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-afterplot-cyan to-afterplot-blue text-white rounded-2xl p-4 sm:p-6 w-full min-h-24 sm:min-h-28 flex items-center justify-center">
                <span className="text-3xl sm:text-5xl font-bold">{String(seconds).padStart(2, '0')}</span>
              </div>
              <p className="text-xs sm:text-sm text-afterplot-blue font-semibold mt-2 uppercase tracking-wide">Seconds</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <p className="text-afterplot-blue text-sm opacity-70">
            Subscribe to be notified when we launch
          </p>
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-6 py-3 rounded-xl bg-white border border-afterplot-cyan border-opacity-30 text-afterplot-blue placeholder-afterplot-blue placeholder-opacity-50 focus:outline-none focus:border-afterplot-teal focus:ring-2 focus:ring-afterplot-teal focus:ring-opacity-20"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-afterplot-blue to-afterplot-teal text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 active:scale-95"
            >
              Notify Me
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-afterplot-cyan border-opacity-20">
          <p className="text-xs sm:text-sm text-afterplot-blue opacity-60">
            Built by <span className="font-semibold">Tartessos Studio</span> • 2026
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <a href="#" className="text-afterplot-teal hover:text-afterplot-blue text-sm opacity-70 hover:opacity-100">
              GitHub
            </a>
            <a href="#" className="text-afterplot-teal hover:text-afterplot-blue text-sm opacity-70 hover:opacity-100">
              Twitter
            </a>
            <a href="#" className="text-afterplot-teal hover:text-afterplot-blue text-sm opacity-70 hover:opacity-100">
              Contact
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
