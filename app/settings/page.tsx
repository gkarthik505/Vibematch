'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [deleting, setDeleting] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    const res = await fetch('/api/profile/delete', { method: 'DELETE' })
    if (res.ok) {
      router.push('/')
    } else {
      setDeleting(false)
      alert('Failed to delete account. Please try again.')
    }
  }

  return (
    <main className="min-h-screen max-w-md mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Link href="/discover" className="text-sm text-[#888] hover:text-[#f5f5f5]">
          Back
        </Link>
      </div>

      {/* Privacy notice */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5 space-y-2">
        <h2 className="font-semibold text-sm">Privacy</h2>
        <p className="text-xs text-[#888]">
          We only use your uploaded data to generate a taste profile. We never show your raw data to other users. Your identity stays hidden until you match.
        </p>
      </div>

      {/* Account actions */}
      <div className="space-y-3">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full bg-[#141414] hover:bg-[#1e1e1e] border border-[#2a2a2a] text-[#f5f5f5] font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          {signingOut ? 'Signing out...' : 'Sign out'}
        </button>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full bg-transparent hover:bg-red-950/20 border border-red-900/50 text-red-400 font-medium py-3 rounded-xl transition-colors"
          >
            Delete my account
          </button>
        ) : (
          <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-4 space-y-3">
            <p className="text-sm text-red-400 font-medium">Are you sure?</p>
            <p className="text-xs text-[#888]">
              This will permanently delete your profile, uploaded files, activity data, and all matches. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-[#141414] border border-[#2a2a2a] text-[#f5f5f5] text-sm font-medium py-2.5 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 bg-red-700 hover:bg-red-600 text-white text-sm font-medium py-2.5 rounded-xl disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, delete everything'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <Link href="/admin" className="text-xs text-[#555] hover:text-[#888]">
          Admin panel
        </Link>
      </div>
    </main>
  )
}
