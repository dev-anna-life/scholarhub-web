'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiX, FiSend, FiGift, FiThumbsUp, FiCompass, 
  FiImage, FiZap, FiStar, FiAward, FiMessageCircle 
} from 'react-icons/fi'
import { giftReaction } from '../api/auth'

const REACTION_GIFTS = [
  { id: 'gift_helpful', name: 'Helpful', price: 10, icon: FiThumbsUp, color: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100' },
  { id: 'gift_insightful', name: 'Insightful', price: 25, icon: FiCompass, color: 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100' },
  { id: 'gift_creative', name: 'Creative', price: 50, icon: FiImage, color: 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100' },
  { id: 'gift_brilliant', name: 'Brilliant', price: 100, icon: FiZap, color: 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100' },
  { id: 'gift_intelligent', name: 'Super Intelligent', price: 250, icon: FiStar, color: 'text-yellow-600 bg-yellow-50 border-yellow-200 hover:bg-yellow-100' },
  { id: 'gift_masterclass', name: 'Masterclass', price: 500, icon: FiAward, color: 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' },
]

export default function CommentDrawer({
  isOpen,
  post,
  user,
  setUser,
  onClose,
  comments = [],
  loading = false,
  onAddComment,
  onRefreshComments
}) {
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [commenting, setCommenting] = useState(false)
  const [activeGiftCommentId, setActiveGiftCommentId] = useState(null)
  const [gifting, setGifting] = useState(false)
  const [giftMsg, setGiftMsg] = useState('')
  const [showRepliesMap, setShowRepliesMap] = useState({})

  // Reset state when post changes or closes
  useEffect(() => {
    if (!isOpen) {
      setCommentText('')
      setReplyTo(null)
      setActiveGiftCommentId(null)
      setGiftMsg('')
    }
  }, [isOpen])

  const toggleShowReplies = (cId) => {
    setShowRepliesMap(prev => ({ ...prev, [cId]: !prev[cId] }))
  }

  const handleSendComment = async () => {
    if (!commentText.trim() || commenting) return
    setCommenting(true)
    try {
      await onAddComment(post.id || post._id, commentText.trim(), replyTo?.commentId || null)
      setCommentText('')
      setReplyTo(null)
      if (onRefreshComments) onRefreshComments(post.id || post._id)
    } catch (err) {
      console.error('Failed to add comment', err)
    } finally {
      setCommenting(false)
    }
  }

  const handleSendGift = async (rgItem, comment) => {
    const recipientId = comment.author?.id || comment.author?._id || comment.authorId
    if (!recipientId) return
    const currentUserId = user?.id || user?._id
    if (recipientId === currentUserId) {
      setGiftMsg('You cannot gift your own comment!')
      return
    }
    setGifting(true)
    setGiftMsg('')
    try {
      const res = await giftReaction({
        itemId: rgItem.id,
        recipientId,
        commentId: comment.id || comment._id,
        postId: post.id || post._id,
      })
      setGiftMsg(`Success! Sent ${rgItem.name} (+${rgItem.price} coins)`)
      if (res.data?.coins !== undefined && setUser) {
        setUser(u => ({ ...u, coins: res.data.coins }))
      }
      setTimeout(() => {
        setActiveGiftCommentId(null)
        setGiftMsg('')
      }, 1800)
    } catch (err) {
      setGiftMsg(err.response?.data?.message || 'Failed to send gift reaction')
    } finally {
      setGifting(false)
    }
  }

  if (!isOpen || !post) return null

  const topLevel = comments.filter(c => !c.parentId)
  const repliesMap = {}
  comments.forEach(c => {
    if (c.parentId) {
      if (!repliesMap[c.parentId]) repliesMap[c.parentId] = []
      repliesMap[c.parentId].push(c)
    }
  })

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center">
        {/* Backdrop - Click outside closes drawer immediately */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Drawer - Natural TikTok/X width (max-w-md / max-w-lg) */}
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col z-10 border border-gray-100 dark:border-slate-800"
        >
          {/* Header Drag Handle & Close */}
          <div className="pt-3 pb-2 px-5 flex items-center justify-between border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <div className="flex items-center gap-2">
              <FiMessageCircle className="text-primary" size={18} />
              <h3 className="font-bold text-dark dark:text-white text-sm">
                Comments ({comments.length})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-dark dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Comment List Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-[220px]">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-gray-400 text-xs animate-pulse">
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <FiMessageCircle size={32} className="mb-2 opacity-40" />
                <p className="text-xs">No comments yet. Start the conversation!</p>
              </div>
            ) : (
              topLevel.map((comment) => {
                const cId = comment.id || comment._id
                const replies = repliesMap[cId] || []

                return (
                  <div key={cId} className="flex flex-col gap-1 pb-3 border-b border-gray-100 dark:border-slate-800/60 last:border-0">
                    {/* Top Level Comment */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                        {comment.author?.name?.charAt(0) || 'S'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-dark dark:text-white truncate">
                            {comment.author?.name || 'Scholar'}
                          </p>
                          <span className="text-[10px] text-gray-400">
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : ''}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-200 mt-0.5 leading-relaxed">{comment.text}</p>

                        {/* Comment Action Buttons */}
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
                            className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full border border-amber-200/50"
                          >
                            <FiGift size={12} /> Gift Reaction
                          </button>

                          {replies.length > 0 && (
                            <button
                              onClick={() => toggleShowReplies(cId)}
                              className="text-[11px] font-semibold text-gray-400 hover:text-primary transition cursor-pointer"
                            >
                              {showRepliesMap[cId] ? 'Hide replies' : `View ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
                            </button>
                          )}

                          {/* Reaction Gift Popover */}
                          {activeGiftCommentId === cId && (
                            <div className="absolute left-0 top-full mt-2 z-40 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-xl p-3 min-w-[280px]">
                              <p className="text-xs font-bold text-dark dark:text-white mb-2 flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <FiGift className="text-amber-500" size={14} /> Send Reaction Gift
                                </span>
                                <button onClick={() => setActiveGiftCommentId(null)} className="text-gray-400 hover:text-dark">✕</button>
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

                    {/* Replies Thread */}
                    {replies.length > 0 && showRepliesMap[cId] && (
                      <div className="ml-4 pl-3 border-l-2 border-primary/20 flex flex-col gap-2 mt-1.5">
                        {replies.map((reply) => {
                          const rId = reply.id || reply._id
                          return (
                            <div key={rId} className="flex items-start gap-2 py-1">
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
                                <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5 leading-relaxed">{reply.text}</p>
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
                                    className="text-[10px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full border border-amber-200/50"
                                  >
                                    <FiGift size={11} /> Gift Reaction
                                  </button>

                                  {activeGiftCommentId === rId && (
                                    <div className="absolute left-0 top-full mt-2 z-40 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-xl p-3 min-w-[280px]">
                                      <p className="text-xs font-bold text-dark dark:text-white mb-2 flex items-center justify-between">
                                        <span className="flex items-center gap-1">
                                          <FiGift className="text-amber-500" size={14} /> Send Reaction Gift
                                        </span>
                                        <button onClick={() => setActiveGiftCommentId(null)} className="text-gray-400 hover:text-dark">✕</button>
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
            )}
          </div>

          {/* Comment Input Footer */}
          <div className="p-3 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
            {replyTo && (
              <div className="flex items-center justify-between bg-primary/10 px-3 py-1 rounded-lg text-xs text-primary font-semibold mb-2">
                <span>Replying to <strong>@{replyTo.authorName}</strong></span>
                <button onClick={() => setReplyTo(null)} className="hover:text-red-500 font-bold">✕</button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={replyTo ? `Reply to ${replyTo.authorName}...` : "Write a comment..."}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendComment()}
                className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full text-xs text-dark dark:text-white focus:outline-none focus:border-primary transition"
              />
              <button
                onClick={handleSendComment}
                disabled={commenting || !commentText.trim()}
                className="p-2.5 bg-primary text-white rounded-full hover:opacity-90 transition disabled:opacity-50 flex-shrink-0"
              >
                <FiSend size={15} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
