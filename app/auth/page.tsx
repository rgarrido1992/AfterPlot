'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      setIsVerifying(true)
    } catch (err) {
      setError('Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      localStorage.setItem('token', data.token)
      router.push('/dashboard')
    } catch (err) {
      setError('Error al verificar email')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      localStorage.setItem('token', data.token)
      router.push('/dashboard')
    } catch (err) {
      setError('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-afterplot-light via-white to-afterplot-light flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="text-4xl font-bold bg-gradient-to-r from-afterplot-blue to-afterplot-cyan bg-clip-text text-transparent">
              AfterPlot
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-afterplot-cyan border-opacity-20">
          {isVerifying ? (
            <>
              <h2 className="text-2xl font-bold text-afterplot-blue mb-2">
                Verifica tu email
              </h2>
              <p className="text-afterplot-blue opacity-70 mb-6">
                Hemos enviado un código a <strong>{email}</strong>
              </p>

              <form onSubmit={handleVerify} className="space-y-4">
                <input
                  type="text"
                  placeholder="Código de 6 dígitos"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="w-full px-4 py-3 border border-afterplot-cyan border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-afterplot-cyan text-center text-2xl tracking-widest font-mono"
                  required
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-afterplot-blue to-afterplot-teal text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 transition"
                >
                  {loading ? 'Verificando...' : 'Verificar'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsVerifying(false)
                    setVerificationCode('')
                    setError('')
                  }}
                  className="w-full text-afterplot-teal hover:text-afterplot-blue text-sm font-medium"
                >
                  Volver
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-afterplot-blue mb-6">
                {isLogin ? 'Inicia sesión' : 'Regístrate'}
              </h2>

              <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
                {!isLogin && (
                  <input
                    type="text"
                    placeholder="Nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-afterplot-cyan border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-afterplot-cyan"
                    required
                  />
                )}

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-afterplot-cyan border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-afterplot-cyan"
                  required
                />

                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-afterplot-cyan border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-afterplot-cyan"
                  required
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-afterplot-blue to-afterplot-teal text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 transition"
                >
                  {loading ? 'Procesando...' : isLogin ? 'Inicia sesión' : 'Regístrate'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-afterplot-blue opacity-70 text-sm">
                  {isLogin ? '¿Sin cuenta?' : '¿Ya tienes cuenta?'}{' '}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin)
                      setError('')
                      setEmail('')
                      setPassword('')
                      setUsername('')
                    }}
                    className="text-afterplot-teal hover:text-afterplot-blue font-semibold"
                  >
                    {isLogin ? 'Regístrate' : 'Inicia sesión'}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
