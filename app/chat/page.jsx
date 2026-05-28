'use client'
import { Suspense } from 'react'
import Chat from '../../src/pages/Chat'

function ChatFallback() {
  return (
    <div className="min-h-screen bg-light md:pl-56 pt-16 md:pt-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading messages...</p>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<ChatFallback />}>
      <Chat />
    </Suspense>
  )
}
