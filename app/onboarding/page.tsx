'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

const GENDER_OPTIONS = ['Man', 'Woman', 'Non-binary', 'Other']
const INTERESTED_IN_OPTIONS = ['Men', 'Women', 'Everyone']

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    first_name: '',
    age: '',
    gender: '',
    interested_in: '',
    city: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const age = parseInt(form.age)
    if (isNaN(age) || age < 18 || age > 100) {
      setError('Age must be between 18 and 100.')
      return
    }

    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      first_name: form.first_name.trim(),
      age,
      gender: form.gender,
      interested_in: form.interested_in,
      city: form.city.trim(),
      onboarding_complete: true,
      upload_complete: false,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/upload')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-sm w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Tell us about yourself</h1>
          <p className="text-[#888] mt-1 text-sm">Just the basics — you'll stay anonymous until you match.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">First name</label>
            <input
              type="text"
              value={form.first_name}
              onChange={e => set('first_name', e.target.value)}
              required
              className="w-full bg-[#141414] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[#f5f5f5] focus:outline-none focus:border-[#e63462] transition-colors"
              placeholder="Alex"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Age</label>
            <input
              type="number"
              value={form.age}
              onChange={e => set('age', e.target.value)}
              required
              min={18}
              max={100}
              className="w-full bg-[#141414] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[#f5f5f5] focus:outline-none focus:border-[#e63462] transition-colors"
              placeholder="25"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Gender</label>
            <div className="grid grid-cols-2 gap-2">
              {GENDER_OPTIONS.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => set('gender', g)}
                  className={`py-2.5 px-4 rounded-xl border text-sm font-medium transition-colors ${
                    form.gender === g
                      ? 'bg-[#e63462] border-[#e63462] text-white'
                      : 'bg-[#141414] border-[#2a2a2a] text-[#888] hover:border-[#444]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Interested in</label>
            <div className="grid grid-cols-3 gap-2">
              {INTERESTED_IN_OPTIONS.map(o => (
                <button
                  key={o}
                  type="button"
                  onClick={() => set('interested_in', o)}
                  className={`py-2.5 px-4 rounded-xl border text-sm font-medium transition-colors ${
                    form.interested_in === o
                      ? 'bg-[#e63462] border-[#e63462] text-white'
                      : 'bg-[#141414] border-[#2a2a2a] text-[#888] hover:border-[#444]'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">City</label>
            <input
              type="text"
              value={form.city}
              onChange={e => set('city', e.target.value)}
              required
              className="w-full bg-[#141414] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[#f5f5f5] focus:outline-none focus:border-[#e63462] transition-colors"
              placeholder="London"
            />
          </div>

          {error && (
            <p className="text-[#e63462] text-sm bg-[#e63462]/10 border border-[#e63462]/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !form.gender || !form.interested_in}
            className="w-full bg-[#e63462] hover:bg-[#c4284f] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </main>
  )
}
