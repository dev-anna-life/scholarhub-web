export function formatRelativeTime(dateInput) {
  if (!dateInput) return ''

  // Try to parse the date — handle string, number, or Date object
  let date
  if (dateInput instanceof Date) {
    date = dateInput
  } else if (typeof dateInput === 'string') {
    // Ensure timezone is handled — if no Z or offset, treat as UTC
    const raw = dateInput.trim()
    date = new Date(raw.includes('T') && !raw.endsWith('Z') && !raw.includes('+') ? raw + 'Z' : raw)
  } else {
    date = new Date(dateInput)
  }

  if (!date || isNaN(date.getTime())) return ''

  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  // If date is in the future or just now
  if (diffInSeconds < 45) return 'Just now'

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) return `${diffInMonths}mo ago`

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears}y ago`
}
