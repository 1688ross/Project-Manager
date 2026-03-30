import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navigation from '@/components/common/Navigation'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Creative Project Manager',
  description: 'Project management app for creative teams',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-gray-100 min-h-screen`}>
        <Navigation />
        {children}
      </body>
    </html>
  )
}
