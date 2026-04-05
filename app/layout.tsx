import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VibeMatch — Find your vibe',
  description: 'Discover people through what they watch, not what they look like.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] antialiased">
        {children}
      </body>
    </html>
  )
}
