'use client'
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { MdLeaderboard } from "react-icons/md"
import { HiUserGroup } from "react-icons/hi"
import { FiHome, FiUser, FiSettings, FiMenu, FiX, FiBell, FiSearch, FiGlobe, FiLock, FiFileText, FiLogOut } from "react-icons/fi"
import { BsRobot, BsShop, BsCoin } from "react-icons/bs"
import { FiMessageSquare } from "react-icons/fi"
import Image from "next/image"
import { getMe, getNotifications, markNotificationsRead, followUser } from "../api/auth"

const mainLinks = [
  { label: 'Home', icon: FiHome, path: '/feed' },
  { label: 'Community', icon: HiUserGroup, path: '/community' },
  { label: 'Leaderboard', icon: MdLeaderboard, path: '/leaderboard' },
  { label: 'Chat', icon: FiMessageSquare, path: '/chat', hasRedBadge: true },
  { label: 'Profile', icon: FiUser, path: '/profile' },
]

const moreLinks = [
  { label: 'Notifications', icon: FiBell, path: '/notifications', hasRedBadge: true },
  { label: 'Find People', icon: FiSearch, path: '/search' },
  { label: 'Coin Shop', icon: BsShop, path: '/shop' },
  { label: 'Settings', icon: FiSettings, path: '/settings' },
  { label: 'Study Bot', icon: BsRobot, path: '/study-bot' },
  { label: 'Privacy', icon: FiLock, path: '/privacy' },
  { label: 'Terms', icon: FiFileText, path: '/terms' },
]

