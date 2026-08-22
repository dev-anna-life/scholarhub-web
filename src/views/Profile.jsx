'use client'
/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiAward, FiBookOpen, FiLogOut, FiStar, FiTrash2, FiAlertTriangle, FiCheck, FiX, FiClock, FiUserCheck, FiUserPlus, FiCamera } from "react-icons/fi"
import { MdLeaderboard, MdLocalFireDepartment } from "react-icons/md"
import { BsCoin } from "react-icons/bs"
import { GiTrophy } from "react-icons/gi"
import { useRouter } from "next/navigation"
import { getMe, getUserPosts, deletePost, getUserById, followUser, updateProfile } from "../api/auth"
import { getSchoolLogo } from "../data/schools"
import SchoolBadge from "../components/SchoolBadge"
import SchoolLogo from "../components/SchoolLogo"

function Profile() {
  const router = useRouter()
  const [user, setUser] = useState({})
  const avatarInputRef = useRef(null)
  const [activeTab, setActiveTab] = useState('posts')
  const [myPostCount, setMyPostCount] = useState(0)
  const [myPosts, setMyPosts] = useState([])
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [hoveredUserId, setHoveredUserId] = useState(null)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [userRes, postsRes] = await Promise.all([getMe(), getUserPosts().catch(() => ({ data: [] }))])
        const userData = userRes.data
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        const fetchedPosts = Array.isArray(postsRes.data) ? postsRes.data : (postsRes.data?.posts || [])
        setMyPosts(fetchedPosts)
        setMyPostCount(fetchedPosts.length)
        
        try {
          const detailRes = await getUserById(userData.id)
          setFollowers(detailRes.data.followers || [])
          setFollowing(detailRes.data.following || [])
          setFollowersCount(detailRes.data.followersCount || 0)
          setFollowingCount(detailRes.data.followingCount || 0)
        } catch (err) {
          console.error("Failed to load follower details", err)
        }
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

  const handleListFollow = async (targetUserId) => {
    try {
      await followUser(targetUserId)
      const detailRes = await getUserById(user.id)
      if (detailRes.data) {
        setFollowers(detailRes.data.followers || [])
        setFollowing(detailRes.data.following || [])
        setFollowersCount(detailRes.data.followersCount || 0)
        setFollowingCount(detailRes.data.followingCount || 0)
      }
    } catch (err) {
      console.error("Failed to toggle follow", err)
    }
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
    { label: 'Scholar Score', value: `${user.scholarScore ?? 0} pts`, icon: FiAward, color: 'text-emerald-600' },
    { label: 'Coins', value: user.coins ?? 50, icon: BsCoin, color: 'text-accent' },
    { label: 'Posts', value: myPostCount, icon: FiBookOpen, color: 'text-primary' },
    { label: 'Streak', value: `${currentStreak}/7`, icon: MdLocalFireDepartment, color: 'text-orange-500' },
  ]



function compressImage(file, maxDimension = 300, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const compressedBase64 = await compressImage(file)
      const res = await updateProfile({ avatar: compressedBase64 })
      const updated = res.data?.user || res.data
      setUser(updated)
      localStorage.setItem('user', JSON.stringify(updated))
      window.dispatchEvent(new Event('userStateChange'))
    } catch (err) {
      console.error('Failed to update avatar', err)
    }
  }

  const [showImageModal, setShowImageModal] = useState(null)

  return (
    <div className="min-h-screen bg-light md:pl-56 pt-16 md:pt-0 pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 overflow-hidden mb-6 shadow-xs">
          <div className="h-28 sm:h-32 bg-gradient-to-r from-emerald-800 via-dark to-primary relative" />

          <div className="px-4 sm:px-6 pb-6 text-center -mt-14 sm:-mt-16">
            <div className="flex flex-col items-center">
              <div className="relative mb-3 inline-block">
                <div
                  onClick={() => (user.avatar ? setShowImageModal(user.avatar) : avatarInputRef.current?.click())}
                  className="w-24 h-24 sm:w-28 sm:h-28 bg-primary rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-extrabold border-4 border-white shadow-xl overflow-hidden cursor-pointer relative group"
                  title="Click to view photo"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0)?.toUpperCase() || 'S'
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-primary text-white hover:opacity-90 rounded-full shadow-md transition"
                  title="Change photo"
                >
                  <FiCamera size={14} />
                </button>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-dark flex items-center justify-center gap-1.5 flex-wrap">
                <span>{user.name || 'Student'}</span>
                {user.isVerified && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#008751] text-white text-[10px] font-extrabold shadow-xs flex-shrink-0" title="Scholar Verified">
                    ✓
                  </span>
                )}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-primary mt-0.5">
                @{user.username || user.name?.toLowerCase().replace(/\s+/g, '')}
              </p>
              <p className="text-xs text-gray-400 mb-2">{user.email}</p>

              {user.school && (
                <div className="mb-3 max-w-sm mx-auto">
                  <SchoolBadge school={user.school} state={user.state} level={user.level} size="md" />
                </div>
              )}

              <div className="flex items-center justify-center gap-6 sm:gap-8 my-3 py-2 border-y border-gray-100 dark:border-zinc-800/80 w-full max-w-md mx-auto">
                <div className="text-center cursor-pointer" onClick={() => setActiveTab('following')}>
                  <p className="font-extrabold text-dark text-lg sm:text-xl">{followingCount}</p>
                  <p className="text-xs font-medium text-gray-400">Following</p>
                </div>
                <div className="w-px h-8 bg-gray-200 dark:bg-zinc-800" />
                <div className="text-center cursor-pointer" onClick={() => setActiveTab('followers')}>
                  <p className="font-extrabold text-dark text-lg sm:text-xl">{followersCount}</p>
                  <p className="text-xs font-medium text-gray-400">Followers</p>
                </div>
                <div className="w-px h-8 bg-gray-200 dark:bg-zinc-800" />
                <div className="text-center">
                  <p className="font-extrabold text-dark text-lg sm:text-xl">
                    {myPosts.reduce((sum, p) => sum + (Array.isArray(p.likes) ? p.likes.length : (typeof p.likesCount === 'number' ? p.likesCount : (typeof p.likes === 'number' ? p.likes : 0))), 0)}
                  </p>
                  <p className="text-xs font-medium text-gray-400">Likes</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full max-w-md mx-auto my-3">
                <button
                  onClick={() => router.push('/settings')}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-dark rounded-xl text-xs font-bold transition">
                  <FiSettings size={14} /> Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-xs font-bold transition">
                  <FiLogOut size={14} /> Logout
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 flex-wrap mt-2">
                <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Scholar Score: {user.scholarScore ?? 0} pts
                </span>
                <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1">
                  <FiAward size={11} /> {user.level || 'Student'}
                </span>
                {user.course ? (
                  <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1">
                    <FiBookOpen size={11} /> {user.course}
                  </span>
                ) : null}
              </div>

              {user.interests?.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                  {user.interests.map(interest => (
                    <span key={interest} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium">{interest}</span>
                  ))}
                </div>
              )}
            </div>
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
              <span className="text-accent">7 day streak complete! +100 coins earned!</span>
            ) : (
              <span className="text-gray-500">{7 - currentStreak} more {7 - currentStreak === 1 ? 'day' : 'days'} to earn 100 bonus coins!</span>
            )}
          </p>
        </motion.div>

        <div className="flex gap-2 mb-5">
          {[
            { id: 'posts', label: 'My Posts', icon: FiBookOpen },
            { id: 'followers', label: `Followers (${followersCount})`, icon: FiUserCheck },
            { id: 'following', label: `Following (${followingCount})`, icon: FiUserPlus },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-primary'}`}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'followers' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {followers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <FiUserCheck size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="font-bold text-dark mb-1">No followers yet</p>
                <p className="text-sm text-gray-400">When people follow you, they will show up here.</p>
              </div>
            ) : (
              followers.map(f => {
                const isFollowingTarget = following.some(u => u.id === f.id)
                const isHovered = hoveredUserId === f.id
                return (
                  <div key={f.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/profile/${f.id}`)}>
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                        {f.name?.charAt(0)?.toUpperCase() || 'S'}
                      </div>
                      <div>
                        <p className="font-bold text-dark text-sm hover:underline">{f.name}</p>
                        <p className="text-xs text-gray-400">@{f.username || 'student'}</p>
                        {f.school && <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">{f.school}</span>}
                      </div>
                    </div>
                    {f.id !== user.id && (
                      <button 
                        onClick={() => handleListFollow(f.id)}
                        onMouseEnter={() => setHoveredUserId(f.id)}
                        onMouseLeave={() => setHoveredUserId(null)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          isFollowingTarget
                            ? isHovered
                              ? 'bg-red-50 border-red-200 text-red-600'
                              : 'bg-white border-gray-200 text-gray-600'
                            : 'bg-primary border-primary text-white hover:opacity-90'
                        }`}>
                        {isFollowingTarget ? (isHovered ? 'Unfollow' : 'Following') : 'Follow Back'}
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </motion.div>
        )}

        {activeTab === 'following' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {following.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <FiUserPlus size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="font-bold text-dark mb-1">Not following anyone yet</p>
                <p className="text-sm text-gray-400">Find students to follow and stay updated on their posts.</p>
              </div>
            ) : (
              following.map(f => {
                const isHovered = hoveredUserId === f.id
                return (
                  <div key={f.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/profile/${f.id}`)}>
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                        {f.name?.charAt(0)?.toUpperCase() || 'S'}
                      </div>
                      <div>
                        <p className="font-bold text-dark text-sm hover:underline">{f.name}</p>
                        <p className="text-xs text-gray-400">@{f.username || 'student'}</p>
                        {f.school && <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">{f.school}</span>}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleListFollow(f.id)}
                      onMouseEnter={() => setHoveredUserId(f.id)}
                      onMouseLeave={() => setHoveredUserId(null)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        isHovered
                          ? 'bg-red-50 border-red-200 text-red-600 font-bold'
                          : 'bg-white border-gray-200 text-gray-600'
                      }`}>
                      {isHovered ? 'Unfollow' : 'Following'}
                    </button>
                  </div>
                )
              })
            )}
          </motion.div>
        )}

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
                      {post.status && post.status !== 'approved' ? (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          post.status === 'rejected' ? 'bg-red-50 text-red-500' :
                          'bg-yellow-50 text-yellow-600'}`}>
                          {post.status === 'rejected' ? <><FiX size={14} className="inline mr-1" /> Rejected</> : <><FiClock size={14} className="inline mr-1" /> Pending</>}
                        </span>
                      ) : (
                        <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                          {post.category || 'Academic'}
                        </span>
                      )}
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

      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImageModal(null)}
            className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 cursor-pointer"
          >
            <button onClick={() => setShowImageModal(null)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition">
              <FiX size={24} />
            </button>
            <img src={showImageModal} alt="Profile Picture" className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Profile