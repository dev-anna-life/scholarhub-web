/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"
import { FiCheck, FiX, FiUsers, FiFileText, FiClock, FiTrendingUp, FiLogOut, FiEye } from "react-icons/fi"
import { getAdminStats, getPendingPosts, approvePost, rejectPost, getAllUsers } from "../api/auth";
import { useRouter } from "next/navigation"

function Admin() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('pending')
    const [pendingPosts, setPendingPosts] = useState([])
    const [users, setUsers] = useState([])
    const [stats, setStats] = useState({})
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(null)
    const [selectedPost, setSelectedPost] = useState(null)

    useEffect(() => {
        fetchAll()
    }, [])


    const fetchAll = async () => {
        setLoading(true)
        try {
            const [statsRes, postRes, usersRes] = await Promise.all([
                getAdminStats(),
                getPendingPosts(),
                getAllUsers()
            ])
            setStats(statsRes.data)
            setPendingPosts(postRes.data)
            setUsers(usersRes.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (id) => {
        setActionLoading(id)
        try {
            await approvePost(id)
            setPendingPosts(prev => prev.filter(p => p._id !== id))
            setStats(prev => ({
                ...prev,
                pendingPosts: prev.pendingPosts - 1,
                approvedPosts: prev.approvedPosts + 1
            }))
            setSelectedPost(null)
        } catch (err) {
            console.error(err)
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (id) => {
        setActionLoading(id)
        try {
            await rejectPost(id)
            setPendingPosts(prev => prev.filter(p => p._id !== id))
            setStats(prev => ({
                ...prev,
                pendingPosts: prev.pendingPosts - 1,
                rejectedPosts: prev.rejectedPosts + 1
            }))
            setSelectedPost(null)
        } catch (err) {
            console.error(err)
        } finally {
            setActionLoading(null)
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">

            <div className="bg-white border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div>
                <h1 className="text-xl font-extrabold text-primary">
                    Scholar<span className="text-accent">Hub</span>
                    <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">Admin</span>
                </h1>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.push('/feed')}
                    className="text-sm text-gray-400 hover:text-primary transition flex items-center gap-2">
                    <FiEye size={15} /> View Site
                </button>
                <button
                    onClick={() => { localStorage.clear(); router.push('/login') }}
                    className="text-sm text-red-400 hover:text-red-300 transition flex items-center gap-2"
                >
                    <FiLogOut size={15} /> Logout
                </button>
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
            {loading ? (
             <div className="text-center py-16 text-gray-500">Loading...</div>
        ) : (
            <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
                { label: 'Total Users', value: stats.totalUsers, icon: FiUsers, color: 'text-blue-400' },
                { label: 'Total Posts', value: stats.totalPosts, icon: FiFileText, color: 'text-green-400' },
                { label: 'Pending', value: stats.pendingPosts, icon: FiClock, color: 'text-yellow-400' },
                { label: 'Approved', value: stats.approvedPosts, icon: FiCheck, color: 'text-primary' },
                { label: 'Rejected', value: stats.rejectedPosts, icon: FiX, color: 'text-red-400' },
            ].map(s => (
                  <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <s.icon size={18} className={`${s.color} mb-2`} />
                  <p className="text-2xl font-extrabold text-black">{s.value ?? 0}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </div>
            ))}
        </div>
        
         <div className="flex gap-2 mb-6">
              {[
                { id: 'pending', label: `Pending (${stats.pendingPosts ?? 0})` },
                { id: 'users', label: `Users (${stats.totalUsers ?? 0})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-primary'
                      : 'bg-gray-900 text-gray-500 hover:text-white border border-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'pending' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pendingPosts.length === 0 ? (
                  <div className="col-span-2 text-center py-16 text-gray-500">
                    <FiCheck size={40} className="mx-auto mb-3 text-primary" />
                    <p className="text-lg font-semibold text-white">All caught up!</p>
                    <p className="text-sm">No pending posts to review.</p>
                  </div>
                ) : (
                  pendingPosts.map((post, i) => (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-gray-900 rounded-2xl p-5 border border-gray-800 hover:border-gray-700 transition"
                    >
                        <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center text-primary text-xs font-bold">
                          {post.author?.name?.charAt(0) || 'S'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm">{post.author?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{post.author?.level} • {post.author?.school}</p>
                        </div>
                        <span className="bg-yellow-500/10 text-yellow-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                          {post.category}
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-sm mb-2 leading-snug">{post.title}</h3>
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 mb-4">{post.content}</p>

                    <p className="text-xs text-gray-600 mb-4">
                        {new Date(post.createdAt).toLocaleDateString('en-NG', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(post._id)}
                          disabled={actionLoading === post._id}
                          className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition flex items-center justify-center gap-1.5"
                        >
                          <FiCheck size={14} />
                          {actionLoading === post._id ? 'Processing...' : 'Approve (+50 coins)'}
                        </button>
                        <button
                          onClick={() => handleReject(post._id)}
                          disabled={actionLoading === post._id}
                          className="flex-1 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-semibold hover:bg-red-500/20 transition flex items-center justify-center gap-1.5"
                        >
                          <FiX size={14} />
                          Reject
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

        {activeTab === 'users' && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-800">
                  <h2 className="font-bold text-white text-sm">All Users — sorted by coins</h2>
                </div>
                <div className="divide-y divide-gray-800">
                  {users.map((user, i) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="px-5 py-4 flex items-center gap-3 hover:bg-gray-800/50 transition"
                    >
                      <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                        {user.name?.charAt(0) || 'S'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email} • {user.level}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-primary">{user.coins} coins</p>
                        <p className="text-xs text-gray-500">{user.badge}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          user.isVerified
                            ? 'bg-primary/10 text-primary'
                            : 'bg-gray-800 text-gray-500'
                        }`}>
                          {user.isVerified ? 'Verified' : 'Free'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      </div>
  )

}

export default Admin
