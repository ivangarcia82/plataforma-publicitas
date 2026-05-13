'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { Toaster } from 'react-hot-toast'
import { HiOutlineBars3 } from 'react-icons/hi2'

// Routes that render as public/full-screen (no sidebar)
const PUBLIC_ROUTES = ['/reviews', '/login']

const toaster = (
  <Toaster
    position="top-right"
    toastOptions={{
      style: {
        background: '#ffffff',
        color: '#1a1a1a',
        border: '1px solid #e8e8ec',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        fontSize: '13px',
      },
    }}
  />
)

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r))

  if (isPublic) {
    return <>{toaster}{children}</>
  }

  return (
    <div className="app-layout">
      {toaster}
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(true)}
      >
        <HiOutlineBars3 />
      </button>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
