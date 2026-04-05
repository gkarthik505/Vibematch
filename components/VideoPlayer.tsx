'use client'

import { useState } from 'react'

interface Props {
  videoId: string
  title?: string
  autoplay?: boolean
}

export default function VideoPlayer({ videoId, title, autoplay = false }: Props) {
  const [errored, setErrored] = useState(false)
  const [loaded, setLoaded] = useState(false)

  if (!videoId) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#141414] text-[#555] text-sm">
        Video unavailable
      </div>
    )
  }

  const src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&mute=1${autoplay ? '&autoplay=1' : ''}`

  if (errored) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#141414] text-center p-4 gap-3">
        <span className="text-3xl">📵</span>
        <p className="text-sm text-[#888]">This video is unavailable</p>
        {title && <p className="text-xs text-[#555] truncate max-w-full">{title}</p>}
      </div>
    )
  }

  return (
    <div className="absolute inset-0 bg-black">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#141414]">
          <div className="w-8 h-8 border-2 border-[#e63462] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <iframe
        src={src}
        title={title || videoId}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  )
}
