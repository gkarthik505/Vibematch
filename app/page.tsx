import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_complete, upload_complete')
      .eq('id', user.id)
      .single()

    if (!profile?.onboarding_complete) {
      redirect('/onboarding')
    } else if (!profile?.upload_complete) {
      redirect('/upload')
    } else {
      redirect('/discover')
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-5xl font-bold tracking-tight mb-3">
            Vibe<span className="text-[#e63462]">Match</span>
          </h1>
          <p className="text-[#888] text-lg">
            Find people through what they actually watch — not filtered photos.
          </p>
        </div>

        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 space-y-4 text-left">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📺</span>
            <div>
              <p className="font-medium">Real taste, not curated looks</p>
              <p className="text-sm text-[#888]">Your YouTube watch history reveals who you actually are.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">👤</span>
            <div>
              <p className="font-medium">Anonymous until match</p>
              <p className="text-sm text-[#888]">No names or photos until you both vibe.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <p className="font-medium">Your data stays yours</p>
              <p className="text-sm text-[#888]">We only use your upload to build a taste profile. Nothing else.</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/auth/signup"
            className="block w-full bg-[#e63462] hover:bg-[#c4284f] text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Get started
          </Link>
          <Link
            href="/auth/login"
            className="block w-full bg-[#1a1a1a] hover:bg-[#222] text-[#f5f5f5] font-medium py-3 px-6 rounded-xl border border-[#2a2a2a] transition-colors"
          >
            Sign in
          </Link>
        </div>

        <p className="text-xs text-[#555]">
          We only use your uploaded data to generate a taste profile. We never show your raw data. Your identity stays hidden until you match.
        </p>
      </div>
    </main>
  )
}
