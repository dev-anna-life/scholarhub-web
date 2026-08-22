'use client'
import { useState } from 'react'
import { getSchoolLogoUrl, getSchoolAbbr, stringToColor } from '../utils/school'

export default function SchoolLogo({
  school,
  size = 24,
  className = '',
  showBorder = true,
}) {
  const [imgError, setImgError] = useState(false)

  if (!school) return null

  const logoUrl = getSchoolLogoUrl(school)
  const abbr = getSchoolAbbr(school)
  const color = stringToColor(school)

  const sizeStyle = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    minWidth: typeof size === 'number' ? `${size}px` : size,
    minHeight: typeof size === 'number' ? `${size}px` : size,
  }

  const fontSize = typeof size === 'number' ? Math.max(9, Math.floor(size * 0.38)) : 11

  return (
    <div
      style={sizeStyle}
      className={`rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-white ${showBorder ? 'border border-gray-200 dark:border-zinc-700 shadow-xs' : ''} ${className}`}
      title={school}
    >
      {logoUrl && !imgError ? (
        <img
          src={logoUrl}
          alt={school}
          className="w-full h-full object-contain p-0.5 rounded-full"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center font-extrabold text-white uppercase tracking-tighter select-none"
          style={{ backgroundColor: color, fontSize: `${fontSize}px` }}
        >
          {abbr.slice(0, 3)}
        </div>
      )}
    </div>
  )
}
