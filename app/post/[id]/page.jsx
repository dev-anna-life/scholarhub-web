'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getPostById, addComment, likePost, getMe, giftReaction } from '../../../src/api/auth'
import { FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiArrowLeft, FiSend, FiGift, FiThumbsUp, FiCompass, FiImage, FiZap, FiStar, FiAward } from 'react-icons/fi'
import { motion } from 'framer-motion'

const REACTION_GIFTS = [
  { id: 'gift_helpful', name: 'Helpful', price: 10, icon: FiThumbsUp, color: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100' },
  { id: 'gift_insightful', name: 'Insightful', price: 25, icon: FiCompass, color: 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100' },
  { id: 'gift_creative', name: 'Creative', price: 50, icon: FiImage, color: 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100' },
  { id: 'gift_brilliant', name: 'Brilliant', price: 100, icon: FiZap, color: 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100' },
  { id: 'gift_intelligent', name: 'Super Intelligent', price: 250, icon: FiStar, color: 'text-yellow-600 bg-yellow-50 border-yellow-200 hover:bg-yellow-100' },
  { id: 'gift_masterclass', name: 'Masterclass', price: 500, icon: FiAward, color: 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' },
]

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
  const [saved, setSaved] = useState(false)
  const [commenting, setCommenting] = useState(false)
  const [activeGiftCommentId, setActiveGiftCommentId] = useState(null)
  const [gifting, setGifting] = useState(false)
  const [giftMsg, setGiftMsg] = useState('')

  const toggleShowReplies = (cId) => {
    setShowRepliesMap(prev => ({ ...prev, [cId]: !prev[cId] }))
  }

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

  const handleSendGift = async (item, comment) => {
    const recipientId = comment.author?.id || comment.author?._id || comment.authorId
    if (!recipientId) return
    if (recipientId === (user?.id || user?._id)) {
      setGiftMsg('You cannot gift your own comment!')
      return
    }
    setGifting(true)
    setGiftMsg('')
    try {
      const res = await giftReaction({
        itemId: item.id,
        recipientId,
        commentId: comment.id || comment._id,
        postId: id,
      })
      setGiftMsg(`Success! Awarded ${item.name} (+${item.price} coins)`)
      if (res.data?.coins !== undefined) {
        setUser(u => ({ ...u, coins: res.data.coins }))
      }
      setTimeout(() => { setActiveGiftCommentId(null); setGiftMsg('') }, 2000)
    } catch (err) {
      setGiftMsg(err.response?.data?.message || 'Failed to send gift reaction')
    } finally {
      setGifting(false)
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
    <div className="min-h-screen bg-light pb-24 md:pb-8">
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

          <h1 className="text-lg font-bold text-dark mb-2">{c.title}</h1>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">{c.content}</p>

          {c.image && (
            <div className="mb-4 rounded-xl overflow-hidden max-h-96">
              <img src={c.image} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-gray-500 text-xs mb-4">
            <div className="flex items-center gap-4">
              <button onClick={toggleLike} className={`flex items-center gap-1.5 transition ${liked ? 'text-red-500 font-bold' : 'hover:text-red-500'}`}>
                <FiHeart size={16} fill={liked ? 'currentColor' : 'none'} />
                <span>{c.likesCount || 0}</span>
              </button>
              <div className="flex items-center gap-1.5">
                <FiMessageCircle size={16} />
                <span>{Array.isArray(c.commentsData) ? c.commentsData.length : (c.commentsCount || 0)}</span>
              </div>
            </div>
          </div>

          {/* Comment Section Header */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-bold text-dark mb-3">Comments</h3>

            {replyTo && (
              <div className="flex items-center justify-between bg-primary/10 px-3 py-1.5 rounded-lg mb-2 text-xs text-primary font-medium">
                <span>Replying to <strong>{replyTo.authorName}</strong></span>
                <button onClick={() => setReplyTo(null)} className="hover:text-red-500 font-bold">×</button>
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

                            <div className="flex items-center gap-4 mt-1.5 relative">
                              <button
                                onClick={() => setReplyTo({ commentId: cId, authorName: comment.author?.name || 'Scholar' })}
                                className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                              >
                                Reply
                              </button>

                              <button
                                onClick={() => {
                                  setActiveGiftCommentId(activeGiftCommentId === cId ? null : cId)
                                  setGiftMsg('')
                                }}
                                className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                              >
                                <FiGift size={12} /> Gift Reaction
                              </button>

                              {replies.length > 0 && (
                                <button
                                  onClick={() => toggleShowReplies(cId)}
                                  className="text-[11px] font-semibold text-gray-400 hover:text-primary transition cursor-pointer flex items-center gap-1"
                                >
                                  {showRepliesMap[cId] ? 'Hide replies' : `View ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
                                </button>
                              )}

                              {/* Gifting Popover Menu */}
                              {activeGiftCommentId === cId && (
                                <div className="absolute left-0 top-full mt-2 z-30 bg-white border border-gray-100 rounded-2xl shadow-xl p-3 min-w-[280px]">
                                  <p className="text-xs font-bold text-dark mb-2 flex items-center gap-1">
                                    <FiGift className="text-amber-500" size={14} /> Gift Reaction
                                  </p>
                                  {giftMsg && (
                                    <p className={`text-xs font-semibold mb-2 p-1.5 rounded-lg ${giftMsg.startsWith('Success') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                      {giftMsg}
                                    </p>
                                  )}
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {REACTION_GIFTS.map((rg) => {
                                      const IconComponent = rg.icon
                                      return (
                                        <button
                                          key={rg.id}
                                          disabled={gifting}
                                          onClick={() => handleSendGift(rg, comment)}
                                          className={`flex items-center gap-2 p-2 rounded-xl border text-left transition disabled:opacity-50 ${rg.color}`}
                                        >
                                          <IconComponent size={16} className="flex-shrink-0" />
                                          <div className="min-w-0">
                                            <p className="text-xs font-bold truncate">{rg.name}</p>
                                            <p className="text-[10px] opacity-80 font-semibold">{rg.price} coins</p>
                                          </div>
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* X-style Conversation Thread */}
                        {replies.length > 0 && showRepliesMap[cId] && (
                          <div className="ml-4 pl-4 border-l-2 border-primary/30 flex flex-col gap-2 mt-1">
                            {replies.map((reply) => {
                              const rId = reply.id || reply._id
                              return (
                                <div key={rId} className="flex items-start gap-2 py-1">
                                  <div className="w-6 h-6 bg-primary/15 rounded-full flex items-center justify-center text-primary text-[10px] font-bold flex-shrink-0">
                                    {reply.author?.name?.charAt(0) || 'S'}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className="text-[11px] font-bold text-dark">{reply.author?.name || 'Scholar'}</p>
                                      <span className="text-[9px] text-gray-400">
                                        {reply.createdAt ? new Date(reply.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : ''}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">{reply.text}</p>
                                    <div className="flex items-center gap-3 mt-1 relative">
                                      <button
                                        onClick={() => setReplyTo({ commentId: cId, authorName: reply.author?.name || 'Scholar' })}
                                        className="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                                      >
                                        Reply
                                      </button>
                                      <button
                                        onClick={() => {
                                          setActiveGiftCommentId(activeGiftCommentId === rId ? null : rId)
                                          setGiftMsg('')
                                        }}
                                        className="text-[10px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                                      >
                                        <FiGift size={11} /> Gift Reaction
                                      </button>

                                      {activeGiftCommentId === rId && (
                                        <div className="absolute left-0 top-full mt-2 z-30 bg-white border border-gray-100 rounded-2xl shadow-xl p-3 min-w-[280px]">
                                          <p className="text-xs font-bold text-dark mb-2 flex items-center gap-1">
                                            <FiGift className="text-amber-500" size={14} /> Gift Reaction
                                          </p>
                                          {giftMsg && (
                                            <p className={`text-xs font-semibold mb-2 p-1.5 rounded-lg ${giftMsg.startsWith('Success') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                              {giftMsg}
                                            </p>
                                          )}
                                          <div className="grid grid-cols-2 gap-1.5">
                                            {REACTION_GIFTS.map((rg) => {
                                              const IconComponent = rg.icon
                                              return (
                                                <button
                                                  key={rg.id}
                                                  disabled={gifting}
                                                  onClick={() => handleSendGift(rg, reply)}
                                                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition disabled:opacity-50 ${rg.color}`}
                                                >
                                                  <IconComponent size={16} className="flex-shrink-0" />
                                                  <div className="min-w-0">
                                                    <p className="text-xs font-bold truncate">{rg.name}</p>
                                                    <p className="text-[10px] opacity-80 font-semibold">{rg.price} coins</p>
                                                  </div>
                                                </button>
                                              )
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })
                })()}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
