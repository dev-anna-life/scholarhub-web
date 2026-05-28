/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiSearch, FiBell, FiHeart, FiMessageCircle, FiShare2, FiPlus, FiTrendingUp, FiBookmark, FiSend } from "react-icons/fi"
import { useRouter } from "next/navigation"
import { createPost, getPosts, getUserPosts, likePost, getComments, addComment, getNotifications, markNotificationsRead, getLeaderboard } from '../api/auth'
import SOSButton from '../components/SOSButton'
import { getCategoriesForCourse } from '../data/courses'

const categories = ['All', 'Sciences', 'Mathematics', 'Technology', 'Law', 'Medicine', 'Arts & Lit', 'Commerce', 'Entertainment', 'Campus Gist']

const knownAbbreviations = {
    'university of lagos': 'UNILAG', 'unilag': 'UNILAG',
    'obafemi awolowo university': 'OAU', 'oau ile-ife': 'OAU',
    'ahmadu bello university': 'ABU', 'abu zaria': 'ABU',
    'university of nigeria nsukka': 'UNN', 'covenant university': 'CU',
    'university of ibadan': 'UI', 'lagos state university': 'LASU',
    'university of benin': 'UNIBEN', 'university of port harcourt': 'UNIPORT',
    'university of ilorin': 'UNILORIN', 'babcock university': 'BU',
    'nnamdi azikiwe university': 'UNIZIK', 'rivers state university': 'RSU',
    'enugu state university of technology (esut)': 'ESUT',
    'enugu state university of technology': 'ESUT', 'esut': 'ESUT',
    'university of ghana': 'UG', 'kwame nkrumah university of science and technology': 'KNUST',
    'university of nairobi': 'UON', 'kenyatta university': 'KU',
    'makerere university': 'MAK', 'university of cape town': 'UCT',
    'university of the witwatersrand': 'WITS', 'stellenbosch university': 'SU',
    'university of pretoria': 'UP', 'addis ababa university': 'AAU',
}

const schoolColors = {
    'university of lagos': '#003366', 'unilag': '#003366',
    'oau ile-ife': '#006400', 'obafemi awolowo university': '#006400',
    'abu zaria': '#8B0000', 'ahmadu bello university': '#8B0000',
    'covenant university': '#722F37', 'university of ibadan': '#003399',
    'university of benin': '#006633', 'lagos state university': '#CC0000',
    'university of ghana': '#006B3F', 'university of nairobi': '#003366',
    'makerere university': '#006B3F', 'university of cape town': '#003380',
    'university of the witwatersrand': '#003087',
    'enugu state university of technology (esut)': '#006400',
    'enugu state university of technology': '#006400', 'esut': '#006400',
}

function getSchoolAbbr(school) {
    if (!school) return '?'
    const lower = school.toLowerCase().trim()
    if (knownAbbreviations[lower]) return knownAbbreviations[lower]
    return school.split(' ').filter(w => w.length > 2).map(w => w[0].toUpperCase()).join('').slice(0, 6) || school.slice(0, 4).toUpperCase()
}

function stringToColor(school) {
    if (!school) return '#008751'
    const lower = school.toLowerCase().trim()
    if (schoolColors[lower]) return schoolColors[lower]
    let hash = 0
    for (let i = 0; i < lower.length; i++) hash = lower.charCodeAt(i) + ((hash << 5) - hash)
    const colors = ['#008751', '#FF9F1C', '#1F2A1F', '#e63946', '#457b9d', '#6a4c93', '#f4a261', '#2a9d8f']
    return colors[Math.abs(hash) % colors.length]
}