function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const [followedNotifs, setFollowedNotifs] = useState(new Set())
  const prevUnreadRef = useRef(0)
  const notifRef = useRef(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      getMe().then(r => setUser(r.data)).catch(() => {})
    }
  }, [pathname.split('/').slice(0, 2).join('/')])

  useEffect(() => {
    const handleUserStateChange = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('user') || '{}')
        if (stored && stored.coins !== undefined) {
          setUser(prev => ({ ...prev, ...stored }))
        }
      } catch (_) {}
    }
    window.addEventListener('userStateChange', handleUserStateChange)
    return () => window.removeEventListener('userStateChange', handleUserStateChange)
  }, [])

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await getNotifications()
        const list = res.data?.notifications || res.data || []
        const newUnread = list.filter(n => !n.read).length
        setNotifications(list)
        setUnreadCount(newUnread)
        prevUnreadRef.current = newUnread
      } catch (_) {}
    }
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotifClick = async (notif) => {
    try {
      await markNotificationsRead([notif._id])
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (_) {}
    setShowNotifDropdown(false)

    const from = notif.fromUser || notif.sender
    const fromId = from?.id || from?._id
    const postId = notif.post?.id || notif.post?._id || notif.postId
    if (notif.type === 'message') {
      router.push(fromId ? `/chat?user=${fromId}` : '/chat')
    } else if (notif.type === 'follow') {
      if (fromId) router.push(`/profile/${fromId}`)
    } else if (notif.type === 'like' || notif.type === 'comment') {
      if (postId) router.push(`/post/${postId}`)
      else router.push('/feed')
    } else if (notif.type === 'gift') {
      router.push('/profile')
    } else {
      if (postId) router.push(`/post/${postId}`)
      else router.push('/feed')
    }
  }

  const handleFollowBack = async (e, userId) => {
    e.stopPropagation()
    try {
      await followUser(userId)
      setFollowedNotifs(prev => new Set([...prev, userId]))
    } catch (_) {}
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <>
      {/* Desktop Sidebar — Clean Theme Adaptive (Matching Images 2 & 3) */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 bg-white dark:bg-[#121212] text-dark dark:text-white border-r border-gray-100 dark:border-white/10 px-4 py-8 z-50 shadow-xs"
      >
        {/* Brand Logo */}
        <div className="flex items-center gap-2 mb-8 px-2">
          <Image src="/scholarhub-logo.svg" alt="ScholarHub" width={32} height={32} className="rounded-full" />
          <h1 className="text-2xl font-extrabold text-dark dark:text-white">
            Scholar<span className="text-primary">Hub</span>
          </h1>
        </div>

        {user && (
          <>
            {/* Shop & Coin button */}
            <Link href="/shop" className="flex items-center gap-2 bg-gray-100 dark:bg-white/10 rounded-xl px-3 py-2 mb-2 mx-1 text-sm text-dark dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition font-semibold">
              <BsCoin size={16} className="text-amber-500" />
              <span className="font-bold">{user.coins ?? 0}</span>
              <span className="text-gray-400 dark:text-gray-400 ml-auto text-xs font-normal">Shop</span>
            </Link>

            {/* Notifications Dropdown trigger — RED BADGE FOR UNREAD */}
            <div ref={notifRef} className="relative mx-1 mb-4">
              <button onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="flex items-center gap-2.5 w-full bg-gray-100 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-dark dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition font-semibold">
                <FiBell size={16} className="text-gray-600 dark:text-gray-300" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifDropdown && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-[#1e1e22] border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                      <p className="font-bold text-dark dark:text-white text-sm">Notifications</p>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-400 text-sm">No notifications yet</div>
                      ) : (
                        notifications.map((notif, i) => {
                          const from = notif.fromUser || notif.sender
                          return (
                            <div key={notif._id || i} onClick={() => handleNotifClick(notif)}
                              className={`px-4 py-3 border-b border-gray-50 dark:border-white/5 flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition ${!notif.read ? 'bg-red-500/5 dark:bg-red-500/10' : ''}`}>
                              <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                                {from?.name?.charAt(0) || 'S'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-dark dark:text-white">
                                  <span className="font-semibold hover:text-primary cursor-pointer">{from?.name?.split(' ')[0] || 'Someone'}</span>
                                  {notif.type === 'follow' ? ' started following you' : notif.type === 'message' ? ' sent you a message' : notif.type === 'like' ? ' liked your post' : notif.type === 'gift' ? ' sent you a gift' : ' commented on your post'}
                                </p>
                                <p className="text-xs text-gray-400 truncate mt-0.5">{notif.type === 'message' || notif.type === 'gift' ? notif.text : notif.post?.title}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  {new Date(notif.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                                </p>
                              </div>
                              {!notif.read && <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1" />}
                            </div>
                          )
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Navigation Items (Clean X / Facebook style as in Images 2 & 3) */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-6 scrollbar-thin mt-2">
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">Main</p>
            <nav className="flex flex-col gap-1">
              {mainLinks.map(({ label, icon: Icon, path, hasRedBadge }) => {
                const active = pathname === path
                return (
                  <Link
                    key={label}
                    href={path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${active
                      ? 'bg-primary/10 text-primary font-extrabold dark:bg-white/10 dark:text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-dark dark:hover:text-white'
                    }`}
                  >
                    <Icon size={19} className={active ? 'text-primary dark:text-white' : ''} />
                    <span>{label}</span>
                    {hasRedBadge && label === 'Chat' && unreadCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">More</p>
            <nav className="flex flex-col gap-1">
              {moreLinks.map(({ label, icon: Icon, path, hasRedBadge }) => {
                const active = pathname === path
                return (
                  <Link
                    key={label}
                    href={path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${active
                      ? 'bg-primary/10 text-primary font-extrabold dark:bg-white/10 dark:text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-dark dark:hover:text-white'
                    }`}
                  >
                    <Icon size={19} className={active ? 'text-primary dark:text-white' : ''} />
                    <span>{label}</span>
                    {hasRedBadge && unreadCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                )
              })}
              <div className="border-t border-gray-100 dark:border-white/10 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-all duration-200 text-left w-full cursor-pointer"
                >
                  <FiLogOut size={19} />
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </div>
      </motion.div>

      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-[#121212] text-dark dark:text-white px-4 py-3 flex items-center justify-between z-50 h-14 border-b border-gray-100 dark:border-white/10">
        <Link href="/feed" className="flex items-center gap-2 active:opacity-80">
          <Image src="/scholarhub-logo.svg" alt="ScholarHub" width={26} height={26} className="rounded-full" />
          <h1 className="text-lg font-extrabold text-dark dark:text-white">
            Scholar<span className="text-primary">Hub</span>
          </h1>
        </Link>
        <div className="flex items-center gap-3">
          {user && (
            <>
              {/* Notification icon button with RED BADGE */}
              <button onClick={() => setShowNotifDropdown(!showNotifDropdown)} className="relative p-1.5 text-dark dark:text-white">
                <FiBell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <Link href="/shop" className="flex items-center gap-1 text-sm font-bold text-dark dark:text-white">
                <BsCoin size={15} className="text-amber-500" />
                <span>{user.coins ?? 0}</span>
              </Link>
            </>
          )}
          <button onClick={() => setOpen(true)} className="p-1.5 text-dark dark:text-white">
            <FiMenu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 bg-black/60 z-[999]"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="md:hidden fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-[#121212] text-dark dark:text-white px-5 py-8 z-[1000] flex flex-col shadow-2xl border-r border-gray-100 dark:border-white/10"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Image src="/scholarhub-logo.svg" alt="ScholarHub" width={28} height={28} className="rounded-full" />
                  <h1 className="text-xl font-extrabold text-dark dark:text-white">
                    Scholar<span className="text-primary">Hub</span>
                  </h1>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-6 mt-2 scrollbar-thin">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">Main</p>
                  <nav className="flex flex-col gap-1">
                    {mainLinks.map(({ label, icon: Icon, path, hasRedBadge }) => {
                      const active = pathname === path
                      return (
                        <Link
                          key={label}
                          href={path}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${active
                            ? 'bg-primary/10 text-primary font-bold dark:bg-white/10 dark:text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-dark dark:hover:text-white'
                          }`}
                        >
                          <Icon size={19} className={active ? 'text-primary dark:text-white' : ''} />
                          <span>{label}</span>
                          {hasRedBadge && label === 'Chat' && unreadCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </nav>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">More</p>
                  <nav className="flex flex-col gap-1">
                    {moreLinks.map(({ label, icon: Icon, path, hasRedBadge }) => {
                      const active = pathname === path
                      return (
                        <Link
                          key={label}
                          href={path}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${active
                            ? 'bg-primary/10 text-primary font-bold dark:bg-white/10 dark:text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-dark dark:hover:text-white'
                          }`}
                        >
                          <Icon size={19} className={active ? 'text-primary dark:text-white' : ''} />
                          <span>{label}</span>
                          {hasRedBadge && unreadCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                    <div className="border-t border-gray-100 dark:border-white/10 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-all duration-200 text-left w-full"
                      >
                        <FiLogOut size={19} />
                        Logout
                      </button>
                    </div>
                  </nav>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar