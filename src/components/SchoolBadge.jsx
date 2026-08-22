'use client'
import SchoolLogo from './SchoolLogo'

export default function SchoolBadge({
  school,
  state,
  level,
  size = 'md',
  variant = 'pill',
  className = '',
}) {
  if (!school) return null

  const logoSize = size === 'sm' ? 18 : size === 'lg' ? 32 : 22

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1.5 min-w-0 max-w-full text-xs text-gray-500 dark:text-gray-400 ${className}`}>
        <SchoolLogo school={school} size={logoSize} />
        <span className="truncate font-medium">{school}</span>
        {state && <span className="opacity-70 flex-shrink-0">• {state}</span>}
      </span>
    )
  }

  return (
    <div
      className={`inline-flex items-center gap-2 max-w-full bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/60 rounded-xl px-2.5 py-1.5 transition ${className}`}
    >
      <SchoolLogo school={school} size={logoSize} />
      <div className="min-w-0 flex-1 flex flex-col">
        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate leading-tight">
          {school}
        </span>
        {(state || level) && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium truncate">
            {state && level ? `${state} • ${level}` : state || level}
          </span>
        )}
      </div>
    </div>
  )
}
