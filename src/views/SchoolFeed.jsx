/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { FiArrowLeft, FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiPlus, FiUsers, FiBookOpen, FiSend, FiLock, FiMapPin, FiCheck, FiInbox } from "react-icons/fi"
import { createPost, getPosts, likePost, getComments, addComment } from "../api/auth"

function SchoolFeed() {
    const params = useParams() || {}
    const schoolName = params.schoolName
    const router = useRouter()
    const [user, setUser] = useState({})
    const decodedSchool = decodeURIComponent(schoolName)

    const STORAGE_KEY = `scholarhub_joined_school_${schoolName}`

    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(false)
    const [joined, setJoined] = useState(false)

    const schoolLevels = {
        'King\'s College, Lagos': 'Secondary',
        'Loyola Jesuit College': 'Secondary',
        'Queen\'s College': 'Secondary',
        'Government Secondary School, Enugu': 'Secondary',
        'Federal Government College, Ilorin': 'Secondary',
        'Alliance High School': 'Secondary',
        'St. George\'s College': 'Secondary',
        'St. Mary\'s School': 'Secondary',
        'International School of Kenya': 'Secondary',
        'Mpesa Foundation Academy': 'Secondary',
        'Hillcrest Secondary School': 'Secondary',
        'Achimota School': 'Secondary',
        'Ghana National College': 'Secondary',
        'St. Augustine\'s College': 'Secondary',
        'St. John\'s College': 'Secondary',
        'Bishops Diocesan College': 'Secondary',
        'St. Joseph\'s College': 'Secondary',
        'St. Charles Lwanga School': 'Secondary',
        'SOS Hermann Gmeiner School': 'Secondary',
        'Lycée Sainte Famille': 'Secondary',
        'University of Ibadan': 'University',
        'Obafemi Awolowo University': 'University',
        'University of Lagos': 'University',
        'Covenant University': 'University',
        'University of Nigeria Nsukka': 'University',
        'Ahmadu Bello University': 'University',
        'Federal University of Technology Owerri': 'University',
        'University of Benin': 'University',
        'Lagos State University': 'University',
        'Nnamdi Azikiwe University': 'University',
        'University of Cape Town': 'University',
        'University of the Witwatersrand': 'University',
        'Stellenbosch University': 'University',
        'University of Pretoria': 'University',
        'Rhodes University': 'University',
        'University of Johannesburg': 'University',
        'University of Nairobi': 'University',
        'Kenyatta University': 'University',
        'Strathmore University': 'University',
        'Moi University': 'University',
        'Egerton University': 'University',
        'University of Ghana': 'University',
        'Kwame Nkrumah University of Science and Technology': 'University',
        'University of Cape Coast': 'University',
        'Makerere University': 'University',
        'Addis Ababa University': 'University',
        'University of Dar es Salaam': 'University',
        'Cairo University': 'University',
        'University of Khartoum': 'University',
        'University of Botswana': 'University',
        'Université Cheikh Anta Diop': 'University',
    }
    const schoolLevel = schoolLevels[decodedSchool]
    const storedLevel = typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('user') || '{}').level || '') : ''
    const [userData, setUserData] = useState({level: storedLevel})
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user') || '{}')
        setUserData(stored)
        if (!stored.level) {
            import('../api/auth').then(mod => mod.getMe().then(res => {
                setUserData(res.data)
                localStorage.setItem('user', JSON.stringify(res.data))
            }).catch(() => {}))
        }
    }, [])
    const effectiveLevel = userData.level === 'JSS' || userData.level === 'SSS' ? 'Secondary' : userData.level
    if (schoolLevel && effectiveLevel && effectiveLevel !== schoolLevel) {
        return <div className="min-h-screen bg-light md:pl-56 pt-16 md:pt-0 flex items-center justify-center"><div className="text-center"><p className="text-2xl mb-2"><FiLock size={28} /></p><p className="font-bold text-dark mb-1">This school is not available for your level</p><p className="text-sm text-gray-400">You can only access schools in your education level.</p></div></div>
    }

    useEffect(() => {
        try { setUser(JSON.parse(localStorage.getItem('user') || '{}')) } catch (e) {}
        setJoined(localStorage.getItem(STORAGE_KEY) === 'true')
    }, [])
    const [showCreatePost, setShowCreatePost] = useState(false)
    const [newPost, setNewPost] = useState({ title: '', content: '' })
    const [postLoading, setPostLoading] = useState(false)
    const [postSuccess, setPostSuccess] = useState(false)
    const [postError, setPostError] = useState('')
    const [memberCount, setMemberCount] = useState(0)
    const [showComments, setShowComments] = useState(null)
    const [commentsMap, setCommentsMap] = useState({})
    const [commentText, setCommentText] = useState('')
    const [commentLoading, setCommentLoading] = useState(false)

    const accentColor = '#008751'

    useEffect(() => {
        if (!joined) { setPosts([]); return }
        const fetchPosts = async () => {
            setLoading(true)
            try {
                const res = await getPosts()
                const schoolPosts = res.data.filter(p => {
                    const authorSchool = (p.author?.school || '').toLowerCase().trim()
                    return authorSchool === decodedSchool.toLowerCase().trim()
                })
                const mapped = schoolPosts.map(post => ({
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
                    isReal: true
                }))
                setPosts(mapped)
                setMemberCount(new Set(schoolPosts.map(p => p.author?._id)).size)
            } catch (err) {
                console.error(err)
                setPosts([])
            } finally {
                setLoading(false)
            }
        }
        fetchPosts()
    }, [decodedSchool, joined])

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
            await createPost({ ...newPost })
            setPostSuccess(true)
            setNewPost({ title: '', content: '' })
            setTimeout(() => { setShowCreatePost(false); setPostSuccess(false) }, 2000)
        } catch (err) { setPostError(err.response?.data?.message || 'Something went wrong') }
        finally { setPostLoading(false) }
    }

    const handleShare = (post) => {
        if (navigator.share) { navigator.share({ title: post.title, text: post.content, url: window.location.href }) }
        else { navigator.clipboard.writeText(window.location.href); alert('Link copied!') }
    }

    return (
        <div className="min-h-screen bg-light md:pl-56 pt-14 md:pt-0">
            <div className="bg-gradient-to-r from-dark to-primary px-4 md:px-6 py-4 pb-6 md:py-8">
                <div className="max-w-5xl mx-auto">
                    <button onClick={() => router.push('/community')}
                        className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition">
                        <FiArrowLeft size={16} /> All Communities
                    </button>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                <FiMapPin size={22} className="text-white flex-shrink-0" />
                                <h1 className="text-xl md:text-3xl font-extrabold text-white leading-tight">{decodedSchool}</h1>
                            </div>
                            <p className="text-white/80 text-sm max-w-lg mb-3 leading-relaxed">
                                School community for students of {decodedSchool}. Share notes, ask questions, and connect with schoolmates.
                            </p>
                            <div className="flex items-center gap-4 flex-wrap">
                                {joined && memberCount > 0 && (
                                    <div className="flex items-center gap-1.5 text-white/80 text-xs md:text-sm">
                                        <FiUsers size={13} /><span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 text-white/80 text-xs md:text-sm">
                                    <FiBookOpen size={13} /><span>School Community</span>
                                </div>
                                {joined && (
                                    <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full"><FiCheck size={12} className="inline mr-1" />Member</span>
                                )}
                            </div>
                        </div>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={joined ? handleLeave : handleJoin}
                            className={`self-start px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${joined ? 'bg-white/20 text-white border border-white/40 hover:bg-white/30' : 'bg-white text-gray-800 hover:opacity-90'}`}>
                            {joined ? <><FiCheck size={14} className="inline mr-1" /> Joined</> : 'Join School Community'}
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
                                style={{ backgroundColor: accentColor + '20' }}>
                                <FiLock size={36} style={{ color: accentColor }} />
                            </div>
                            <h2 className="text-xl font-extrabold text-dark mb-2">Join to see posts</h2>
                            <p className="text-gray-400 text-sm mb-6 max-w-sm leading-relaxed">
                                Join the {decodedSchool} community to see posts, share knowledge and connect with schoolmates.
                            </p>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={handleJoin}
                                className="text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-lg hover:opacity-90 transition flex items-center gap-2"
                                style={{ backgroundColor: accentColor }}>
                                <FiUsers size={16} /> Join {decodedSchool}
                            </motion.button>
                        </motion.div>
                    ) : (
                        <>
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
                                ) : posts.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <FiInbox size={36} className="text-gray-300 mx-auto mb-3" />
                                        <p className="font-semibold mb-1">No posts from this school yet</p>
                                        <p className="text-sm">Be the first to post something!</p>
                                    </div>
                                ) : posts.map((post, i) => (
                                    <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300">

                                        <div className="flex items-center gap-3 mb-3">
                                            <div
                                                onClick={(e) => { e.stopPropagation(); post.authorId && post.authorId !== user.id && router.push(`/profile/${post.authorId}`) }}
                                                className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${post.authorId && post.authorId !== user.id ? 'cursor-pointer hover:opacity-80' : ''}`}
                                                style={{ backgroundColor: accentColor }}>
                                                {post.avatar}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    onClick={(e) => { e.stopPropagation(); post.authorId && post.authorId !== user.id && router.push(`/profile/${post.authorId}`) }}
                                                    className={`font-semibold text-dark text-xs md:text-sm truncate ${post.authorId && post.authorId !== user.id ? 'cursor-pointer hover:text-primary transition' : ''}`}>
                                                    {post.author}
                                                </p>
                                                <p className="text-xs text-gray-400">{post.time} {post.school ? `• ${post.school}` : ''}</p>
                                            </div>
                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-primary border border-green-200">
                                                {post.category}
                                            </span>
                                        </div>

                                        <div onClick={() => router.push(`/post/${post.id}`)} className="cursor-pointer">
                                          <h3 className="font-bold text-dark text-sm md:text-base mb-1.5 leading-snug">{post.title}</h3>
                                          <p className="text-gray-500 text-xs md:text-sm leading-relaxed line-clamp-2 mb-3">{post.content}</p>
                                        </div>

                                        <div className="flex items-center gap-3 pt-2.5 border-t border-gray-50">
                                            <button onClick={(e) => { e.stopPropagation(); toggleLike(post.id, post.isReal) }}
                                                className={`flex items-center gap-1 text-sm transition-colors duration-200 ${post.liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
                                                <FiHeart size={14} className={post.liked ? 'fill-current' : ''} />
                                                <span className="text-xs">{post.likes}</span>
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleShowComments(post.id, post.isReal) }}
                                                className={`flex items-center gap-1 text-sm transition-colors duration-200 ${showComments === post.id ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}>
                                                <FiMessageCircle size={14} />
                                                <span className="text-xs">{post.commentCount || 0}</span>
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleShare(post) }}
                                                className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary transition-colors duration-200">
                                                <FiShare2 size={14} />
                                                <span className="text-xs hidden sm:block">Share</span>
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); toggleSave(post.id) }}
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
                                                            <p className="text-xs text-gray-400 text-center py-2">No comments yet</p>
                                                        ) : (
                                                            commentsMap[post.id].map((comment, ci) => (
                                                                <div key={ci} className="flex items-start gap-2">
                                                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-primary">
                                                                        {comment.author?.name?.charAt(0) || 'S'}
                                                                    </div>
                                                                    <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                                                                        <p className="text-xs font-semibold text-dark">{comment.author?.name || 'Student'}</p>
                                                                        <p className="text-xs text-gray-600 mt-0.5">{comment.text}</p>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-primary">
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
                                                                style={{ backgroundColor: accentColor }}>
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
                    <div className="bg-dark rounded-2xl p-4">
                        <p className="text-white font-bold text-sm mb-3">Your Stats</p>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white/10 rounded-xl p-2.5 text-center">
                                <p className="text-white font-extrabold text-lg">{user.coins || 50}</p>
                                <p className="text-gray-400 text-xs">Coins</p>
                            </div>
                            <div className="bg-white/10 rounded-xl p-2.5 text-center">
                                <p className="text-white font-extrabold text-lg">{user.level || '-'}</p>
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
                    style={{ backgroundColor: accentColor }}>
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
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs bg-primary">
                                    {user.name?.charAt(0) || 'S'}
                                </div>
                                <div>
                                    <p className="font-bold text-dark text-sm">{user.name || 'Student'}</p>
                                    <p className="text-xs text-gray-400">Posting to {decodedSchool}</p>
                                </div>
                            </div>
                            <input type="text" placeholder="Post title" value={newPost.title}
                                onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm mb-3 bg-white text-dark focus:outline-none focus:border-primary transition" />
                            <textarea placeholder="Share your knowledge, ask a question..."
                                value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                                rows={5} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm mb-4 bg-white text-dark focus:outline-none focus:border-primary transition resize-none" />
                            {postError && <p className="text-red-500 text-sm mb-3">{postError}</p>}
                            {postSuccess && <p className="text-green-600 text-sm mb-3 text-center font-medium"><FiCheck size={14} className="inline mr-1" /> Post submitted for review!</p>}
                            <div className="flex gap-3">
                                <button onClick={() => setShowCreatePost(false)}
                                    className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-dark hover:border-primary transition">Cancel</button>
                                <button onClick={handleCreatePost} disabled={postLoading}
                                    className="flex-1 py-3 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition"
                                    style={{ backgroundColor: accentColor }}>
                                    {postLoading ? 'Submitting...' : postSuccess ? <><FiCheck size={14} className="inline mr-1" /> Submitted!</> : 'Submit for Review'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default SchoolFeed