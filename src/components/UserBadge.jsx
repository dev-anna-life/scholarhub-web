import React from 'react'
import { FiAward, FiShield } from 'react-icons/fi'

export default function UserBadge({ user, className = '' }) {
  if (!user) return null

  // 1. Official Bot / Institution Badge
  if (user.isOfficial || user.isBot || user.isAdmin) {
    return (
      <span
        className={`inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${className}`}
        title="Official ScholarHub Account"
      >
        <FiShield size={10} />
        <span>Official</span>
      </span>
    )
  }

  // 2. Upgraded Pro Scholar Badge
  if (user.isPro || user.isUpgraded || user.badge === 'Pro Scholar' || user.level === 'Pro Scholar') {
    return (
      <span
        className={`inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/30 px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-xs ${className}`}
        title="Verified Pro Scholar"
      >
        <FiAward size={10} />
        <span>Pro Scholar</span>
      </span>
    )
  }

  // Basic verified email users receive no public badge overlay to preserve badge prestige for upgraded accounts
  return null
}
