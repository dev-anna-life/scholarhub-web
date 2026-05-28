/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FiStar, FiBookOpen, FiUsers, FiAward } from "react-icons/fi"
import { MdLocalFireDepartment } from "react-icons/md"
import { BsCoin } from "react-icons/bs"
import { GiTrophy } from "react-icons/gi"
import { RiVipCrownLine } from "react-icons/ri"
import { getMe, getUserPosts } from "../api/auth"

function Achievements() {
  const [user, setUser] = useState({})
  const [myPosts, setMyPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, postsRes] = await Promise.all([getMe(), getUserPosts()])
        setUser(userRes.data)
        setMyPosts(postsRes.data)
        localStorage.setItem('user', JSON.stringify(userRes.data))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const approvedPosts = myPosts.filter(p => p.status === 'approved')
  const currentStreak = user.streak || 0
  const coins = user.coins || 0
  const totalLikes = approvedPosts.reduce((acc, p) => acc + (p.likes?.length || 0), 0)

  const achievements = [
    {
      id: 1,
      icon: FiStar,
      title: 'Welcome Scholar!',
      desc: 'Joined ScholarHub',
      category: 'Milestone',
      earned: true,
      progress: 100,
      progressText: 'Completed',
      color: 'text-primary',
      bg: 'bg-primary/10',
      reward: '50 coins',
    },
    {
      id: 2,
      icon: BsCoin,
      title: 'First Coins',
      desc: 'Earned your first 50 coins',
      category: 'Coins',
      earned: coins >= 50,
      progress: Math.min((coins / 50) * 100, 100),
      progressText: `${coins}/50 coins`,
      color: 'text-accent',
      bg: 'bg-accent/10',
      reward: 'Badge unlock',
    },
    {
      id: 3,
      icon: FiBookOpen,
      title: 'First Post',
      desc: 'Submitted your first post',
      category: 'Content',
      earned: myPosts.length >= 1,
      progress: Math.min((myPosts.length / 1) * 100, 100),
      progressText: `${myPosts.length}/1 post`,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      reward: '50 coins',
    },
    {
      id: 4,
      icon: FiBookOpen,
      title: 'Content Creator',
      desc: 'Had 5 posts approved',
      category: 'Content',
      earned: approvedPosts.length >= 5,
      progress: Math.min((approvedPosts.length / 5) * 100, 100),
      progressText: `${approvedPosts.length}/5 approved`,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      reward: '100 coins',
    },
    {
      id: 5,
      icon: MdLocalFireDepartment,
      title: '7-Day Streak',
      desc: 'Posted for 7 consecutive days',
      category: 'Streak',
      earned: currentStreak >= 7,
      progress: Math.min((currentStreak / 7) * 100, 100),
      progressText: `${currentStreak}/7 days`,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
      reward: '100 coins',
    },
    {
      id: 6,
      icon: MdLocalFireDepartment,
      title: 'On Fire!',
      desc: 'Maintained a 30-day streak',
      category: 'Streak',
      earned: currentStreak >= 30,
      progress: Math.min((currentStreak / 30) * 100, 100),
      progressText: `${currentStreak}/30 days`,
      color: 'text-red-500',
      bg: 'bg-red-50',
      reward: '500 coins',
    },
    {
      id: 7,
      icon: FiAward,
      title: 'Liked Scholar',
      desc: 'Received 10 total likes',
      category: 'Engagement',
      earned: totalLikes >= 10,
      progress: Math.min((totalLikes / 10) * 100, 100),
      progressText: `${totalLikes}/10 likes`,
      color: 'text-pink-500',
      bg: 'bg-pink-50',
      reward: '50 coins',
    },
    {
      id: 8,
      icon: RiVipCrownLine,
      title: 'Community Leader',
      desc: 'Received 100 total likes',
      category: 'Engagement',
      earned: totalLikes >= 100,
      progress: Math.min((totalLikes / 100) * 100, 100),
      progressText: `${totalLikes}/100 likes`,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
      reward: '200 coins',
    },
    {
      id: 9,
      icon: GiTrophy,
      title: 'Rising Scholar',
      desc: 'Reached 500 coins',
      category: 'Coins',
      earned: coins >= 500,
      progress: Math.min((coins / 500) * 100, 100),
      progressText: `${coins}/500 coins`,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50',
      reward: 'Gold badge',
    },
    {
      id: 10,
      icon: GiTrophy,
      title: 'Top Scholar',
      desc: 'Reached 1,000 coins',
      category: 'Coins',
      earned: coins >= 1000,
      progress: Math.min((coins / 1000) * 100, 100),
      progressText: `${coins}/1000 coins`,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      reward: 'Elite badge',
    },
    {
      id: 11,
      icon: FiUsers,
      title: 'School Rep',
      desc: 'First from your school to post',
      category: 'Milestone',
      earned: false,
      progress: 0,
      progressText: 'Keep posting!',
      color: 'text-teal-500',
      bg: 'bg-teal-50',
      reward: '150 coins',
    },
    {
      id: 12,
      icon: FiUsers,
      title: 'Pan-African Scholar',
      desc: 'Connected with students from 3+ countries',
      category: 'Community',
      earned: false,
      progress: 0,
      progressText: 'Engage with posts!',
      color: 'text-green-600',
      bg: 'bg-green-50',
      reward: '300 coins',
    },
  ]

  const earned = achievements.filter(a => a.earned)
  const categories = ['All', 'Milestone', 'Content', 'Streak', 'Engagement', 'Coins', 'Community']
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = achievements.filter(a =>
    activeCategory === 'All' || a.category === activeCategory
  )

  return (
    <div className="min-h-screen bg-light md:pl-56 pt-16 md:pt-0">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FiAward size={28} className="text-accent" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-dark">Achievements</h1>
          <p className="text-gray-400 text-sm mt-1">Track your progress and unlock rewards</p>
        </motion.div>

        {/* Progress summary */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark rounded-2xl p-5 mb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white font-bold text-sm">Your Progress</p>
                <p className="text-gray-400 text-xs mt-0.5">{earned.length} of {achievements.length} achievements unlocked</p>
              </div>
              <p className="text-accent font-extrabold text-2xl">{earned.length}/{achievements.length}</p>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(earned.length / achievements.length) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-2.5 bg-accent rounded-full"
              />
            </div>
            <div className="flex gap-4 mt-4 flex-wrap">
              {[
                { label: 'Coins', value: coins, icon: BsCoin, color: 'text-accent' },
                { label: 'Posts', value: myPosts.length, icon: FiBookOpen, color: 'text-primary' },
                { label: 'Streak', value: `${currentStreak}d`, icon: MdLocalFireDepartment, color: 'text-orange-400' },
                { label: 'Likes', value: totalLikes, icon: FiAward, color: 'text-pink-400' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <s.icon size={13} className={s.color} />
                  <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-gray-500 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Achievements grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading achievements...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl p-4 border transition-all duration-300 ${
                  a.earned
                    ? 'bg-white border-primary/20 hover:shadow-md hover:-translate-y-0.5'
                    : 'bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    a.earned ? a.bg : 'bg-gray-200'
                  }`}>
                    <a.icon
                      size={20}
                      className={a.earned ? a.color : 'text-gray-400'}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`font-bold text-sm ${a.earned ? 'text-dark' : 'text-gray-400'}`}>
                        {a.title}
                      </p>
                      {a.earned && (
                        <span className="text-xs text-primary font-semibold flex items-center gap-0.5">
                          <FiStar size={10} /> Done
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mb-2 ${a.earned ? 'text-gray-500' : 'text-gray-400'}`}>
                      {a.desc}
                    </p>

                    {/* Progress bar */}
                    {!a.earned && (
                      <>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                          <div
                            className="h-1.5 bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${a.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400">{a.progressText}</p>
                      </>
                    )}

                    {/* Reward */}
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        a.earned ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {a.category}
                      </span>
                      <span className={`text-xs font-semibold ${a.earned ? 'text-accent' : 'text-gray-300'}`}>
                        🎁 {a.reward}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Achievements