'use client'
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FiArrowLeft, FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiSend, FiInbox, FiGlobe } from "react-icons/fi"
import { useRouter, useSearchParams } from "next/navigation"
import { getPosts, likePost, getComments, addComment, savePost } from "../api/auth"
import CommentDrawer from '../components/CommentDrawer'
import { getSchoolAbbr, stringToColor } from '../utils/school'

function CommunityView({ communityId }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const communityName = searchParams?.get('name') || 'Community'
    const communityType = searchParams?.get('type') || ''
    const isGlobal = communityType === 'global'

    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeCommentPost, setActiveCommentPost] = useState(null)
    const [commentsMap, setCommentsMap] = useState({})
    const [commentText, setCommentText] = useState('')
    const [commentLoading, setCommentLoading] = useState(false)
    const [user, setUser] = useState({})

    useEffect(() => {
        try { setUser(JSON.parse(localStorage.getItem('user') || '{}')) } catch (e) {}
    }, [])

    useEffect(() => {
        if (!communityId) return
        const fetchPosts = async () => {
            setLoading(true)
            try {
                const res = await getPosts(1, '', 'community', '', communityId)
                const postsData = res.data?.posts || res.data || []
                const mapped = postsData.map(post => ({
                    id: post._id,
                    authorId: post.author?._id || '',
                    author: post.author?.name || 'Student',
                    avatar: post.author?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SH',
                    school: post.author?.school || '',
                    category: post.category,
                    title: post.title,
                    content: post.content,
                    image: post.image || '',
                    likes: post.likesCount ?? post.likes?.length ?? 0,
                    liked: post.liked || post.likes?.includes(user?._id || user?.id) || false,
                    commentCount: post.commentCount ?? post.commentsData?.length ?? 0,
                    time: new Date(post.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
                    saved: false,
                    isReal: true
                }))
                setPosts(mapped)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchPosts()
    }, [communityId])

    const toggleLike = async (id, isReal) => {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p))
        if (!isReal) return
        try { await likePost(id) } catch (_) {}
    }

    const toggleSave = async (id) => {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, saved: !p.saved } : p))
        try { await savePost(id) } catch (_) {}
    }

    const handleShowComments = async (post) => {
        const pId = post.id || post._id
        if (activeCommentPost?.id === pId || activeCommentPost?._id === pId) {
            setActiveCommentPost(null)
            return
        }
        setActiveCommentPost(post)
        if (commentsMap[pId]) return
        try {
            const res = await getComments(pId)
            setCommentsMap(prev => ({ ...prev, [pId]: res.data }))
        } catch (_) { setCommentsMap(prev => ({ ...prev, [pId]: [] })) }
    }

    const handleAddComment = async (postId, text, parentId) => {
        if (!text || !text.trim()) return
        const res = await addComment(postId, text, parentId)
        setCommentsMap(prev => ({ ...prev, [postId]: [...(prev[postId] || []), res.data] }))
        setPosts(prev => prev.map(p => (p.id === postId || p._id === postId) ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p))
        return res.data
    }

    const handleShare = (post) => {
        const postUrl = `${window.location.origin}/post/${post.id || post._id}`
        if (navigator.share) navigator.share({ title: post.title || 'ScholarHub Post', url: postUrl })
        else { navigator.clipboard.writeText(postUrl); alert('Post link copied to clipboard!') }
    }

    return (
        <div className="min-h-screen bg-light md:pl-56 pt-16 md:pt-0">
            <div className="sticky top-0 md:top-0 z-40 bg-dark px-4 md:px-6 py-3 md:py-4">
                <div className="max-w-5xl mx-auto flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-1.5 text-white/70 hover:text-white transition">
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-extrabold text-white flex items-center gap-2">
                            {isGlobal && <FiGlobe size={16} className="text-orange-400" />}
                            {communityName}
                        </h1>
                        <p className="text-xs text-white/60">{isGlobal ? 'Global · All schools' : 'Community feed'}</p>
                    </div>
                </div>
            </div>

            {isGlobal && (
                <div className="bg-orange-50 border-b border-orange-100 px-4 py-2.5">
                    <p className="text-xs text-orange-700 text-center max-w-5xl mx-auto">
                        🌍 <strong>Global community</strong> — Students from all schools studying {communityName} can post and connect here
                    </p>
                </div>
            )}

            <div className="max-w-5xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
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
                            </div>
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <FiInbox size={36} className="mb-3" />
                        <p className="text-base font-semibold mb-1">No posts in this community yet</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {posts.map((post, i) => (
                            <motion.div key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white rounded-2xl p-3 md:p-5 border border-gray-100">

                                <div className="flex items-start gap-2 mb-3">
                                    <div className="w-8 h-8 md:w-9 md:h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                                        {post.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-dark text-xs md:text-sm truncate">{post.author}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                            {post.school && (
                                                <span className="text-white font-bold px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1"
                                                    style={{ backgroundColor: stringToColor(post.school), fontSize: '9px' }}>
                                                    {isGlobal ? post.school : getSchoolAbbr(post.school)}
                                                </span>
                                            )}
                                            <p className="text-xs text-gray-400">{post.time}</p>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="font-bold text-dark text-sm mb-1">{post.title}</h3>
                                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">{post.content}</p>
                                {post.image && (
                                    <img src={post.image} alt="" className="w-full max-h-[520px] object-contain rounded-xl mb-3 bg-black/5 dark:bg-white/5 border border-gray-100 dark:border-slate-800/50"
                                        onError={e => { e.target.style.display = 'none' }} />
                                )}

                                <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
                                    <button onClick={() => toggleLike(post.id, post.isReal)}
                                        className={`flex items-center gap-1 ${post.liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
                                        <FiHeart size={14} className={post.liked ? 'fill-current' : ''} />
                                        <span className="text-xs">{post.likes}</span>
                                    </button>
                                    <button onClick={() => handleShowComments(post)}
                                        className={`flex items-center gap-1 ${activeCommentPost?.id === post.id ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}>
                                        <FiMessageCircle size={14} />
                                        <span className="text-xs">{post.commentCount || 0}</span>
                                    </button>
                                    <button onClick={() => handleShare(post)}
                                        className="flex items-center gap-1 text-gray-400 hover:text-primary">
                                        <FiShare2 size={14} />
                                    </button>
                                    <button onClick={() => toggleSave(post.id)}
                                        className={`ml-auto ${post.saved ? 'text-primary' : 'text-gray-300 hover:text-primary'}`}>
                                        <FiBookmark size={14} className={post.saved ? 'fill-current' : ''} />
                                    </button>
                                </div>

                            </motion.div>
                        ))}
                    </div>
            <CommentDrawer
                isOpen={!!activeCommentPost}
                post={activeCommentPost}
                user={user}
                setUser={setUser}
                onClose={() => setActiveCommentPost(null)}
                comments={activeCommentPost ? (commentsMap[activeCommentPost.id || activeCommentPost._id] || []) : []}
                onAddComment={handleAddComment}
            />
        </div>
    )
}

export default CommunityView
