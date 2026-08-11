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
  const [replyTo, setReplyTo] = useState(null)
  const [showRepliesMap, setShowRepliesMap] = useState({})
  const [liked, setLiked] = useState(false)

  const toggleShowReplies = (cId) => {
    setShowRepliesMap(prev => ({ ...prev, [cId]: !prev[cId] }))
  }
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
            <div onClick={() => { const aId = c.author?.id || c.author?._id; if (aId && aId !== (user?.id || user?._id)) router.push(`/profile/${aId}`) }}
              className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-sm font-bold flex-shrink-0 cursor-pointer hover:bg-primary/20 transition">
              {c.author?.name?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p onClick={() => { const aId = c.author?.id || c.author?._id; if (aId && aId !== (user?.id || user?._id)) router.push(`/profile/${aId}`) }}
                className="font-semibold text-dark text-sm cursor-pointer hover:text-primary transition truncate">
                {c.author?.name || 'Scholar'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}</p>
            </div>
            {c.category && <span className="bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full text-xs">{c.category}</span>}
          </div>

          <h1 className="text-xl font-bold text-dark mb-3 leading-snug">{c.title}</h1>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap mb-4">{c.content}</p>

          {c.image && <img src={c.image} alt="" className="w-full rounded-xl mb-4 max-h-[600px] object-contain bg-black/5 dark:bg-white/5 border border-gray-100" />}
          {c.video && <video src={c.video} controls className="w-full rounded-xl mb-4 max-h-96" />}

          <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
            <button onClick={toggleLike} className={`flex items-center gap-1.5 transition ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
              <FiHeart size={16} className={liked ? 'fill-current' : ''} />
              <span className="text-sm">{c.likesCount || 0}</span>
            </button>
            <button className="flex items-center gap-1.5 text-gray-400">
              <FiMessageCircle size={16} />
              <span className="text-sm">{(Array.isArray(c.commentsData) ? c.commentsData : []).length}</span>
            </button>
            <button className="flex items-center gap-1.5 text-gray-400 hover:text-primary transition ml-auto">
              <FiShare2 size={16} />
            </button>
            <button onClick={() => setSaved(!saved)} className={`transition ${saved ? 'text-primary' : 'text-gray-300 hover:text-primary'}`}>
              <FiBookmark size={16} className={saved ? 'fill-current' : ''} />
            </button>
          </div>
        </motion.div>

        <div className="mt-4 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800">
          <h3 className="font-bold text-dark dark:text-white text-sm mb-3">Comments ({(Array.isArray(c.commentsData) ? c.commentsData : []).length})</h3>

          {replyTo && (
            <div className="flex items-center justify-between bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-xs font-semibold mb-2">
              <span>Replying to <strong className="text-dark dark:text-white">@{replyTo.authorName}</strong></span>
              <button onClick={() => setReplyTo(null)} className="hover:opacity-80 p-0.5">✕</button>
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder={replyTo ? `Reply to ${replyTo.authorName}...` : "Write a comment..."}
              className="flex-1 input-field text-sm py-2"
            />
            <button onClick={handleComment} disabled={commenting || !commentText.trim()} className="btn-primary !w-auto !px-4 !py-2">
              <FiSend size={15} />
            </button>
          </div>

          {(!Array.isArray(c.commentsData) || c.commentsData.length === 0) ? (
            <p className="text-gray-400 text-sm text-center py-4">No comments yet, be the first!</p>
          ) : (
            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
              {(() => {
                const allComments = Array.isArray(c.commentsData) ? c.commentsData : []
                const topLevel = allComments.filter(cm => !cm.parentId)
                const repliesMap = {}
                allComments.forEach(cm => {
                  if (cm.parentId) {
                    if (!repliesMap[cm.parentId]) repliesMap[cm.parentId] = []
                    repliesMap[cm.parentId].push(cm)
                  }
                })

                return topLevel.map((comment) => {
                  const cId = comment.id || comment._id
                  const replies = repliesMap[cId] || []

                  return (
                    <div key={cId} className="flex flex-col gap-1 pb-3 border-b border-gray-100 dark:border-slate-800/60 last:border-0">
                      <div className="flex items-start gap-2.5 py-1">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                          {comment.author?.name?.charAt(0) || 'S'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-dark dark:text-white">{comment.author?.name || 'Scholar'}</p>
                            <span className="text-[10px] text-gray-400">
                              {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : ''}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 dark:text-gray-200 mt-0.5 leading-relaxed">{comment.text}</p>

                          <div className="flex items-center gap-4 mt-1">
                            <button
                              onClick={() => setReplyTo({ commentId: cId, authorName: comment.author?.name || 'Scholar' })}
                              className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                            >
                              Reply
                            </button>

                            {replies.length > 0 && (
                              <button
                                onClick={() => toggleShowReplies(cId)}
                                className="text-[11px] font-semibold text-gray-400 hover:text-primary transition cursor-pointer flex items-center gap-1"
                              >
                                {showRepliesMap[cId] ? 'Hide replies' : `── View ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* X-style Conversation Thread */}
                      {replies.length > 0 && showRepliesMap[cId] && (
                        <div className="ml-4 pl-4 border-l-2 border-primary/30 flex flex-col gap-2 mt-1">
                          {replies.map((reply) => (
                            <div key={reply.id || reply._id} className="flex items-start gap-2 py-1">
                              <div className="w-6 h-6 bg-primary/15 rounded-full flex items-center justify-center text-primary text-[10px] font-bold flex-shrink-0">
                                {reply.author?.name?.charAt(0) || 'S'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-[11px] font-bold text-dark dark:text-white">{reply.author?.name || 'Scholar'}</p>
                                  <span className="text-[9px] text-gray-400">
                                    {reply.createdAt ? new Date(reply.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : ''}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700 dark:text-gray-200 mt-0.5 leading-relaxed">{reply.text}</p>
                                <button
                                  onClick={() => setReplyTo({ commentId: cId, authorName: reply.author?.name || 'Scholar' })}
                                  className="text-[10px] font-semibold text-primary hover:underline mt-0.5 cursor-pointer inline-block"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
