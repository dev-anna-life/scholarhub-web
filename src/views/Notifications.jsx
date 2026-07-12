'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiBell, FiUserPlus, FiMessageCircle, FiHeart, FiGift, FiChevronLeft } from 'react-icons/fi'
import { getNotifications, markNotificationsRead, followUser } from '../api/auth'

export default function NotificationsView() {
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [followedUsers, setFollowedUsers] = useState(new Set())

  useEffect(() => {
    fetchNotifs()
  }, [])

  const fetchNotifs = async () => {
    try {
      const res = await getNotifications()
      const list = res.data?.notifications || res.data || []
      setNotifications(list)
      const unread = list.filter(n => !n.read)
      if (unread.length > 0) {
        await markNotificationsRead()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFollowBack = async (userId) => {
    try {
      await followUser(userId)
      setFollowedUsers(prev => new Set([...prev, userId]))
    } catch (_) {}
  }

  const handleNotifClick = (notif) => {
    const from = notif.fromUser || notif.sender
    if (notif.type === 'message') {
      router.push('/chat')
    } else if (from?._id) {
      router.push(`/profile/${from._id}`)
    }
  }

  return (
    <div className="min-h-screen bg-light md:pl-56 pt-16 md:pt-6 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 bg-white dark:bg-dark rounded-xl border border-gray-150 dark:border-slate-800 text-dark dark:text-white hover:opacity-80 transition">
            <FiChevronLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-dark dark:text-white flex items-center gap-2">
            <FiBell size={20} className="text-primary" /> Notifications
          </h1>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-16 bg-white dark:bg-dark border border-gray-100 dark:border-slate-850 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-dark border border-gray-100 dark:border-slate-850 rounded-2xl space-y-3 shadow-sm">
            <div className="text-5xl animate-bounce">🔔</div>
            <h3 className="text-lg font-bold text-dark dark:text-white">All caught up!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">No notifications yet. When you receive updates, they will appear here.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-dark border border-gray-100 dark:border-slate-850 rounded-2xl divide-y divide-gray-50 dark:divide-slate-800 shadow-sm overflow-hidden">
            {notifications.map((notif, i) => {
              const from = notif.fromUser || notif.sender
              return (
                <div key={notif._id || i} onClick={() => handleNotifClick(notif)}
                  className="p-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-slate-900/10 transition">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                    {from?.name?.charAt(0) || 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-dark dark:text-white">
                      <span className="font-semibold">{from?.name || 'Someone'}</span>
                      {notif.type === 'follow' ? ' started following you' : notif.type === 'message' ? ' sent you a message' : notif.type === 'like' ? ' liked your post' : notif.type === 'gift' ? ' sent you a gift' : ' commented on your post'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                      {notif.type === 'message' || notif.type === 'gift' ? notif.text : notif.post?.title}
                    </p>
                    <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">
                      {new Date(notif.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {notif.type === 'follow' && from?._id && (
                      <button onClick={(e) => { e.stopPropagation(); handleFollowBack(from._id) }}
                        className={`mt-2 px-3 py-1 rounded-lg text-xs font-semibold transition ${followedUsers.has(from._id) ? 'bg-gray-150 text-gray-500' : 'bg-primary text-white hover:opacity-90'}`}>
                        {followedUsers.has(from._id) ? 'Following' : 'Follow Back'}
                      </button>
                    )}
                  </div>
                  {!notif.read && <span className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0 mt-1.5" />}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
