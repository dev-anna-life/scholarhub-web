'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getPostById, addComment, likePost, getMe, giftReaction } from '../../../src/api/auth'
import { FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiArrowLeft, FiSend, FiGift, FiThumbsUp, FiCompass, FiImage, FiZap, FiStar, FiAward, FiPlay, FiVolume2, FiVolumeX, FiCheckCircle } from 'react-icons/fi'
import { motion } from 'framer-motion'
import ShareModal from '../../../src/components/ShareModal'
import UserBadge from '../../../src/components/UserBadge'

const REACTION_GIFTS = [
  { id: 'gift_helpful', name: 'Helpful', price: 10, icon: FiThumbsUp, color: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100' },
  { id: 'gift_insightful', name: 'Insightful', price: 25, icon: FiCompass, color: 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100' },
  { id: 'gift_creative', name: 'Creative', price: 50, icon: FiImage, color: 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100' },
  { id: 'gift_brilliant', name: 'Brilliant', price: 100, icon: FiZap, color: 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100' },
  { id: 'gift_intelligent', name: 'Super Intelligent', price: 250, icon: FiStar, color: 'text-yellow-600 bg-yellow-50 border-yellow-200 hover:bg-yellow-100' },
  { id: 'gift_masterclass', name: 'Masterclass', price: 500, icon: FiAward, color: 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' },
]

const SAMPLE_CLIPS = {
  clip_1: {
    id: 'clip_1',
    title: '3 Mobile Navigation UX Patterns You Need to Know',
    content: 'Stop using complex 3-level accordion menus on mobile screens! Here are 3 clean navigation patterns that increase mobile retention by 40%...',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-student-reading-a-book-in-a-library-42930-large.mp4',
    author: { name: 'Alex Rivers', username: 'alex_ux', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', school: 'UI/UX Design Studio', isOfficial: true },
    likesCount: 342,
    commentsData: [],
    citationSource: 'Google Design Index'
  },
  clip_2: {
    id: 'clip_2',
    title: 'How Async/Await Actually Works in JavaScript',
    content: 'The event loop processes microtasks before macrotasks! Watch this 45-second visual breakdown of async execution order...',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-laptop-43093-large.mp4',
    author: { name: 'Sarah Jenkins', username: 'sarah_dev', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', school: 'Web & Software Engineering' },
    likesCount: 512,
    commentsData: [],
    citationSource: 'IEEE Computer Society'
  },
  clip_3: {
    id: 'clip_3',
    title: 'Understanding Transformer Self-Attention in 60s',
    content: 'Why did Transformers replace RNNs in AI? Self-attention calculates query-key matrix weights in parallel across all tokens at once!',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-studying-with-a-laptop-in-a-library-42932-large.mp4',
    author: { name: 'Dr. Michael Chen', username: 'prof_chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', school: 'Data Science & AI' },
    likesCount: 890,
    commentsData: [],
    citationSource: 'ACM Digital Library'
  }
}

export default function PostDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [post, setPost] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [commenting, setCommenting] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      getMe().then(r => setUser(r.data)).catch(() => {})
    }

    if (id && SAMPLE_CLIPS[id]) {
      setPost(SAMPLE_CLIPS[id])
      setLoading(false)
      return
    }

    if (id) {
      getPostById(id)
        .then(r => {
          setPost(r.data)
          setLiked(r.data.liked || false)
          setSaved(r.data.saved || false)
        })
        .catch(err => {
          console.warn('Post not found or fetch error:', err)
        })
        .finally(() => setLoading(false))
    }
  }, [id])

  const toggleLike = async () => {
    if (!user) return router.push('/login')
    try {
      await likePost(id)
      setLiked(!liked)
      setPost(p => ({ ...p, likesCount: (p.likesCount || 0) + (liked ? -1 : 1) }))
    } catch {}
  }

  const handleComment = async () => {
    if (!user) return router.push('/login')
    if (!commentText.trim()) return
    setCommenting(true)
    try {
      const res = await addComment(id, commentText, replyTo?.commentId || null)
      const newComment = res.data
      setPost(p => {
        if (!p) return p
        const currentComments = Array.isArray(p.commentsData) ? p.commentsData : []
        return {
          ...p,
          commentsData: [...currentComments, newComment]
        }
      })
      setCommentText('')
      setReplyTo(null)
    } catch (err) {
      console.error('Failed to add comment', err)
    } finally {
      setCommenting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold text-dark dark:text-white mb-2">ScholarHub Post Not Found</h2>
        <p className="text-xs text-gray-500 mb-4">This post may have been removed or is unavailable.</p>
        <button
          onClick={() => router.push('/feed')}
          className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl shadow-md"
        >
          Go to Feed
        </button>
      </div>
    )
  }

  const author = post.author || {}

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-150 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full">
          <FiArrowLeft size={20} />
        </button>
        <h1 className="font-extrabold text-sm text-dark dark:text-white truncate max-w-[200px]">
          {post.title || 'ScholarHub Post'}
        </h1>
        <button onClick={() => setShowShareModal(true)} className="p-2 text-primary hover:bg-primary/10 rounded-full">
          <FiShare2 size={20} />
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Main Post Card Container */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-5 shadow-sm mb-6">
          
          {/* Author Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold overflow-hidden border border-gray-200 dark:border-zinc-700">
                {author.avatar ? (
                  <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                ) : (
                  (author.name || 'S')[0]
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-dark dark:text-white flex items-center gap-1.5">
                  <span>{author.name || 'Scholar Creator'}</span>
                  <UserBadge user={author} />
                </h3>
                <p className="text-xs text-gray-500 font-medium">@{author.username || 'scholar'} • {author.school || 'Global Network'}</p>
              </div>
            </div>
          </div>

          {/* Title & Body */}
          <h2 className="text-lg font-bold text-dark dark:text-white mb-2">{post.title}</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap mb-4">
            {post.content}
          </p>

          {/* Media Player: Video Support */}
          {post.video && (
            <div className="relative mb-4 rounded-xl overflow-hidden bg-black aspect-video shadow-md">
              <video
                src={post.video}
                controls
                className="w-full h-full object-contain"
                muted={isMuted}
              />
            </div>
          )}

          {/* Image Support */}
          {post.image && (
            <div className="mb-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800">
              <img src={post.image} alt={post.title} className="w-full h-auto object-cover max-h-[500px]" />
            </div>
          )}

          {/* Academic Citation Badge */}
          {post.citationSource && (
            <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <FiCheckCircle size={14} />
              <span>Verified Citation: {post.citationSource}</span>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-zinc-800 text-gray-500">
            <button onClick={toggleLike} className={`flex items-center gap-1.5 text-xs font-bold transition ${liked ? 'text-red-500' : 'hover:text-dark dark:hover:text-white'}`}>
              <FiHeart size={18} className={liked ? 'fill-current' : ''} />
              <span>{post.likesCount || 0} Likes</span>
            </button>

            <button onClick={() => setShowShareModal(true)} className="flex items-center gap-1.5 text-xs font-bold hover:text-primary transition">
              <FiShare2 size={18} />
              <span>Share Post</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <h3 className="font-extrabold text-sm text-dark dark:text-white mb-4">
            Comments ({Array.isArray(post.commentsData) ? post.commentsData.length : 0})
          </h3>

          {/* Add Comment Input */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComment()}
              placeholder={user ? "Write a scholarly comment..." : "Log in to join discussion..."}
              className="flex-1 px-3 py-2 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs bg-gray-50 dark:bg-zinc-800 text-dark dark:text-white focus:border-primary focus:outline-none"
            />
            <button
              onClick={handleComment}
              disabled={commenting || !commentText.trim()}
              className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl hover:opacity-90 disabled:opacity-50 transition flex items-center gap-1"
            >
              <FiSend size={14} />
              <span>Post</span>
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {(!post.commentsData || post.commentsData.length === 0) ? (
              <p className="text-xs text-gray-400 text-center py-4">No comments yet. Be the first to share your thoughts!</p>
            ) : (
              post.commentsData.map((c, i) => (
                <div key={i} className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs text-dark dark:text-white">{c.author?.name || 'Scholar'}</span>
                    <span className="text-[10px] text-gray-400">@{c.author?.username || 'scholar'}</span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{c.text || c.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Share Modal Integration */}
      <ShareModal
        isOpen={showShareModal}
        post={post}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  )
}
