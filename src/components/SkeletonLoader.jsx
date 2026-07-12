import React from 'react'

export function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((n) => (
        <div key={n} className="bg-white dark:bg-dark p-5 rounded-2xl border border-gray-100 dark:border-slate-850 space-y-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-800" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-1/4" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-5/6" />
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-2/3" />
          </div>
          <div className="h-40 bg-gray-200 dark:bg-slate-800 rounded-xl w-full" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-5 bg-gray-200 dark:bg-slate-800 rounded w-16" />
            <div className="h-5 bg-gray-200 dark:bg-slate-800 rounded w-16" />
            <div className="h-5 bg-gray-200 dark:bg-slate-800 rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="bg-white dark:bg-dark rounded-2xl p-6 border border-gray-100 dark:border-slate-850 animate-pulse space-y-6">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-slate-800" />
        <div className="h-5 bg-gray-200 dark:bg-slate-800 rounded w-1/3" />
        <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/4" />
      </div>
      <div className="flex justify-center gap-6 py-4 border-y border-gray-100 dark:border-slate-800">
        <div className="text-center space-y-1">
          <div className="h-5 bg-gray-200 dark:bg-slate-800 rounded w-10 mx-auto" />
          <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-12" />
        </div>
        <div className="text-center space-y-1">
          <div className="h-5 bg-gray-200 dark:bg-slate-800 rounded w-10 mx-auto" />
          <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-12" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-5/6" />
      </div>
    </div>
  )
}
