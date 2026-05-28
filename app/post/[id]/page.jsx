'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getPostById, addComment, likePost, getMe } from '../../../src/api/auth'
import { FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiArrowLeft, FiSend } from 'react-icons/fi'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function PostDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [post, setPost] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [commenting, setCommenting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return router.push('/login')
    getMe().then(r => setUser(r.data)).catch(() => {})
    getPostById(id).then(r => {
      setPost(r.data)
      setLiked(r.data.liked)
      setSaved(r.data.saved)
    }).catch(() => router.push('/feed')).finally(() => setLoading(false))
  }, [id])

  const toggleLike = async () => {
    try {
      await likePost(id)
      setLiked(!liked)
      setPost(p => ({ ...p, likesCount: p.likesCount + (liked ? -1 : 1) }))
    } catch {}
  }

  const handleComment = async () => {
    if (!commentText.trim()) return
    setCommenting(true)
    try {
      const res = await addComment(id, commentText)
      setPost(p => ({ ...p, commentsData: res.data.comments || res.data }))
      setCommentText('')
    } catch {}
    setCommenting(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-light flex items-center justify-center">
      <div className="animate-pulse text-gray-400">Loading post...</div>
    </div>
  )

  if (!post) return null

  const c = post

  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-primary transition mb-4">
          <FiArrowLeft size={18} /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-start gap-3 mb-4">
            <div onClick={() => c.author?._id && c.author._id !== user?.id && router.push(`/profile/${c.author._id}`)}
              className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-sm font-bold flex-shrink-0 cursor-pointer hover:bg-primary/20 transition">
              {c.author?.name?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p onClick={() => c.author?._id && c.author._id !== user?.id && router.push(`/profile/${c.author._id}`)}
                className="font-semibold text-dark text-sm cursor-pointer hover:text-primary transition truncate">
                {c.author?.name || 'Scholar'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}</p>
            </div>
            {c.category && <span className="bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full text-xs">{c.category}</span>}
          </div>

          <h1 className="text-xl font-bold text-dark mb-3 leading-snug">{c.title}</h1>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap mb-4">{c.content}</p>

          {c.image && <img src={c.image} alt="" className="w-full rounded-xl mb-4 max-h-96 object-cover" />}
          {c.video && <video src={c.video} controls className="w-full rounded-xl mb-4 max-h-96" />}

          <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
            <button onClick={toggleLike} className={`flex items-center gap-1.5 transition ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
              <FiHeart size={16} className={liked ? 'fill-current' : ''} />
              <span className="text-sm">{c.likesCount || 0}</span>
            </button>
            <button className="flex items-center gap-1.5 text-gray-400">
              <FiMessageCircle size={16} />
              <span className="text-sm">{(c.commentsData || []).length}</span>
            </button>
            <button className="flex items-center gap-1.5 text-gray-400 hover:text-primary transition ml-auto">
              <FiShare2 size={16} />
            </button>
            <button onClick={() => setSaved(!saved)} className={`transition ${saved ? 'text-primary' : 'text-gray-300 hover:text-primary'}`}>
              <FiBookmark size={16} className={saved ? 'fill-current' : ''} />
            </button>
          </div>
        </motion.div>

        <div className="mt-4 bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="font-bold text-dark text-sm mb-3">Comments ({(c.commentsData || []).length})</h3>

          <div className="flex items-center gap-2 mb-4">
            <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment..." className="flex-1 input-field text-sm py-2" />
            <button onClick={handleComment} disabled={commenting || !commentText.trim()} className="btn-primary !w-auto !px-4 !py-2">
              <FiSend size={15} />
            </button>
          </div>

          {(!c.commentsData || c.commentsData.length === 0) ? (
            <p className="text-gray-400 text-sm text-center py-4">No comments yet — be the first!</p>
          ) : (
            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
              {c.commentsData.map((comment, ci) => (
                <div key={ci} className="flex items-start gap-2 p-2 rounded-xl hover:bg-gray-50 transition">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                    {comment.author?.name?.charAt(0) || 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-dark">{comment.author?.name || 'Scholar'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{comment.text}</p>
                    <p className="text-[10px] text-gray-300 mt-0.5">{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