function Home() {
    const router = useRouter()
    const [user, setUser] = useState({})

    useEffect(() => {
        try { setUser(JSON.parse(localStorage.getItem('user') || '{}')) } catch (e) {}
    }, [])
    const imageInputRef = useRef(null)
    const videoInputRef = useRef(null)

    const userCourse = user?.course || ''
    const courseCats = getCategoriesForCourse(userCourse)
    const [activeCategory, setActiveCategory] = useState(userCourse ? '__course__' : 'All')
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showCreatePost, setShowCreatePost] = useState(false)
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Sciences', image: null, video: null })
    const [showComments, setShowComments] = useState(null)
    const [myPostCount, setMyPostCount] = useState(0)
    const [postLoading, setPostLoading] = useState(false)
    const [postError, setPostError] = useState('')
    const [postSuccess, setPostSuccess] = useState(false)
    const [imageUploading, setImageUploading] = useState(false)
    const [commentsMap, setCommentsMap] = useState({})
    const [commentText, setCommentText] = useState('')
    const [commentLoading, setCommentLoading] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [showNotifications, setShowNotifications] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const [leaderboard, setLeaderboard] = useState([])
    const notifRef = useRef(null)

    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifications(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true)
            try {
                const [postsRes, myPostsRes, notifRes, leaderRes] = await Promise.all([
                    getPosts(), getUserPosts(), getNotifications(), getLeaderboard()
                ])
                setMyPostCount(myPostsRes.data.length)
                setNotifications(notifRes.data)
                setUnreadCount(notifRes.data.filter(n => !n.read).length)
                setLeaderboard(leaderRes.data.slice(0, 3))
                const realPosts = postsRes.data.map(post => ({
                    id: post._id,
                    authorId: post.author?._id || '',
                    author: post.author?.name || 'Student',
                    avatar: post.author?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SH',
                    school: post.author?.school || '',
                    level: post.author?.level || '',
                    category: post.category,
                    title: post.title,
                    content: post.content,
                    image: post.image,
                    video: post.video,
                    likes: post.likes?.length || 0,
                    liked: post.likes?.includes(user.id) || false,
                    commentCount: post.commentsData?.length || 0,
                    time: new Date(post.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
                    trending: post.trending || false,
                    saved: false,
                    isReal: true
                }))
                setPosts(realPosts)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [])

    const toggleLike = async (id, isReal) => {
        setPosts(prev => prev.map(p =>
            p.id === id ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p
        ))
        if (!isReal) return
        try {
            await likePost(id)
        } catch (err) {
            setPosts(prev => prev.map(p =>
                p.id === id ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p
            ))
        }
    }

    const toggleSave = (id) => {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, saved: !p.saved } : p))
    }

    const handleShowComments = async (postId, isReal) => {
        if (showComments === postId) { setShowComments(null); return }
        setShowComments(postId)
        if (!isReal || commentsMap[postId]) return
        try {
            const res = await getComments(postId)
            setCommentsMap(prev => ({ ...prev, [postId]: res.data }))
        } catch (err) {
            setCommentsMap(prev => ({ ...prev, [postId]: [] }))
        }
    }

    const handleAddComment = async (postId) => {
        if (!commentText.trim()) return
        setCommentLoading(true)
        try {
            const res = await addComment(postId, commentText)
            setCommentsMap(prev => ({ ...prev, [postId]: [...(prev[postId] || []), res.data] }))
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p))
            setCommentText('')
        } catch (err) {
            console.error(err)
        } finally {
            setCommentLoading(false)
        }
    }

    const handleBellClick = async () => {
        setShowNotifications(!showNotifications)
        if (!showNotifications && unreadCount > 0) {
            try {
                await markNotificationsRead()
                setUnreadCount(0)
                setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            } catch (err) {
                console.error(err)
            }
        }
    }

    const handleShare = (post) => {
        if (navigator.share) {
            navigator.share({ title: post.title, text: post.content, url: window.location.href })
        } else {
            navigator.clipboard.writeText(window.location.href)
            alert('Link copied!')
        }
    }

    const handleCreatePost = async () => {
        if (!newPost.title.trim() || !newPost.content.trim()) {
            setPostError('Title and content are required')
            return
        }
        const subs = user?.badgeSubscriptions || []
        const active = subs.filter(s => new Date(s.expiresAt) > new Date())
        const tiers = [
            { id: 'badge_extra_premium', limit: 100000 }, { id: 'badge_premium', limit: 1000 }, { id: 'badge_basic', limit: 500 },
        ]
        const highest = tiers.find(t => active.some(s => s.id === t.id))
        const maxChars = highest ? highest.limit : 250
        if (newPost.content.length > maxChars) {
            setPostError(`Character limit exceeded (${maxChars}). Upgrade your badge to write more.`)
            return
        }
        setPostLoading(true)
        setPostError('')
        try {
            await createPost(newPost)
            setPostSuccess(true)
            setNewPost({ title: '', content: '', category: 'Sciences', image: null, video: null })
            setTimeout(() => { setShowCreatePost(false); setPostSuccess(false) }, 2000)
        } catch (err) {
            setPostError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setPostLoading(false)
        }
    }

    const handleImagePick = () => imageInputRef.current?.click()
    const handleImageChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setImageUploading(true)
        const reader = new FileReader()
        reader.onload = () => {
            setNewPost({ ...newPost, image: reader.result })
            setImageUploading(false)
        }
        reader.onerror = () => setImageUploading(false)
        reader.readAsDataURL(file)
    }

    const handleVideoPick = () => videoInputRef.current?.click()
    const handleVideoChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setImageUploading(true)
        const reader = new FileReader()
        reader.onload = () => {
            setNewPost({ ...newPost, video: reader.result })
            setImageUploading(false)
        }
        reader.onerror = () => setImageUploading(false)
        reader.readAsDataURL(file)
    }

    const filteredPosts = posts.filter(post => {
        if (activeCategory === '__course__') {
            return courseCats.length === 0 || courseCats.includes(post.category)
        }
        const matchesCategory = activeCategory === 'All' || post.category === activeCategory
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    return (
       
        <div className="min-h-screen bg-light md:pl-56 pt-16 md:pt-0">
            
            <div className="sticky top-0 md:top-0 z-40 bg-light/95 backdrop-blur-md border-b border-gray-100 px-4 md:px-6 py-3 md:py-4">
                <div className="max-w-5xl mx-auto flex items-center gap-2">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-primary transition"
                        />
                    </div>

                    <div className="relative flex-shrink-0" ref={notifRef}>
                        <button onClick={handleBellClick}
                            className="relative p-2 bg-white border border-gray-200 rounded-xl hover:border-primary transition">
                            <FiBell size={15} className="text-dark" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full text-white text-xs flex items-center justify-center font-bold">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-12 w-72 md:w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-50">
                                        <p className="font-bold text-dark text-sm">Notifications</p>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="px-4 py-8 text-center text-gray-400 text-sm">No notifications yet</div>
                                        ) : (
                                            notifications.map((notif, i) => (
                                                <div key={i} className={`px-4 py-3 border-b border-gray-50 flex items-start gap-3 ${!notif.read ? 'bg-primary/5' : ''}`}>
                                                    <div
                                                        onClick={() => notif.sender?._id && router.push(`/profile/${notif.sender._id}`)}
                                                        className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 cursor-pointer hover:bg-primary/20 transition">
                                                        {notif.sender?.name?.charAt(0) || 'S'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-dark">
                                                            <span
                                                                onClick={() => notif.sender?._id && router.push(`/profile/${notif.sender._id}`)}
                                                                className="font-semibold cursor-pointer hover:text-primary transition">
                                                                {notif.sender?.name}
                                                            </span>
                                                            {notif.type === 'like' ? ' liked your post' : ' commented on your post'}
                                                        </p>
                                                        <p className="text-xs text-gray-400 truncate mt-0.5">{notif.post?.title}</p>
                                                        <p className="text-xs text-gray-300 mt-0.5">
                                                            {new Date(notif.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                                                        </p>
                                                    </div>
                                                    {!notif.read && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div
                        onClick={() => router.push('/profile')}
                        className="w-8 h-8 flex-shrink-0 bg-primary rounded-xl flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-90 transition">
                        {user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SH'}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-3 md:px-4 pb-24 flex gap-6">
                <div className="flex-1 min-w-0">

                    <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-hide">
                        {(userCourse ? [] : ['All']).concat(categories.filter(c => c !== 'All')).map(cat => {
                            const isActive = cat === 'All' ? activeCategory === 'All' : activeCategory === cat
                            return (
                                <button key={cat} onClick={() => setActiveCategory(cat)}
                                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${isActive
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'bg-white border border-gray-200 text-gray-500 hover:border-primary hover:text-primary'}`}>
                                    {cat === 'All' ? 'All' : cat}
                                </button>
                            )
                        })}
                    </div>
                    {userCourse && (
                        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-hide -mt-1">
                            <button onClick={() => setActiveCategory('__course__')}
                                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1 ${activeCategory === '__course__'
                                    ? 'bg-primary text-white'
                                    : 'bg-white border border-primary text-primary'}`}>
                                <FiTrendingUp size={11} /> {userCourse}
                            </button>
                            {courseCats.map(cc => (
                                <button key={cc} onClick={() => setActiveCategory(cc)}
                                    className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${activeCategory === cc
                                        ? 'bg-primary text-white'
                                        : 'bg-white border border-gray-200 text-gray-500 hover:border-primary'}`}>
                                    {cc}
                                </button>
                            ))}
                        </div>
                    )}

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-dark rounded-2xl p-3 md:p-4 mb-4 flex items-center gap-3">
                        <div className="w-9 h-9 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FiTrendingUp size={16} className="text-accent" />
                        </div>
                        <div>
                            <p className="text-white font-semibold text-xs md:text-sm">Trending today</p>
                            <p className="text-gray-400 text-xs">ASUU strike update is the most discussed post right now</p>
                        </div>
                    </motion.div>

                    <div className="flex flex-col gap-3">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
                                    <div className="flex gap-3 mb-3">
                                        <div className="w-9 h-9 bg-gray-200 rounded-xl flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="h-3 bg-gray-200 rounded w-32 mb-2" />
                                            <div className="h-2 bg-gray-100 rounded w-20" />
                                        </div>
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-gray-100 rounded w-full mb-1" />
                                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                                </div>
                            ))
                        ) : filteredPosts.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="text-center py-16 text-gray-400">
                                <p className="text-4xl mb-3">📭</p>
                                <p className="text-base font-semibold mb-1">No posts yet</p>
                                <p className="text-sm">Be the first to post something!</p>
                            </motion.div>
                        ) : (
                            <AnimatePresence>
                                {filteredPosts.map((post, i) => (
                                    <motion.div key={post.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="bg-white rounded-2xl p-3 md:p-5 border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all duration-300">

                                        <div className="flex items-start gap-2 mb-3">
                                            <div
                                                onClick={() => post.authorId && post.authorId !== user.id && router.push(`/profile/${post.authorId}`)}
                                                className={`w-8 h-8 md:w-9 md:h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 ${post.authorId && post.authorId !== user.id ? 'cursor-pointer hover:bg-primary/20 transition' : ''}`}>
                                                {post.avatar}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    onClick={() => post.authorId && post.authorId !== user.id && router.push(`/profile/${post.authorId}`)}
                                                    className={`font-semibold text-dark text-xs md:text-sm leading-tight truncate ${post.authorId && post.authorId !== user.id ? 'cursor-pointer hover:text-primary transition' : ''}`}>
                                                    {post.author.split(' ').slice(0, 2).join(' ')}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    {post.school && (
                                                        <span className="text-white font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                                                            style={{ backgroundColor: stringToColor(post.school), fontSize: '9px' }}>
                                                            {getSchoolAbbr(post.school)}
                                                        </span>
                                                    )}
                                                    <p className="text-xs text-gray-400">{post.time}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                {post.trending && (
                                                    <span className="bg-accent/10 text-accent font-semibold px-1.5 py-0.5 rounded-full hidden sm:block" style={{ fontSize: '10px' }}>Trending</span>
                                                )}
                                                <span className="bg-primary/10 text-primary font-medium px-1.5 py-0.5 rounded-full" style={{ fontSize: '10px' }}>
                                                    {post.category}
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-dark text-sm mb-1 leading-snug">{post.title}</h3>
                                        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">{post.content}</p>

                                        {post.image && (
                                            <img src={post.image} alt="" className="w-full rounded-xl mb-3 max-h-64 object-cover" />
                                        )}
                                        {post.video && (
                                            <video src={post.video} controls className="w-full rounded-xl mb-3 max-h-64" />
                                        )}

                                        <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
                                            <button onClick={() => toggleLike(post.id, post.isReal)}
                                                className={`flex items-center gap-1 transition-colors duration-200 ${post.liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
                                                <FiHeart size={14} className={post.liked ? 'fill-current' : ''} />
                                                <span className="text-xs">{post.likes}</span>
                                            </button>
                                            <button onClick={() => handleShowComments(post.id, post.isReal)}
                                                className={`flex items-center gap-1 transition-colors duration-200 ${showComments === post.id ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}>
                                                <FiMessageCircle size={14} />
                                                <span className="text-xs">{post.commentCount || 0}</span>
                                            </button>
                                            <button onClick={() => handleShare(post)}
                                                className="flex items-center gap-1 text-gray-400 hover:text-primary transition-colors duration-200">
                                                <FiShare2 size={14} />
                                            </button>
                                            <button onClick={() => toggleSave(post.id)}
                                                className={`ml-auto transition-colors duration-200 ${post.saved ? 'text-primary' : 'text-gray-300 hover:text-primary'}`}>
                                                <FiBookmark size={14} className={post.saved ? 'fill-current' : ''} />
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {showComments === post.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-3 pt-3 border-t border-gray-100">
                                                    <div className="flex flex-col gap-3 mb-3 max-h-48 overflow-y-auto">
                                                        {!commentsMap[post.id] ? (
                                                            <p className="text-xs text-gray-400 text-center py-2">Loading comments...</p>
                                                        ) : commentsMap[post.id].length === 0 ? (
                                                            <p className="text-xs text-gray-400 text-center py-2">No comments yet — be the first!</p>
                                                        ) : (
                                                            commentsMap[post.id].map((comment, ci) => (
                                                                <div key={ci} className="flex items-start gap-2">
                                                                    <div
                                                                        onClick={() => comment.author?._id && comment.author._id !== user.id && router.push(`/profile/${comment.author._id}`)}
                                                                        className={`w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 ${comment.author?._id && comment.author._id !== user.id ? 'cursor-pointer hover:bg-primary/20' : ''}`}>
                                                                        {comment.author?.name?.charAt(0) || 'S'}
                                                                    </div>
                                                                    <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                                                                        <p
                                                                            onClick={() => comment.author?._id && comment.author._id !== user.id && router.push(`/profile/${comment.author._id}`)}
                                                                            className={`text-xs font-semibold text-dark ${comment.author?._id && comment.author._id !== user.id ? 'cursor-pointer hover:text-primary' : ''}`}>
                                                                            {comment.author?.name || 'Student'}
                                                                        </p>
                                                                        <p className="text-xs text-gray-600 mt-0.5">{comment.text}</p>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                            {user.name?.charAt(0) || 'S'}
                                                        </div>
                                                        <div className="flex-1 flex gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Write a comment..."
                                                                value={commentText}
                                                                onChange={e => setCommentText(e.target.value)}
                                                                onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)}
                                                                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary transition"
                                                            />
                                                            <button
                                                                onClick={() => handleAddComment(post.id)}
                                                                disabled={commentLoading || !commentText.trim()}
                                                                className="p-2 bg-primary text-white rounded-xl hover:opacity-90 transition disabled:opacity-50">
                                                                <FiSend size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                <div className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0">
                    <div className="bg-white rounded-2xl p-4 border border-gray-100">
                        <div
                            onClick={() => router.push('/profile')}
                            className="flex items-center gap-3 mb-3 cursor-pointer hover:opacity-80 transition">
                            <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center text-white font-bold">
                                {user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SH'}
                            </div>
                            <div>
                                <p className="font-bold text-dark text-sm">{user.name || 'Student'}</p>
                                <p className="text-xs text-gray-400">{user.level || 'ScholarHub'}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-light rounded-xl p-2.5 text-center">
                                <p className="font-extrabold text-primary text-lg">{user.coins || 50}</p>
                                <p className="text-xs text-gray-400">Coins</p>
                            </div>
                            <div className="bg-light rounded-xl p-2.5 text-center">
                                <p className="font-extrabold text-dark text-lg">{myPostCount}</p>
                                <p className="text-xs text-gray-400">Posts</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-gray-100">
                        <h3 className="font-bold text-dark text-sm mb-3">🏆 Top Scholars</h3>
                        <div className="flex flex-col gap-2">
                            {leaderboard.length > 0 ? leaderboard.map((s, i) => (
                                <div key={s._id}
                                    onClick={() => s._id && router.push(`/profile/${s._id}`)}
                                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
                                    <span className="text-base">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-dark truncate">{s.name}</p>
                                        {s.school && (
                                            <span className="inline-block text-white font-bold rounded-full px-1.5 py-0.5"
                                                style={{ backgroundColor: stringToColor(s.school), fontSize: '9px' }}>
                                                {getSchoolAbbr(s.school)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs font-bold text-primary">{s.coins?.toLocaleString()}</p>
                                </div>
                            )) : (
                                <p className="text-xs text-gray-400 text-center py-2">No scholars yet</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-dark rounded-2xl p-4">
                        <p className="text-white font-bold text-sm mb-1">🔥 Your Streak</p>
                        <p className="text-gray-400 text-xs mb-3">Post daily to keep your streak alive</p>
                        <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5, 6, 7].map(d => (
                                <div key={d} className={`flex-1 h-2 rounded-full ${d <= myPostCount ? 'bg-accent' : 'bg-white/10'}`} />
                            ))}
                        </div>
                        <p className="text-accent text-xs font-semibold mt-2">{myPostCount} / 7 days</p>
                    </div>
                </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreatePost(true)}
                className="fixed bottom-4 right-4 md:bottom-8 md:right-8 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 hover:opacity-90 transition z-50"
                style={{ width: '48px', height: '48px' }}>
                <FiPlus size={20} />
            </motion.button>

            <AnimatePresence>
                {showCreatePost && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
                        onClick={() => setShowCreatePost(false)}>
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                            className="bg-white rounded-t-3xl md:rounded-2xl p-6 w-full md:max-w-lg md:mx-4"
                            onClick={e => e.stopPropagation()}>
                            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 md:hidden" />
                            <h2 className="text-xl font-bold text-dark mb-4">Create a Post</h2>
                            <select
                                value={newPost.category}
                                onChange={e => setNewPost({ ...newPost, category: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:border-primary transition">
                                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input
                                type="text"
                                placeholder="Post title"
                                value={newPost.title}
                                onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:border-primary transition"
                            />
                            <textarea
                                placeholder="Share your knowledge, notes, gist or anything valuable..."
                                value={newPost.content}
                                onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm mb-1 focus:outline-none focus:border-primary transition resize-none"
                            />
                            {(() => {
                                const subs = user?.badgeSubscriptions || []
                                const active = subs.filter(s => new Date(s.expiresAt) > new Date())
                                const tiers = [
                                    { id: 'badge_extra_premium', limit: 100000 }, { id: 'badge_premium', limit: 1000 }, { id: 'badge_basic', limit: 500 },
                                ]
                                const highest = tiers.find(t => active.some(s => s.id === t.id))
                                const maxChars = highest ? highest.limit : 250
                                const len = newPost.content.length
                                const over = len > maxChars
                                return (
                                    <p className={`text-xs text-right mb-3 ${over ? 'text-red-500' : 'text-gray-400'}`}>
                                        {len}/{maxChars} {highest ? '' : '(free: 250) — upgrade to write more'}
                                    </p>
                                )
                            })()}
                            <div className="flex gap-2 mb-3">
                                <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                                <button type="button" onClick={handleImagePick} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-500 hover:border-primary hover:text-primary transition">
                                    {newPost.image ? '✅ Image' : '📷 Image'}
                                </button>
                                {(() => {
                                    const subs = user?.badgeSubscriptions || []
                                    const active = subs.filter(s => new Date(s.expiresAt) > new Date())
                                    if (!active.some(s => s.id === 'badge_extra_premium')) return null
                                    return (
                                        <button type="button" onClick={handleVideoPick} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-500 hover:border-primary hover:text-primary transition">
                                            {newPost.video ? '✅ Video' : '🎬 Video'}
                                        </button>
                                    )
                                })()}
                                {imageUploading && <span className="text-xs text-gray-400 self-center">Uploading...</span>}
                            </div>
                            {newPost.image && (
                                <div className="relative mb-3">
                                    <img src={newPost.image} alt="" className="w-full rounded-xl max-h-40 object-cover" />
                                    <button onClick={() => setNewPost({ ...newPost, image: null })} className="absolute top-1 right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow text-xs font-bold text-red-500">&times;</button>
                                </div>
                            )}
                            {newPost.video && (
                                <div className="relative mb-3">
                                    <video src={newPost.video} controls className="w-full rounded-xl max-h-40" />
                                    <button onClick={() => setNewPost({ ...newPost, video: null })} className="absolute top-1 right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow text-xs font-bold text-red-500">&times;</button>
                                </div>
                            )}
                            {postError && <p className="text-red-500 text-sm mb-3">{postError}</p>}
                            {postSuccess && <p className="text-primary text-sm mb-3 text-center font-medium">✅ Post submitted for review!</p>}
                            <div className="flex gap-3">
                                <button onClick={() => setShowCreatePost(false)}
                                    className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-dark hover:border-primary transition">
                                    Cancel
                                </button>
                                <button onClick={handleCreatePost} disabled={postLoading}
                                    className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition">
                                    {postLoading ? 'Submitting...' : postSuccess ? '✅ Submitted!' : 'Submit for Review'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <SOSButton />
        </div>
    )
}

export default Home