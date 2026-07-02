import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AfterPlot - Track Your Series',
  description: 'The ritual of tracking your favorite TV shows with precision and emotion.',
  openGraph: {
    title: 'AfterPlot',
    description: 'Track your favorite TV shows with precision and emotion.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-afterplot-light text-afterplot-blue font-sans">
        {children}
      </body>
    </html>
  )
}
