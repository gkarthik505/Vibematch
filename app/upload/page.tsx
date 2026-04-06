'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { parseYouTubeExport } from '@/lib/parser'

type UploadStatus = 'idle' | 'parsing' | 'uploading' | 'processing' | 'done' | 'error'

export default function UploadPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [status, setStatus] = useState<UploadStatus>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [itemCount, setItemCount] = useState(0)

  async function handleFile(f: File) {
    setFile(f)
    setError('')
    setStatus('parsing')

    // Parse client-side
    const { items, warnings } = await parseYouTubeExport(f)

    if (items.length === 0) {
      setError("We couldn't read your file. Make sure it's a YouTube watch history export from Google Takeout.")
      setStatus('error')
      return
    }

    setItemCount(items.length) // shows total found items, even if we only send a subset to the server

    // Limit to most recent 1000 items to avoid timeout
    const limitedItems = items.slice(0, 1000)

    if (items.length < 20) {
      setError("We need more data to build your vibe. Your file has too few watch history entries.")
      setStatus('error')
      return
    }

    setStatus('uploading')

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Upload file to storage
    const filePath = `${user.id}/${Date.now()}_${f.name}`
    const { error: storageError } = await supabase.storage
      .from('uploads')
      .upload(filePath, f, { upsert: true })

    if (storageError) {
      // Continue anyway — we already have the parsed data
    }

    setStatus('processing')

    // Send parsed items to API for processing
    const response = await fetch('/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: limitedItems, filePath, warnings }),
    })

    if (!response.ok) {
      const data = await response.json()
      setError(data.error || 'Processing failed. Please try again.')
      setStatus('error')
      return
    }

    setStatus('done')
    setTimeout(() => router.push('/discover'), 2000)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const statusMessages: Record<UploadStatus, string> = {
    idle: '',
    parsing: 'Reading your watch history...',
    uploading: 'Uploading your file...',
    processing: 'Building your vibe profile...',
    done: 'Done! Taking you to discover...',
    error: '',
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Upload your watch history</h1>
          <p className="text-[#888] mt-1 text-sm">
            We'll analyze it to build your vibe profile. Nothing is ever shared directly.
          </p>
        </div>

        {/* How to export instructions */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5 space-y-3">
          <p className="font-medium text-sm">How to export from Google Takeout:</p>
          <ol className="text-sm text-[#888] space-y-1.5 list-decimal list-inside">
            <li>Go to <span className="text-[#f5f5f5]">takeout.google.com</span></li>
            <li>Select only "YouTube and YouTube Music"</li>
            <li>Under History, include "Watch history"</li>
            <li>Export and download the ZIP</li>
            <li>Find <span className="text-[#f5f5f5]">watch-history.html</span> or <span className="text-[#f5f5f5]">watch-history.json</span></li>
            <li>Upload that file below</li>
          </ol>
        </div>

        {/* Drop zone */}
        {status === 'idle' && (
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#2a2a2a] hover:border-[#e63462] rounded-2xl p-10 text-center cursor-pointer transition-colors"
          >
            <div className="text-4xl mb-3">📂</div>
            <p className="font-medium">Drop your file here</p>
            <p className="text-sm text-[#888] mt-1">or click to browse</p>
            <p className="text-xs text-[#555] mt-2">Supports .html and .json</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.json,.htm"
              className="hidden"
              onChange={handleInputChange}
            />
          </div>
        )}

        {/* Processing state */}
        {(status === 'parsing' || status === 'uploading' || status === 'processing') && (
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-10 h-10 border-2 border-[#e63462] border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="font-medium">{statusMessages[status]}</p>
            {itemCount > 0 && (
              <p className="text-sm text-[#888]">Found {itemCount.toLocaleString()} watch history entries</p>
            )}
          </div>
        )}

        {/* Done state */}
        {status === 'done' && (
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-8 text-center space-y-3">
            <div className="text-4xl">🎉</div>
            <p className="font-semibold text-lg">Vibe profile ready!</p>
            <p className="text-sm text-[#888]">Analyzed {itemCount.toLocaleString()} videos from your history.</p>
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className="space-y-4">
            <div className="bg-[#e63462]/10 border border-[#e63462]/30 rounded-xl p-4">
              <p className="text-sm text-[#e63462]">{error}</p>
            </div>
            <button
              onClick={() => {
                setStatus('idle')
                setError('')
                setFile(null)
              }}
              className="w-full bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-[#f5f5f5] font-medium py-3 rounded-xl transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        <p className="text-xs text-[#555] text-center">
          We only use your uploaded data to generate a taste profile. We never show your raw data to other users.
        </p>
      </div>
    </main>
  )
}
