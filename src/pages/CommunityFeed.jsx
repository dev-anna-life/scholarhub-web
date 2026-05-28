/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { FiArrowLeft, FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiPlus, FiUsers, FiTrendingUp, FiStar, FiBookOpen, FiZap, FiAward, FiSend, FiMessageSquare, FiLock } from "react-icons/fi"
import { createPost, getPosts, likePost, getComments, addComment } from "../api/auth"

const communityData = {
    jss: {
        name: 'JSS Community', level: 'JSS',
        description: 'Junior secondary students sharing knowledge and growing together',
        color: 'from-[#1F2A1F] to-[#2d4a2d]', accentColor: '#008751',
        lightColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-[#1F2A1F]',
        icon: FiBookOpen,
        pinned: 'Welcome to the JSS Community! Share your notes, ask questions and help each other grow.',
        topContributors: [],
        categories: ['All', 'Basic Science', 'Mathematics', 'English', 'Social Studies', 'CRS/IRS', 'Gist'],
    },
    sss: {
        name: 'SSS Community', level: 'SSS',
        description: 'Senior secondary students conquering WAEC, NECO and JAMB together',
        color: 'from-[#008751] to-[#00a86b]', accentColor: '#008751',
        lightColor: 'bg-emerald-50', borderColor: 'border-emerald-200', textColor: 'text-emerald-800',
        icon: FiZap,
        pinned: 'WAEC 2026 starts soon! Check the pinned past questions and study guides. Good luck to everyone!',
        topContributors: [],
        categories: ['All', 'WAEC Prep', 'JAMB', 'Chemistry', 'Physics', 'Mathematics', 'Literature', 'Gist'],
    },
    university: {
        name: 'University Hub', level: 'University',
        description: 'Undergraduates sharing notes, past questions and campus life',
        color: 'from-[#FF9F1C] to-[#ffb347]', accentColor: '#FF9F1C',
        lightColor: 'bg-orange-50', borderColor: 'border-orange-200', textColor: 'text-orange-800',
        icon: FiStar,
        pinned: 'Internship season is here! Share opportunities, tips and experiences with your fellow students.',
        topContributors: [],
        categories: ['All', 'Lecture Notes', 'Past Questions', 'Campus Gist', 'Internships', 'Projects', 'Research'],
    },
    postgrad: {
        name: 'Postgrad Network', level: 'Postgrad',
        description: 'Masters and PhD students collaborating on research and academic excellence',
        color: 'from-[#1F2A1F] to-[#008751]', accentColor: '#1F2A1F',
        lightColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-[#1F2A1F]',
        icon: FiAward,
        pinned: 'Research collaboration thread is live! Connect with fellow researchers across Africa.',
        topContributors: [],
        categories: ['All', 'Research', 'Thesis Help', 'Publications', 'Scholarships', 'Academia', 'Gist'],
    },
}

function CommunityFeed() {
    const params = useParams() || {}
    const level = params.level
    const router = useRouter()
    const community = communityData[level] || communityData.university
    const [user, setUser] = useState({})

    const STORAGE_KEY = `scholarhub_joined_${level}`
    const [joined, setJoined] = useState(false)
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(false)
    const [showComments, setShowComments] = useState(null)
    const [commentsMap, setCommentsMap] = useState({})
    const [commentText, setCommentText] = useState('')
    const [commentLoading, setCommentLoading] = useState(false)
    const [topContributors, setTopContributors] = useState([])
    const [showCreatePost, setShowCreatePost] = useState(false)
    const [postSuccess, setPostSuccess] = useState(false)
    const [postError, setPostError] = useState('')
    const [postLoading, setPostLoading] = useState(false)
    const [newPost, setNewPost] = useState({ title: '', content: '', category: '' })
    const [memberCount, setMemberCount] = useState(0)
    const [activeCategory, setActiveCategory] = useState('All')

    useEffect(() => {
        try { setUser(JSON.parse(localStorage.getItem('user') || '{}')) } catch (e) {}
        setJoined(localStorage.getItem(STORAGE_KEY) === 'true')
    }, [level])

    useEffect(() => {
        if (!joined) { setPosts([]); return }
        const fetchPosts = async () => {
            setLoading(true)
            try {
                const res = await getPosts()
                const levelPosts = res.data.filter(p =>
                    p.author?.level?.toLowerCase() === level.toLowerCase()
                )
                const realPosts = levelPosts.map(post => ({
                    id: post._id,
                    authorId: post.author?._id || '',
                    author: post.author?.name || 'Student',
                    avatar: post.author?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SH',
                    school: post.author?.school || '',
                    category: post.category,
                    title: post.title,
                    content: post.content,
                    likes: post.likes?.length || 0,
                    liked: post.likes?.includes(user.id) || false,
                    commentCount: post.commentsData?.length || 0,
                    time: new Date(post.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
                    trending: post.trending || false,
                    saved: false,
                    isReal: true
                }))
                setPosts(realPosts)
                setMemberCount(levelPosts.length > 0 ? new Set(levelPosts.map(p => p.author?._id)).size : 0)
                const authorMap = {}
                levelPosts.forEach(p => {
                    const id = p.author?._id
                    if (!id) return
                    if (!authorMap[id]) authorMap[id] = { name: p.author?.name || 'Student', coins: p.author?.coins || 0, avatar: p.author?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SH' }
                })
                setTopContributors(Object.values(authorMap).sort((a, b) => b.coins - a.coins).slice(0, 3))
            } catch (err) {
                console.error(err)
                setPosts([])
            } finally {
                setLoading(false)
            }
        }
        fetchPosts()
    }, [level, joined])

    const handleJoin = () => { localStorage.setItem(STORAGE_KEY, 'true'); setJoined(true) }
    const handleLeave = () => { localStorage.removeItem(STORAGE_KEY); setJoined(false); setPosts([]) }

    const toggleLike = async (id, isReal) => {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p))
        if (!isReal) return
        try { await likePost(id) } catch (err) {
            setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p))
        }
    }

    const toggleSave = (id) => setPosts(prev => prev.map(p => p.id === id ? { ...p, saved: !p.saved } : p))

    const handleShowComments = async (postId, isReal) => {
        if (showComments === postId) { setShowComments(null); return }
        setShowComments(postId)
        if (!isReal || commentsMap[postId]) return
        try {
            const res = await getComments(postId)
            setCommentsMap(prev => ({ ...prev, [postId]: res.data }))
        } catch (err) { setCommentsMap(prev => ({ ...prev, [postId]: [] })) }
    }

    const handleAddComment = async (postId) => {
        if (!commentText.trim()) return
        setCommentLoading(true)
        try {
            const res = await addComment(postId, commentText)
            setCommentsMap(prev => ({ ...prev, [postId]: [...(prev[postId] || []), res.data] }))
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p))
            setCommentText('')
        } catch (err) { console.error(err) }
        finally { setCommentLoading(false) }
    }

    const handleCreatePost = async () => {
        if (!newPost.title.trim() || !newPost.content.trim()) { setPostError('Title and content are required'); return }
        setPostLoading(true); setPostError('')
        try {
            await createPost({ ...newPost, community: level })
            setPostSuccess(true)
            setNewPost({ title: '', content: '', category: community.categories[1] })
            setTimeout(() => { setShowCreatePost(false); setPostSuccess(false) }, 2000)
        } catch (err) { setPostError(err.response?.data?.message || 'Something went wrong') }
        finally { setPostLoading(false) }
    }

    const handleShare = (post) => {
        if (navigator.share) { navigator.share({ title: post.title, text: post.content, url: window.location.href }) }
        else { navigator.clipboard.writeText(window.location.href); alert('Link copied!') }
    }

    const filteredPosts = posts.filter(p => activeCategory === 'All' || p.category === activeCategory)

    return (
        <div className="min-h-screen bg-light md:pl-56 pt-14 md:pt-0">

            <div className={`bg-gradient-to-r ${community.color} px-4 md:px-6 py-4 pb-6 md:py-8`}>
                <div className="max-w-5xl mx-auto">
                    <button onClick={() => router.push('/community')}
                        className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition">
                        <FiArrowLeft size={16} /> All Communities
                    </button>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                <community.icon size={22} className="text-white flex-shrink-0" />
                                <h1 className="text-xl md:text-3xl font-extrabold text-white leading-tight">{community.name}</h1>
                            </div>
                            <p className="text-white/80 text-sm max-w-lg mb-3 leading-relaxed">{community.description}</p>
                            <div className="flex items-center gap-4 flex-wrap">
                                {joined && memberCount > 0 && (
                                    <div className="flex items-center gap-1.5 text-white/80 text-xs md:text-sm">
                                        <FiUsers size={13} /><span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 text-white/80 text-xs md:text-sm">
                                    <FiTrendingUp size={13} /><span>Active now</span>
                                </div>
                                {joined && (
                                    <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">✓ Member</span>
                                )}
                            </div>
                        </div>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={joined ? handleLeave : handleJoin}
                            className={`self-start px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${joined ? 'bg-white/20 text-white border border-white/40 hover:bg-white/30' : 'bg-white text-gray-800 hover:opacity-90'}`}>
                            {joined ? '✓ Joined' : 'Join Community'}
                        </motion.button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6 flex gap-6">
                <div className="flex-1 min-w-0">
                    {!joined ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 mx-auto"
                                style={{ backgroundColor: community.accentColor + '20' }}>
                                <FiLock size={36} style={{ color: community.accentColor }} />
                            </div>
                            <h2 className="text-xl font-extrabold text-dark mb-2">Join to see posts</h2>
                            <p className="text-gray-400 text-sm mb-6 max-w-sm leading-relaxed">
                                This community is for members only. Join the {community.name} to see posts, share knowledge and connect with fellow students.
                            </p>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={handleJoin}
                                className="text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-lg hover:opacity-90 transition flex items-center gap-2"
                                style={{ backgroundColor: community.accentColor }}>
                                <FiUsers size={16} /> Join {community.name}
                            </motion.button>
                        </motion.div>
                    ) : (
                        <>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className={`${community.lightColor} border ${community.borderColor} rounded-2xl p-4 mb-5 flex items-start gap-3`}>
                                <span className="text-base flex-shrink-0 mt-0.5">📌</span>
                                <p className={`text-sm ${community.textColor} font-medium leading-relaxed w-full`}>{community.pinned}</p>
                            </motion.div>

                            <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide">
                                {community.categories.map(cat => (
                                    <button key={cat} onClick={() => setActiveCategory(cat)}
                                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${activeCategory === cat ? 'text-white shadow-md' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'}`}
                                        style={activeCategory === cat ? { backgroundColor: community.accentColor } : {}}>
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-col gap-4">
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
                                            <div className="h-3 bg-gray-100 rounded w-full" />
                                        </div>
                                    ))
                                ) : filteredPosts.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <p className="text-4xl mb-3">📭</p>
                                        <p className="font-semibold mb-1">No posts yet</p>
                                        <p className="text-sm">Be the first to post something!</p>
                                    </div>
                                ) : filteredPosts.map((post, i) => (
                                    <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300">

                                        <div className="flex items-center gap-3 mb-3">
                                            <div
                                                onClick={() => post.authorId && post.authorId !== user.id && router.push(`/profile/${post.authorId}`)}
                                                className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${post.authorId && post.authorId !== user.id ? 'cursor-pointer hover:opacity-80' : ''}`}
                                                style={{ backgroundColor: community.accentColor }}>
                                                {post.avatar}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    onClick={() => post.authorId && post.authorId !== user.id && router.push(`/profile/${post.authorId}`)}
                                                    className={`font-semibold text-dark text-xs md:text-sm truncate ${post.authorId && post.authorId !== user.id ? 'cursor-pointer hover:text-primary transition' : ''}`}>
                                                    {post.author}
                                                </p>
                                                <p className="text-xs text-gray-400">{post.time}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                {post.trending && (
                                                    <span className="bg-accent/10 text-accent text-xs font-semibold px-2 py-0.5 rounded-full hidden sm:block">Trending</span>
                                                )}
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${community.lightColor} ${community.textColor}`}>
                                                    {post.category}
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-dark text-sm md:text-base mb-1.5 leading-snug">{post.title}</h3>
                                        <p className="text-gray-500 text-xs md:text-sm leading-relaxed line-clamp-2 mb-3">{post.content}</p>

                                        <div className="flex items-center gap-3 pt-2.5 border-t border-gray-50">
                                            <button onClick={() => toggleLike(post.id, post.isReal)}
                                                className={`flex items-center gap-1 text-sm transition-colors duration-200 ${post.liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
                                                <FiHeart size={14} className={post.liked ? 'fill-current' : ''} />
                                                <span className="text-xs">{post.likes}</span>
                                            </button>
                                            <button onClick={() => handleShowComments(post.id, post.isReal)}
                                                className={`flex items-center gap-1 text-sm transition-colors duration-200 ${showComments === post.id ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}>
                                                <FiMessageCircle size={14} />
                                                <span className="text-xs">{post.commentCount || 0}</span>
                                            </button>
                                            <button onClick={() => handleShare(post)}
                                                className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary transition-colors duration-200">
                                                <FiShare2 size={14} />
                                                <span className="text-xs hidden sm:block">Share</span>
                                            </button>
                                            {post.authorId && post.authorId !== user.id && (
                                                <button onClick={(e) => { e.stopPropagation(); router.push(`/chat?user=${post.authorId}`) }}
                                                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary transition-colors duration-200">
                                                    <FiMessageSquare size={14} />
                                                    <span className="text-xs hidden sm:block">Message</span>
                                                </button>
                                            )}
                                            <button onClick={() => toggleSave(post.id)}
                                                className={`ml-auto transition-colors duration-200 ${post.saved ? 'text-primary' : 'text-gray-300 hover:text-primary'}`}>
                                                <FiBookmark size={14} className={post.saved ? 'fill-current' : ''} />
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {showComments === post.id && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-gray-100">
                                                    <div className="flex flex-col gap-3 mb-3 max-h-48 overflow-y-auto">
                                                        {!commentsMap[post.id] ? (
                                                            <p className="text-xs text-gray-400 text-center py-2">Loading comments...</p>
                                                        ) : commentsMap[post.id].length === 0 ? (
                                                            <p className="text-xs text-gray-400 text-center py-2">No comments yet - be the first!</p>
                                                        ) : (
                                                            commentsMap[post.id].map((comment, ci) => (
                                                                <div key={ci} className="flex items-start gap-2">
                                                                    <div
                                                                        onClick={() => comment.author?._id && comment.author._id !== user.id && router.push(`/profile/${comment.author._id}`)}
                                                                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${comment.author?._id && comment.author._id !== user.id ? 'cursor-pointer hover:opacity-80' : ''}`}
                                                                        style={{ backgroundColor: community.accentColor }}>
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
                                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                            style={{ backgroundColor: community.accentColor }}>
                                                            {user.name?.charAt(0) || 'S'}
                                                        </div>
                                                        <div className="flex-1 flex gap-2">
                                                            <input type="text" placeholder="Write a comment..."
                                                                value={commentText}
                                                                onChange={e => setCommentText(e.target.value)}
                                                                onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)}
                                                                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary transition" />
                                                            <button onClick={() => handleAddComment(post.id)}
                                                                disabled={commentLoading || !commentText.trim()}
                                                                className="p-2 text-white rounded-xl hover:opacity-90 transition disabled:opacity-50"
                                                                style={{ backgroundColor: community.accentColor }}>
                                                                <FiSend size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="hidden lg:flex flex-col gap-4 w-64 flex-shrink-0">
                    {joined && topContributors.length > 0 && (
                        <div className="bg-white rounded-2xl p-4 border border-gray-100">
                            <h3 className="font-bold text-dark text-sm mb-3 flex items-center gap-2">
                                <FiStar size={15} className="text-accent" /> Top Contributors
                            </h3>
                            <div className="flex flex-col gap-3">
                                {topContributors.map((c, i) => (
                                    <div key={c.name} className="flex items-center gap-2.5">
                                        <span className="text-base">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                            style={{ backgroundColor: community.accentColor }}>
                                            {c.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-dark truncate">{c.name}</p>
                                            <p className="text-xs text-gray-400">{c.coins} coins</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl p-4 border border-gray-100">
                        <h3 className="font-bold text-dark text-sm mb-3">📜 Community Rules</h3>
                        <div className="flex flex-col gap-2">
                            {['Be respectful to everyone', 'Share only educational content', 'No spam or self-promotion', 'Credit original sources', 'No hate speech'].map((rule, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <span className="text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-0.5"
                                        style={{ backgroundColor: community.accentColor }}>
                                        {i + 1}
                                    </span>
                                    <p className="text-xs text-gray-500 leading-relaxed">{rule}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-dark rounded-2xl p-4">
                        <p className="text-white font-bold text-sm mb-3">Your Stats</p>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white/10 rounded-xl p-2.5 text-center">
                                <p className="text-white font-extrabold text-lg">{user.coins || 50}</p>
                                <p className="text-gray-400 text-xs">Coins</p>
                            </div>
                            <div className="bg-white/10 rounded-xl p-2.5 text-center">
                                <p className="text-white font-extrabold text-lg">{user.level || '—'}</p>
                                <p className="text-gray-400 text-xs">Level</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {joined && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreatePost(true)}
                    className="fixed bottom-4 right-4 md:bottom-8 md:right-8 text-white w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-lg transition z-50"
                    style={{ backgroundColor: community.accentColor }}>
                    <FiPlus size={22} />
                </motion.button>
            )}

            <AnimatePresence>
                {showCreatePost && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
                        onClick={() => setShowCreatePost(false)}>
                        <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                            className="bg-white rounded-t-3xl md:rounded-2xl p-6 w-full md:max-w-lg md:mx-4"
                            onClick={e => e.stopPropagation()}>
                            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 md:hidden" />
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                                    style={{ backgroundColor: community.accentColor }}>
                                    {user.name?.charAt(0) || 'S'}
                                </div>
                                <div>
                                    <p className="font-bold text-dark text-sm">{user.name || 'Student'}</p>
                                    <p className="text-xs text-gray-400">Posting to {community.name}</p>
                                </div>
                            </div>
                            <select value={newPost.category} onChange={e => setNewPost({ ...newPost, category: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:border-primary transition">
                                {community.categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input type="text" placeholder="Post title" value={newPost.title}
                                onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:border-primary transition" />
                            <textarea placeholder="Share your knowledge, ask a question, or drop a gist..."
                                value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                                rows={5} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm mb-4 focus:outline-none focus:border-primary transition resize-none" />
                            {postError && <p className="text-red-500 text-sm mb-3">{postError}</p>}
                            {postSuccess && <p className="text-sm mb-3 text-center font-medium" style={{ color: community.accentColor }}>✅ Post submitted for review!</p>}
                            <div className="flex gap-3">
                                <button onClick={() => setShowCreatePost(false)}
                                    className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-dark hover:border-primary transition">Cancel</button>
                                <button onClick={handleCreatePost} disabled={postLoading}
                                    className="flex-1 py-3 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition"
                                    style={{ backgroundColor: community.accentColor }}>
                                    {postLoading ? 'Submitting...' : postSuccess ? '✅ Submitted!' : 'Submit for Review'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default CommunityFeed