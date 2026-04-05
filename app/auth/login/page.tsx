'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            Vibe<span className="text-[#e63462]">Match</span>
          </h1>
          <p className="text-[#888] mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-[#141414] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[#f5f5f5] focus:outline-none focus:border-[#e63462] transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-[#141414] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[#f5f5f5] focus:outline-none focus:border-[#e63462] transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-[#e63462] text-sm bg-[#e63462]/10 border border-[#e63462]/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e63462] hover:bg-[#c4284f] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-[#888]">
          No account?{' '}
          <Link href="/auth/signup" className="text-[#e63462] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}
