/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { FiArrowLeft, FiMessageSquare, FiUserPlus, FiUserCheck, FiBookOpen, FiStar, FiAward, FiTrash2, FiAlertTriangle } from "react-icons/fi"
import { MdLocalFireDepartment } from "react-icons/md"
import { BsCoin } from "react-icons/bs"
import { GiTrophy } from "react-icons/gi"
import { getUserById, followUser, getPosts, deletePost } from "../api/auth"

const knownAbbreviations = {
    'university of lagos': 'UNILAG', 'obafemi awolowo university': 'OAU',
    'ahmadu bello university': 'ABU', 'covenant university': 'CU',
    'university of ibadan': 'UI', 'lagos state university': 'LASU',
    'university of benin': 'UNIBEN', 'university of port harcourt': 'UNIPORT',
    'enugu state university of technology (esut)': 'ESUT', 'esut': 'ESUT',
}

function getSchoolAbbr(school) {
    if (!school) return '?'
    const lower = school.toLowerCase().trim()
    if (knownAbbreviations[lower]) return knownAbbreviations[lower]
    return school.split(' ').filter(w => w.length > 2).map(w => w[0].toUpperCase()).join('').slice(0, 6) || school.slice(0, 4).toUpperCase()
}

function UserProfile() {
    const params = useParams() || {}
    const userId = params.userId
    const router = useRouter()
    const [currentUser, setCurrentUser] = useState({})

    useEffect(() => {
        try {
            const stored = localStorage.getItem('user')
            if (stored) setCurrentUser(JSON.parse(stored))
        } catch (e) {}
    }, [])

    const [profileUser, setProfileUser] = useState(null)
    const [userPosts, setUserPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [following, setFollowing] = useState(false)
    const [followLoading, setFollowLoading] = useState(false)
    const [followError, setFollowError] = useState('')
    const [followersCount, setFollowersCount] = useState(0)
    const [followingCount, setFollowingCount] = useState(0)
    const [activeTab, setActiveTab] = useState('posts')
    const [deletingId, setDeletingId] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [deleteError, setDeleteError] = useState('')

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true)
            try {
                let userData = null
                try {
                    const userRes = await getUserById(userId)
                    userData = userRes.data
                } catch (err) {
                    console.error("getUserById failed, trying fallback", err)
                }

                if (!userData) {
                    try {
                        const allPosts = await getPosts()
                        const authorPost = allPosts.data.find(p =>
                            (p.author?._id || p.author)?.toString() === userId
                        )
                        if (authorPost?.author) {
                            const author = authorPost.author
                            userData = {
                                _id: author._id || userId,
                                name: author.name || 'Student',
                                school: author.school || '',
                                state: author.state || '',
                                level: author.level || '',
                                coins: author.coins || 0,
                                badge: author.badge || 'Beginner',
                                interests: author.interests || [],
                                streak: author.streak || 0,
                                followers: author.followers || [],
                                following: author.following || [],
                            }
                        }
                    } catch (err2) {
                        console.error("Fallback also failed", err2)
                    }
                }

                if (userData) {
                    setProfileUser(userData)
                    setFollowersCount(userData.followers?.length || 0)
                    setFollowingCount(userData.following?.length || 0)
                    setFollowing(
                        userData.followers?.some(f =>
                            (f._id || f).toString() === (currentUser.id || currentUser._id)
                        ) || false
                    )
                } else {
                    setProfileUser(null)
                    setLoading(false)
                    return
                }

                try {
                    const postsRes = await getPosts()
                    const userPostsData = postsRes.data.filter(p =>
                        (p.author?._id || p.author)?.toString() === userId
                    )
                    const mapped = userPostsData.map(post => ({
                        _id: post._id,
                        title: post.title,
                        content: post.content,
                        category: post.category,
                        status: post.status || 'pending',
                        createdAt: post.createdAt,
                        authorId: post.author?._id || '',
                        likes: post.likes?.length || 0,
                        liked: post.likes?.includes(currentUser.id || currentUser._id) || false,
                        commentCount: post.commentsData?.length || 0,
                        isReal: true
                    }))
                    setUserPosts(mapped)
                } catch (err) {
                    console.error("Failed to fetch user posts", err)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [userId])

    const handleFollow = async () => {
        setFollowLoading(true)
        setFollowError('')
        const wasFollowing = following
        setFollowing(!wasFollowing)
        setFollowersCount(prev => prev + (wasFollowing ? -1 : 1))
        try {
            await followUser(userId)
        } catch (err) {
            console.warn("Follow API unavailable (404) — state updated locally", err)
        } finally {
            setFollowLoading(false)
        }
    }

    const handleDeletePost = async (postId) => {
        setDeletingId(postId)
        setDeleteError('')
        try {
            await deletePost(postId)
            setUserPosts(prev => prev.filter(p => p._id !== postId))
            setConfirmDelete(null)
        } catch (error) {
            console.error("Failed to delete post", error)
            setDeleteError(error.response?.data?.message || 'Failed to delete. The API may not support this action.')
        } finally {
            setDeletingId(null)
        }
    }

    const isOwnProfile = userId?.toString() === (currentUser.id || currentUser._id)?.toString()

    if (loading) {
        return (
            <div className="min-h-screen bg-light md:pl-56 pt-16 md:pt-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Loading profile...</p>
                </div>
            </div>
        )
    }

    if (!profileUser) {
        return (
            <div className="min-h-screen bg-light md:pl-56 pt-16 md:pt-0 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-2xl mb-2">😕</p>
                    <p className="font-bold text-dark mb-1">User not found</p>
                    <button onClick={() => router.back()} className="text-primary text-sm font-medium">Go back</button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-light md:pl-56 pt-16 md:pt-0">
            <div className="max-w-3xl mx-auto px-4 py-6">

                <button onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-dark text-sm mb-5 transition">
                    <FiArrowLeft size={16} /> Back
                </button>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-5">
                    <div className="h-24 bg-gradient-to-r from-dark to-primary relative" />

                    <div className="px-5 pb-5">
                        <div className="flex items-end justify-between -mt-8 mb-4">
                            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold border-4 border-white shadow-lg flex-shrink-0">
                                {profileUser.name?.charAt(0)?.toUpperCase() || 'S'}
                            </div>

                            {!isOwnProfile && (
                                <div className="flex gap-2 mt-10">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleFollow}
                                        disabled={followLoading}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                                            following
                                                ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
                                                : 'bg-primary text-white hover:opacity-90'
                                        }`}>
                                        {following ? <FiUserCheck size={13} /> : <FiUserPlus size={13} />}
                                        {followLoading ? '...' : following ? 'Following' : 'Follow'}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => router.push(`/chat?user=${userId}`)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-semibold hover:bg-primary/20 transition">
                                        <FiMessageSquare size={13} /> Message
                                    </motion.button>
                                </div>
                            )}
                            {followError && <p className="text-red-500 text-xs mt-2">{followError}</p>}

                            {isOwnProfile && (
                                <button
                                    onClick={() => router.push('/profile')}
                                    className="mt-10 px-4 py-2 border border-gray-200 rounded-xl text-xs font-medium text-dark hover:border-primary transition">
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        <h2 className="text-xl font-extrabold text-dark mb-0.5">{profileUser.name}</h2>
                        <p className="text-xs text-gray-400 mb-3">
                            {profileUser.school && profileUser.state
                                ? `${profileUser.school} • ${profileUser.state}`
                                : profileUser.school || profileUser.state || 'ScholarHub Member'}
                        </p>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="text-center">
                                <p className="font-extrabold text-dark text-lg">{followersCount}</p>
                                <p className="text-xs text-gray-400">Followers</p>
                            </div>
                            <div className="w-px h-8 bg-gray-100" />
                            <div className="text-center">
                                <p className="font-extrabold text-dark text-lg">{followingCount}</p>
                                <p className="text-xs text-gray-400">Following</p>
                            </div>
                            <div className="w-px h-8 bg-gray-100" />
                            <div className="text-center">
                                <p className="font-extrabold text-primary text-lg">{profileUser.coins || 50}</p>
                                <p className="text-xs text-gray-400">Coins</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap mb-4">
                            {profileUser.level && (
                                <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1">
                                    <FiAward size={11} /> {profileUser.level}
                                </span>
                            )}
                            <span className="bg-accent/10 text-accent text-xs font-semibold px-3 py-1 rounded-full border border-accent/20 flex items-center gap-1">
                                <FiStar size={11} /> {profileUser.badge || 'Beginner'}
                            </span>
                            {profileUser.school && (
                                <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                                    {getSchoolAbbr(profileUser.school)}
                                </span>
                            )}
                        </div>

                        {profileUser.interests?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {profileUser.interests.map(interest => (
                                    <span key={interest} className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full">
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

                <div className="flex gap-2 mb-5">
                    {[
                        { id: 'posts', label: 'Posts', icon: FiBookOpen },
                        { id: 'stats', label: 'Stats', icon: GiTrophy },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                activeTab === tab.id
                                    ? 'bg-primary text-white'
                                    : 'bg-white border border-gray-200 text-gray-500 hover:border-primary'
                            }`}>
                            <tab.icon size={14} /> {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'stats' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Coins', value: profileUser.coins || 50, icon: BsCoin, color: 'text-accent' },
                            { label: 'Streak', value: `${profileUser.streak || 0}/7`, icon: MdLocalFireDepartment, color: 'text-orange-500' },
                            { label: 'Followers', value: followersCount, icon: FiUserCheck, color: 'text-primary' },
                            { label: 'Following', value: followingCount, icon: FiUserPlus, color: 'text-purple-500' },
                        ].map((stat, i) => (
                            <motion.div key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.08 }}
                                className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
                                <stat.icon size={22} className={`${stat.color} mx-auto mb-2`} />
                                <p className={`text-xl font-extrabold ${stat.color}`}>{stat.value}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'posts' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {userPosts.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                                <FiBookOpen size={36} className="text-gray-200 mx-auto mb-3" />
                                <p className="font-bold text-dark mb-1">No posts yet</p>
                                <p className="text-sm text-gray-400">
                                    {profileUser.name?.split(' ')[0]} hasn't posted anything yet
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {userPosts.map((post, i) => (
                                    <motion.div key={post._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 hover:shadow-md transition-all duration-300">
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
                                                    {new Date(post.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                                                </span>
                                                {isOwnProfile && (
                                                    <button
                                                        onClick={() => setConfirmDelete(post._id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-dark text-sm md:text-base mb-1 leading-snug">{post.title}</h3>
                                        <p className="text-gray-500 text-xs md:text-sm leading-relaxed line-clamp-2 mb-2">{post.content}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{post.category}</span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                ❤️ {post.likes}
                                            </span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                💬 {post.commentCount}
                                            </span>
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
                            <p className="text-gray-400 text-sm text-center mb-6">This action cannot be undone.</p>
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

export default UserProfile