import React from 'react'

export default function EmptyState({ icon = '📭', title = 'No content found', description = 'Check back later or try creating a new post.' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-dark border border-gray-100 dark:border-slate-850 rounded-2xl space-y-3 max-w-md mx-auto my-6 shadow-sm">
      <div className="text-5xl animate-bounce">{icon}</div>
      <h3 className="text-lg font-bold text-dark dark:text-white">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}
