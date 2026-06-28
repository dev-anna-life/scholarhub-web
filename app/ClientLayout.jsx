'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from '../src/components/Navbar'

import { Toaster } from 'react-hot-toast'

const noNavPages = ['/', '/login', '/signup', '/onboarding', '/forgot-password', '/admin']

export default function ClientLayout({ children }) {
  const pathname = usePathname()
  const showNav = !noNavPages.includes(pathname) && !pathname.startsWith('/reset-password')

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true'
    if (isDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      {showNav && <Navbar />}
      {children}
    </>
  )
}
