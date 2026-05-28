/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiAward, FiBookOpen, FiLogOut, FiStar, FiTrash2, FiAlertTriangle } from "react-icons/fi"
import { MdLeaderboard, MdLocalFireDepartment } from "react-icons/md"
import { BsCoin } from "react-icons/bs"
import { GiTrophy } from "react-icons/gi"
import { useRouter } from "next/navigation"
import { getMe, getUserPosts, deletePost } from "../api/auth"

function Profile() {
  const router = useRouter()
  const [user, setUser] = useState({})
  const [activeTab, setActiveTab] = useState('posts')
  const [myPostCount, setMyPostCount] = useState(0)
  const [myPosts, setMyPosts] = useState([])
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [userRes, postsRes] = await Promise.all([getMe(), getUserPosts()])
        setUser(userRes.data)
        localStorage.setItem('user', JSON.stringify(userRes.data))
        setMyPosts(postsRes.data)
        setMyPostCount(postsRes.data.length)
      } catch (error) {
        console.error("Failed to load profile data", error)
      }
    }
    fetchProfileData()
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
  }

  const handleDeletePost = async (postId) => {
    setDeletingId(postId)
    setDeleteError('')
    try {
      await deletePost(postId)
      setMyPosts(prev => prev.filter(p => p._id !== postId))
      setMyPostCount(prev => prev - 1)
      setConfirmDelete(null)
    } catch (error) {
      console.error("Failed to delete post", error)
      setDeleteError(error.response?.data?.message || 'Failed to delete. The API may not support this action.')
    } finally {
      setDeletingId(null)
    }
  }

  const streakDays = [1, 2, 3, 4, 5, 6, 7]
  const currentStreak = user.streak || 0

  const stats = [
    { label: 'Coins', value: user.coins ?? 50, icon: BsCoin, color: 'text-accent' },
    { label: 'Posts', value: myPostCount, icon: FiBookOpen, color: 'text-primary' },
    { label: 'Streak', value: `${currentStreak}/7`, icon: MdLocalFireDepartment, color: 'text-orange-500' },
    { label: 'Rank', value: '#—', icon: GiTrophy, color: 'text-purple-500' },
  ]



  return (
    <div className="min-h-screen bg-light md:pl-56 pt-16 md:pt-0">
      <div className="max-w-3xl mx-auto px-4 py-8">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
          <div className="h-24 bg-gradient-to-r from-dark to-primary relative">
            <div className="absolute -bottom-8 left-6">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold border-4 border-white shadow-lg">
                {user.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
            </div>
          </div>
          <div className="pt-10 px-6 pb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-extrabold text-dark">{user.name || 'Student'}</h2>
                <p className="text-sm text-gray-400">{user.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {user.school && user.state ? `${user.school} • ${user.state}` : user.school || user.state || ''}
                </p>
              </div>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-medium hover:bg-red-100 transition">
                <FiLogOut size={13} /> Logout
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1">
                <FiAward size={11} /> {user.level || 'Student'}
              </span>
              {user.course ? (
                <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1">
                  <FiBookOpen size={11} /> {user.course}
                </span>
              ) : null}
              <span className="bg-accent/10 text-accent text-xs font-semibold px-3 py-1 rounded-full border border-accent/20 flex items-center gap-1">
                <FiStar size={11} /> {(() => {
                  const subs = user.badgeSubscriptions || []
                  const active = subs.filter(s => new Date(s.expiresAt) > new Date())
                  const names = { badge_basic: 'Basic', badge_premium: 'Premium', badge_extra_premium: 'Extra Premium' }
                  const highest = active.sort((a, b) => new Date(b.expiresAt) - new Date(a.expiresAt))[0]
                  return highest ? names[highest.id] || 'Badge' : user.badge || 'Beginner'
                })()}
              </span>
            </div>
            {user.interests?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {user.interests.map(interest => (
                  <span key={interest} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">{interest}</span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-4 border border-gray-100 text-center hover:shadow-md transition-all duration-300">
              <stat.icon size={22} className={`${stat.color} mx-auto mb-2`} />
              <p className={`text-xl font-extrabold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-dark rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white font-bold text-sm flex items-center gap-1.5">
                <MdLocalFireDepartment size={16} className="text-accent" /> Daily Streak
              </p>
              <p className="text-gray-400 text-xs mt-0.5">Post every day to keep your streak alive</p>
            </div>
            <p className="text-accent font-extrabold text-lg">{currentStreak}/7</p>
          </div>
          <div className="flex gap-1.5 mb-2">
            {streakDays.map(d => (
              <div key={d} className={`flex-1 h-2.5 rounded-full transition-all duration-300 ${d <= currentStreak ? 'bg-accent' : 'bg-white/10'}`} />
            ))}
          </div>
          <p className="text-xs mt-2 text-center font-medium">
            {currentStreak >= 7 ? (
              <span className="text-accent">🎉 7-day streak complete! +100 coins earned!</span>
            ) : (
              <span className="text-gray-500">{7 - currentStreak} more {7 - currentStreak === 1 ? 'day' : 'days'} to earn 100 bonus coins!</span>
            )}
          </p>
        </motion.div>

        <div className="flex gap-2 mb-5">
          {[{ id: 'posts', label: 'My Posts', icon: FiBookOpen }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-primary'}`}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'posts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {myPosts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <FiBookOpen size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="font-bold text-dark mb-1">No posts yet</p>
                <p className="text-sm text-gray-400 mb-4">Start sharing your knowledge and earn coins!</p>
                <button onClick={() => router.push('/feed')}
                  className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition">
                  Create your first post
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {myPosts.map((post, i) => (
                  <motion.div key={post._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        post.status === 'approved' ? 'bg-primary/10 text-primary' :
                        post.status === 'rejected' ? 'bg-red-50 text-red-500' :
                        'bg-yellow-50 text-yellow-600'}`}>
                        {post.status === 'approved' ? '✅ Approved' :
                         post.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <button
                          onClick={() => setConfirmDelete(post._id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-dark text-sm mb-1">{post.title}</h3>
                    <p className="text-gray-500 text-xs line-clamp-2">{post.content}</p>
                    <div className="mt-2">
                      <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{post.category}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}


      </div>
      
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
            onClick={() => { setConfirmDelete(null); setDeleteError('') }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiAlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className="font-extrabold text-dark text-lg text-center mb-2">Delete Post?</h3>
              <p className="text-gray-400 text-sm text-center mb-6">This action cannot be undone. The post will be permanently deleted.</p>
              {deleteError && <p className="text-red-500 text-xs text-center mb-4">{deleteError}</p>}
              <div className="flex gap-3">
                <button onClick={() => { setConfirmDelete(null); setDeleteError('') }}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-dark hover:border-gray-300 transition">
                  Cancel
                </button>
                <button
                  onClick={() => handleDeletePost(confirmDelete)}
                  disabled={deletingId === confirmDelete}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50">
                  {deletingId === confirmDelete ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Profile