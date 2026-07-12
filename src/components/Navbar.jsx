'use client'
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { MdLeaderboard } from "react-icons/md"
import { HiUserGroup } from "react-icons/hi"
import { FiHome, FiUser, FiSettings, FiMenu, FiX, FiBell, FiSearch, FiPlus, FiGlobe } from "react-icons/fi"
import { BsRobot, BsShop, BsCoin } from "react-icons/bs"
import { FiMessageSquare } from "react-icons/fi"
import Image from "next/image"
import { getMe, getNotifications, markNotificationsRead, followUser } from "../api/auth"

const navLinks = [
  { label: 'Home', icon: FiHome, path: '/feed' },
  { label: 'Community', icon: HiUserGroup, path: '/community' },
  { label: 'Shop', icon: BsShop, path: '/shop' },
  { label: 'Profile', icon: FiUser, path: '/profile' },
  { label: 'Notifications', icon: FiBell, path: '/notifications' },
  { label: 'Leaderboard', icon: MdLeaderboard, path: '/leaderboard' },
  { label: 'Settings', icon: FiSettings, path: '/settings' },
  { label: 'Study Bot', icon: BsRobot, path: '/study-bot' },
  { label: 'Messages', icon: FiMessageSquare, path: '/chat' },
  { label: 'Search', icon: FiSearch, path: '/search' },
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
    const interval = setInterval(fetchNotifs, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNotifClick = async (notif) => {
    setShowNotifDropdown(false)
    if (!notif.read) {
      try {
        await markNotificationsRead()
        setUnreadCount(0)
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      } catch (_) {}
    }
    const from = notif.fromUser || notif.sender
    if (notif.type === 'message') {
      router.push('/chat')
    } else if (notif.type === 'follow') {
      if (from?._id) router.push(`/profile/${from._id}`)
    } else if (notif.type === 'like' || notif.type === 'comment') {
      router.push('/profile')
    } else {
      if (from?._id) router.push(`/profile/${from._id}`)
    }
  }

  const handleFollowBack = async (e, userId) => {
    e.stopPropagation()
    try {
      await followUser(userId)
      setFollowedNotifs(prev => new Set([...prev, userId]))
    } catch (_) {}
  }

  return (
    <>
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 bg-dark text-white px-4 py-8 z-50"
      >
        <div className="flex items-center gap-2 mb-10 px-2">
          <Image src="/scholarhub-logo.svg" alt="ScholarHub" width={32} height={32} className="rounded-full" />
          <h1 className="text-2xl font-extrabold">
            Scholar<span className="text-accent">Hub</span>
          </h1>
        </div>
        {user && (
          <>
            <Link href="/shop" className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 mb-2 mx-2 text-sm text-white hover:bg-white/20 transition">
              <BsCoin size={16} className="text-yellow-400" />
              <span className="font-bold">{user.coins ?? 0}</span>
              <span className="text-gray-400 ml-auto text-xs">Shop</span>
            </Link>
            <div ref={notifRef} className="relative mx-2 mb-4">
              <button onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="flex items-center gap-2 w-full bg-white/5 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/15 transition">
                <FiBell size={16} />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="ml-auto bg-accent text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotifDropdown && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute left-0 top-full mt-2 w-72 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="font-bold text-dark text-sm">Notifications</p>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-400 text-sm">No notifications yet</div>
                      ) : (
                        notifications.map((notif, i) => {
                          const from = notif.fromUser || notif.sender
                          return (
                            <div key={notif._id || i} onClick={() => handleNotifClick(notif)}
                              className={`px-4 py-3 border-b border-gray-50 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition ${!notif.read ? 'bg-primary/5' : ''}`}>
                              <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                                {from?.name?.charAt(0) || 'S'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-dark">
                                  <span className="font-semibold hover:text-primary cursor-pointer">{from?.name?.split(' ')[0] || 'Someone'}</span>
                                  {notif.type === 'follow' ? ' started following you' : notif.type === 'message' ? ' sent you a message' : notif.type === 'like' ? ' liked your post' : notif.type === 'gift' ? ' sent you a gift' : ' commented on your post'}
                                </p>
                                <p className="text-xs text-gray-400 truncate mt-0.5">{notif.type === 'message' || notif.type === 'gift' ? notif.text : notif.post?.title}</p>
                                <p className="text-xs text-gray-300 mt-0.5">
                                  {new Date(notif.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                                </p>
                                {notif.type === 'follow' && from?._id && (
                                  <button onClick={(e) => handleFollowBack(e, from._id)}
                                    className={`mt-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${followedNotifs.has(from._id) ? 'bg-gray-100 text-gray-500' : 'bg-primary text-white hover:opacity-90'}`}>
                                    {followedNotifs.has(from._id) ? 'Following' : 'Follow Back'}
                                  </button>
                                )}
                              </div>
                              {!notif.read && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />}
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
        <nav className="flex flex-col gap-1">
          {navLinks.map(({ label, icon: Icon, path }) => {
            const active = pathname === path
            return (
              <Link
                key={label}
                href={path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:bg-primary/15 hover:text-primary'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>
      </motion.div>

      <div className="md:hidden fixed top-0 left-0 right-0 bg-dark text-white px-4 py-3 flex items-center justify-between z-50 h-12">
        <div className="flex items-center gap-2">
          <Image src="/scholarhub-logo.svg" alt="ScholarHub" width={24} height={24} className="rounded-full" />
          <h1 className="text-lg font-extrabold">
            Scholar<span className="text-accent">Hub</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <>
              <button onClick={() => setShowNotifDropdown(!showNotifDropdown)} className="relative p-1">
                <FiBell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full text-white text-xs flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
              <Link href="/shop" className="flex items-center gap-1 text-sm">
                <BsCoin size={14} className="text-yellow-400" />
                <span className="font-bold">{user.coins ?? 0}</span>
              </Link>
            </>
          )}
          <button onClick={() => setOpen(true)} className="p-1">
            <FiMenu size={20} />
          </button>
        </div>
      </div>

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
              className="md:hidden fixed top-0 left-0 bottom-0 w-72 bg-dark text-white px-5 py-8 z-[1000] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Image src="/scholarhub-logo.svg" alt="ScholarHub" width={28} height={28} className="rounded-full" />
                  <h1 className="text-xl font-extrabold text-white">
                    Scholar<span className="text-accent">Hub</span>
                  </h1>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/10 transition"
                >
                  <FiX size={20} />
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {navLinks.map(({ label, icon: Icon, path }) => {
                  const active = pathname === path
                  return (
                    <Link
                      key={label}
                      href={path}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${active
                        ? 'bg-primary text-white'
                        : 'text-gray-300 hover:text-primary hover:bg-primary/15'
                      }`}
                    >
                      <Icon size={18} />
                      {label}
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-auto pt-6 border-t border-white/10">
                <p className="text-xs text-gray-500 text-center">
                  ScholarHub © 2026
                </p>
                <p className="text-xs text-gray-600 text-center mt-1">
                  Built for African students <FiGlobe size={10} className="inline" />
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark border-t border-white/10 z-50 flex items-center justify-around px-2 py-1.5" style={{ paddingBottom: 'env(safe-area-inset-bottom, 4px)' }}>
        <Link href="/feed" className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${pathname === '/feed' ? 'text-primary font-semibold' : 'text-gray-400 hover:text-gray-200'}`}>
          <FiHome size={21} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/search" className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${pathname === '/search' ? 'text-primary font-semibold' : 'text-gray-400 hover:text-gray-200'}`}>
          <FiSearch size={21} />
          <span className="text-[10px] font-medium">Search</span>
        </Link>
        <Link href="/study-bot" className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${pathname === '/study-bot' ? 'text-primary font-semibold' : 'text-gray-400 hover:text-gray-200'}`}>
          <BsRobot size={21} />
          <span className="text-[10px] font-medium">Study</span>
        </Link>
        {user?.status === 'Current Student' && (
          <Link href="/feed?create=true" className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${pathname.includes('create') ? 'text-primary font-semibold' : 'text-gray-400 hover:text-gray-200'}`}>
            <FiPlus size={21} />
            <span className="text-[10px] font-medium">Create</span>
          </Link>
        )}
        <Link href="/chat" className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${pathname === '/chat' ? 'text-primary font-semibold' : 'text-gray-400 hover:text-gray-200'}`}>
          <FiMessageSquare size={21} />
          <span className="text-[10px] font-medium">Messages</span>
        </Link>
      </nav>
    </>
  )
}

export default Navbar