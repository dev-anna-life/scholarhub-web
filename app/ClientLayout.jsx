'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Navbar from '../src/components/Navbar'

const publicPages = ['/', '/login', '/signup', '/forgot-password', '/privacy', '/terms']
const noNavPages = ['/', '/login', '/signup', '/onboarding', '/forgot-password', '/admin']

export default function ClientLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  const isPublic = publicPages.includes(pathname) || pathname.startsWith('/reset-password')
  const showNav = !noNavPages.includes(pathname) && !pathname.startsWith('/reset-password')

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true'
    if (isDark) {
      document.documentElement.classList.add('dark')
    }

    const token = localStorage.getItem('token')
    if (!isPublic && !token) {
      setIsAuthorized(false)
      router.replace('/login')
    } else {
      setIsAuthorized(true)
    }
  }, [pathname, isPublic, router])

  if (!isPublic && !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8faf7] dark:bg-[#0f0f10]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <>
      {showNav && <Navbar />}
      {children}
    </>
  )
}
