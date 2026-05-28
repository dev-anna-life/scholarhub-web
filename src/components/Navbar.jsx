/* eslint-disable no-unused-vars */
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MdLeaderboard } from "react-icons/md"
import { HiUserGroup } from "react-icons/hi"
import { FiHome, FiUser, FiAward, FiSettings, FiMenu, FiX } from "react-icons/fi"
import { BsRobot } from "react-icons/bs"
import { FiMessageSquare } from "react-icons/fi"

const navLinks = [
  { label: 'Home', icon: FiHome, path: '/feed' },
  { label: 'Community', icon: HiUserGroup, path: '/community' },
  { label: 'Profile', icon: FiUser, path: '/profile' },
  { label: 'Leaderboard', icon: MdLeaderboard, path: '/leaderboard' },
  { label: 'Achievements', icon: FiAward, path: '/achievements' },
  { label: 'Settings', icon: FiSettings, path: '/settings' },
  { label: 'Study Bot', icon: BsRobot, path: '/study-bot' },
  { label: 'Messages', icon: FiMessageSquare, path: '/chat' },
]

function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 bg-dark text-white px-4 py-8 z-50"
      >
        <h1 className="text-2xl font-extrabold mb-10 px-2">
          Scholar<span className="text-accent">Hub</span>
        </h1>
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
        <h1 className="text-lg font-extrabold">
          Scholar<span className="text-accent">Hub</span>
        </h1>
        <button onClick={() => setOpen(true)} className="p-1">
          <FiMenu size={20} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 bg-black/60 z-50"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="md:hidden fixed top-0 left-0 bottom-0 w-72 bg-dark text-white px-5 py-8 z-50 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-extrabold text-white">
                  Scholar<span className="text-accent">Hub</span>
                </h1>
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
                  Built for African students 🌍
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar