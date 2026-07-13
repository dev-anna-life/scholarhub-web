/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { FiArrowLeft, FiMessageSquare, FiUserPlus, FiUserCheck, FiBookOpen, FiStar, FiAward, FiTrash2, FiAlertTriangle, FiSend, FiCheck, FiX, FiClock, FiHeart, FiMessageCircle } from "react-icons/fi"
import { MdLocalFireDepartment } from "react-icons/md"
import { BsCoin } from "react-icons/bs"
import { GiTrophy } from "react-icons/gi"
import { getUserById, followUser, getPosts, deletePost, sendCoins } from "../api/auth"
import { getSchoolLogo } from "../data/schools"

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
    const [followedBy, setFollowedBy] = useState(false)
    const [followLoading, setFollowLoading] = useState(false)
    const [followError, setFollowError] = useState('')
    const [followersCount, setFollowersCount] = useState(0)
    const [followingCount, setFollowingCount] = useState(0)
    const [profileFollowers, setProfileFollowers] = useState([])
    const [profileFollowing, setProfileFollowing] = useState([])
    const [myFollowing, setMyFollowing] = useState([])
    const [activeTab, setActiveTab] = useState('posts')
    const [deletingId, setDeletingId] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [deleteError, setDeleteError] = useState('')
    const [showSendCoins, setShowSendCoins] = useState(false)
    const [sendUsername, setSendUsername] = useState('')
    const [sendAmount, setSendAmount] = useState('')
    const [sendingCoins, setSendingCoins] = useState(false)
    const [sendMsg, setSendMsg] = useState(null)

    const fetchMyFollowing = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
            const myId = storedUser.id || storedUser._id
            if (myId) {
                const res = await getUserById(myId)
                setMyFollowing(res.data.following || [])
            }
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchMyFollowing()
    }, [])

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
                    setFollowersCount(userData.followersCount ?? userData.followers?.length ?? 0)
                    setFollowingCount(userData.followingCount ?? userData.following?.length ?? 0)
                    setProfileFollowers(userData.followers || [])
                    setProfileFollowing(userData.following || [])
                    setFollowing(userData.isFollowing ?? false)
                    setFollowedBy(userData.isFollowedBy ?? false)
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

    const refreshProfileDetails = async () => {
        try {
            const detailRes = await getUserById(userId)
            if (detailRes.data) {
                setProfileFollowers(detailRes.data.followers || [])
                setProfileFollowing(detailRes.data.following || [])
                setFollowersCount(detailRes.data.followersCount || 0)
                setFollowingCount(detailRes.data.followingCount || 0)
                setFollowing(detailRes.data.isFollowing ?? false)
                setFollowedBy(detailRes.data.isFollowedBy ?? false)
            }
            await fetchMyFollowing()
        } catch (err) {
            console.error("Failed to refresh profile details", err)
        }
    }

    const handleFollow = async () => {
        setFollowLoading(true)
        setFollowError('')
        const wasFollowing = following
        setFollowing(!wasFollowing)
        setFollowersCount(prev => prev + (wasFollowing ? -1 : 1))
        try {
            await followUser(userId)
            await refreshProfileDetails()
        } catch (err) {
            console.warn("Follow API unavailable (404) — state updated locally", err)
        } finally {
            setFollowLoading(false)
        }
    }

    const handleListFollow = async (targetUserId) => {
        try {
            await followUser(targetUserId)
            await refreshProfileDetails()
        } catch (err) {
            console.error("Failed to toggle follow in list", err)
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

    const handleSendCoins = async () => {
        if (!sendUsername.trim() || !sendAmount || parseInt(sendAmount) < 1) return
        setSendingCoins(true)
        setSendMsg(null)
        try {
            await sendCoins(sendUsername.trim(), parseInt(sendAmount))
            setSendMsg({ type: 'success', text: `Sent ${sendAmount} coins to ${sendUsername}` })
            setSendUsername(''); setSendAmount('')
            setTimeout(() => { setShowSendCoins(false); setSendMsg(null) }, 1500)
        } catch (e) {
            setSendMsg({ type: 'error', text: e.response?.data?.message || 'Failed to send coins' })
        } finally {
            setSendingCoins(false)
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
                                        {followLoading ? '...' : following ? 'Following' : followedBy ? 'Follow Back' : 'Follow'}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => router.push(`/chat?user=${userId}`)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-semibold hover:bg-primary/20 transition">
                                        <FiMessageSquare size={13} /> Message
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => { setSendUsername(''); setSendAmount(''); setSendMsg(null); setShowSendCoins(true) }}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-accent/10 text-accent rounded-xl text-xs font-semibold hover:bg-accent/20 transition">
                                        <BsCoin size={13} /> Send Coins
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
                        <p className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
                            {profileUser.school && (
                                <img src={getSchoolLogo(profileUser.school).png} alt=""
                                    className="w-4 h-4 object-contain rounded"
                                    onError={e => e.target.style.display = 'none'} />
                            )}
                            {profileUser.school && profileUser.state
                                ? `${profileUser.school} • ${profileUser.state}`
                                : profileUser.school || profileUser.state || 'ScholarHub Member'}
                        </p>

                        {(() => {
                            const mutuals = myFollowing.filter(myF => profileFollowers.some(pFol => pFol.id === myF.id))
                            if (mutuals.length === 0) return null
                            return (
                                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                                    <span className="font-semibold text-primary">Mutuals:</span>
                                    <span>
                                        Followed by {mutuals[0].name}
                                        {mutuals.length > 1 ? ` and ${mutuals.length - 1} other${mutuals.length > 2 ? 's' : ''}` : ''}
                                    </span>
                                </p>
                            )
                        })()}

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
                        { id: 'followers', label: `Followers (${followersCount})`, icon: FiUserCheck },
                        { id: 'following', label: `Following (${followingCount})`, icon: FiUserPlus },
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

                {activeTab === 'followers' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                        {profileFollowers.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                                <FiUserCheck size={36} className="text-gray-200 mx-auto mb-3" />
                                <p className="font-bold text-dark mb-1">No followers yet</p>
                                <p className="text-sm text-gray-400">When people follow this user, they will show up here.</p>
                            </div>
                        ) : (
                            profileFollowers.map(f => {
                                const isFollowingTarget = myFollowing.some(u => u.id === f.id)
                                const isSelf = f.id === (currentUser.id || currentUser._id)
                                return (
                                    <div key={f.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between hover:shadow-sm transition-all duration-200">
                                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(isSelf ? '/profile' : `/profile/${f.id}`)}>
                                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                                                {f.name?.charAt(0)?.toUpperCase() || 'S'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-dark text-sm hover:underline">{f.name}</p>
                                                <p className="text-xs text-gray-400">@{f.username || 'student'}</p>
                                                {f.school && <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">{f.school}</span>}
                                            </div>
                                        </div>
                                        {!isSelf && (
                                            <button onClick={() => handleListFollow(f.id)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                                    isFollowingTarget
                                                        ? 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                                                        : 'bg-primary border-primary text-white hover:opacity-90'
                                                }`}>
                                                {isFollowingTarget ? 'Following' : 'Follow'}
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
                        {profileFollowing.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                                <FiUserPlus size={36} className="text-gray-200 mx-auto mb-3" />
                                <p className="font-bold text-dark mb-1">Not following anyone yet</p>
                                <p className="text-sm text-gray-400">This user is not following anyone yet.</p>
                            </div>
                        ) : (
                            profileFollowing.map(f => {
                                const isFollowingTarget = myFollowing.some(u => u.id === f.id)
                                const isSelf = f.id === (currentUser.id || currentUser._id)
                                return (
                                    <div key={f.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between hover:shadow-sm transition-all duration-200">
                                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(isSelf ? '/profile' : `/profile/${f.id}`)}>
                                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                                                {f.name?.charAt(0)?.toUpperCase() || 'S'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-dark text-sm hover:underline">{f.name}</p>
                                                <p className="text-xs text-gray-400">@{f.username || 'student'}</p>
                                                {f.school && <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">{f.school}</span>}
                                            </div>
                                        </div>
                                        {!isSelf && (
                                            <button onClick={() => handleListFollow(f.id)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                                    isFollowingTarget
                                                        ? 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                                                        : 'bg-primary border-primary text-white hover:opacity-90'
                                                }`}>
                                                {isFollowingTarget ? 'Following' : 'Follow'}
                                            </button>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </motion.div>
                )}

                {activeTab === 'stats' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="grid grid-cols-2 gap-3">
                        {[
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
                                                {post.status === 'approved' ? <><FiCheck size={14} className="inline mr-1" /> Approved</> :
                                                 post.status === 'rejected' ? <><FiX size={14} className="inline mr-1" /> Rejected</> : <><FiClock size={14} className="inline mr-1" /> Pending</>}
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
                                                <FiHeart size={12} className="text-red-400" /> {post.likes}
                                            </span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <FiMessageCircle size={12} /> {post.commentCount}
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

            <AnimatePresence>
                {showSendCoins && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowSendCoins(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                            <h3 className="text-lg font-bold text-dark mb-2">Send Coins</h3>
                            <p className="text-xs text-gray-500 mb-4">Enter the recipient's username and amount.</p>
                            {sendMsg && (
                                <p className={`text-xs mb-3 ${sendMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{sendMsg.text}</p>
                            )}
                            <div className="space-y-3">
                                <input type="text" value={sendUsername} onChange={e => setSendUsername(e.target.value)}
                                    placeholder="Recipient username" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
                                <input type="number" value={sendAmount} onChange={e => setSendAmount(e.target.value)}
                                    placeholder="Amount" min="1" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
                                <div className="flex gap-2">
                                    <button onClick={() => setShowSendCoins(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-dark">
                                        Cancel
                                    </button>
                                    <button onClick={handleSendCoins} disabled={sendingCoins || !sendUsername.trim() || !sendAmount}
                                        className="flex-1 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                                        {sendingCoins ? 'Sending...' : 'Send'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default UserProfile