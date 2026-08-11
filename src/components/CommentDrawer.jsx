'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiX, FiSend, FiGift, FiThumbsUp, FiCompass,
  FiImage, FiZap, FiStar, FiAward, FiMessageCircle, FiHeart, FiChevronDown, FiChevronUp
} from 'react-icons/fi'
import { giftReaction } from '../api/auth'

const REACTION_GIFTS = [
  { id: 'gift_helpful', name: 'Helpful', price: 10, icon: FiThumbsUp, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20' },
  { id: 'gift_insightful', name: 'Insightful', price: 25, icon: FiCompass, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20' },
  { id: 'gift_creative', name: 'Creative', price: 50, icon: FiImage, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20' },
  { id: 'gift_brilliant', name: 'Brilliant', price: 100, icon: FiZap, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20' },
  { id: 'gift_intelligent', name: 'Super Intelligent', price: 250, icon: FiStar, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20' },
  { id: 'gift_masterclass', name: 'Masterclass', price: 500, icon: FiAward, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20' },
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
  const [giftTargetComment, setGiftTargetComment] = useState(null)
  const [gifting, setGifting] = useState(false)
  const [giftMsg, setGiftMsg] = useState('')
  const [showRepliesMap, setShowRepliesMap] = useState({})
  const [likedComments, setLikedComments] = useState({})
  const listRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      setCommentText('')
      setReplyTo(null)
      setGiftTargetComment(null)
      setGiftMsg('')
    }
  }, [isOpen])

  const resetGift = () => {
    setGiftTargetComment(null)
    setGiftMsg('')
  }

  const toggleShowReplies = (cId) => {
    setShowRepliesMap(prev => ({ ...prev, [cId]: !prev[cId] }))
  }

  const toggleLikeComment = (cId) => {
    setLikedComments(prev => ({ ...prev, [cId]: !prev[cId] }))
  }

  const handleSendComment = async () => {
    if (!commentText.trim() || commenting) return
    setCommenting(true)
    try {
      await onAddComment(post.id || post._id, commentText.trim(), replyTo?.commentId || null)
      setCommentText('')
      setReplyTo(null)
      if (onRefreshComments) onRefreshComments(post.id || post._id)
      setTimeout(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight }, 100)
    } catch (err) {
      console.error('Failed to add comment', err)
    } finally {
      setCommenting(false)
    }
  }

  const handleSendGift = async (rgItem) => {
    const comment = giftTargetComment
    const recipientId = comment?.author?.id || comment?.author?._id || comment?.authorId
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
      const newCoins = res.data?.coins !== undefined ? res.data.coins : Math.max(0, (user?.coins || 0) - rgItem.price)
      setGiftMsg(`✅ Sent ${rgItem.name} reaction!`)

      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        storedUser.coins = newCoins
        localStorage.setItem('user', JSON.stringify(storedUser))
      } catch (e) {}

      if (setUser) {
        setUser(u => ({ ...u, coins: newCoins }))
      }

      window.dispatchEvent(new Event('userStateChange'))
      setTimeout(() => { resetGift() }, 1800)
    } catch (err) {
      setGiftMsg(err.response?.data?.message || 'Failed to send gift')
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
      <div className="fixed inset-0 z-[999]">
        {/* Dark Backdrop — Clicking closes drawer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
        />

        {/* TikTok Side Panel (Desktop right sidebar / Mobile bottom sheet) */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] md:w-[420px] h-full bg-[#121212] text-white z-[1000] border-l border-white/10 flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header (Exact TikTok layout: "Comments 765" and ✕) */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0 bg-[#121212]">
            <h3 className="text-base font-bold text-white tracking-wide">
              Comments <span className="text-white/60 font-medium text-sm ml-1">{comments.length}</span>
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition cursor-pointer"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Comment List Area */}
          <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-white/40 text-xs">
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-white/40 text-center">
                <FiMessageCircle size={44} className="mb-3 opacity-30" />
                <p className="text-sm font-semibold text-white/70 mb-1">No comments yet</p>
                <p className="text-xs text-white/40">Be the first to share your thoughts!</p>
              </div>
            ) : (
              topLevel.map((comment) => {
                const cId = comment.id || comment._id
                const replies = repliesMap[cId] || []
                const isLiked = likedComments[cId]

                return (
                  <div key={cId} className="flex flex-col gap-1.5">
                    {/* Top Level Comment Row */}
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0 mt-0.5 overflow-hidden">
                        {comment.author?.avatar ? (
                          <img src={comment.author.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          comment.author?.name?.charAt(0)?.toUpperCase() || 'S'
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white/90 hover:underline cursor-pointer">
                          {comment.author?.name || 'Scholar'}
                        </p>
                        <p className="text-sm text-white/90 leading-relaxed mt-0.5">
                          {comment.text}
                        </p>

                        {/* Action details (Time, Reply, Gift) */}
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-white/40">
                          <span>
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : 'Just now'}
                          </span>
                          <button
                            onClick={() => setReplyTo({ commentId: cId, authorName: comment.author?.name || 'Scholar' })}
                            className="font-semibold text-white/60 hover:text-white transition cursor-pointer"
                          >
                            Reply
                          </button>
                          <button
                            onClick={() => { setGiftTargetComment(comment); setGiftMsg('') }}
                            className="font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition cursor-pointer bg-amber-400/10 px-2 py-0.5 rounded-full"
                          >
                            <FiGift size={11} /> Gift
                          </button>
                        </div>
                      </div>

                      {/* Heart / Like Icon (TikTok style right side) */}
                      <div className="flex flex-col items-center flex-shrink-0 pt-1">
                        <button
                          onClick={() => toggleLikeComment(cId)}
                          className={`transition ${isLiked ? 'text-red-500 scale-110' : 'text-white/40 hover:text-white'}`}
                        >
                          <FiHeart size={16} className={isLiked ? 'fill-current' : ''} />
                        </button>
                        <span className="text-[10px] text-white/40 font-medium mt-0.5">
                          {isLiked ? 1 : ''}
                        </span>
                      </div>
                    </div>

                    {/* Replies Accordion Toggle (TikTok style: "— View 8 replies ∨") */}
                    {replies.length > 0 && (
                      <div className="ml-12 mt-1">
                        <button
                          onClick={() => toggleShowReplies(cId)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white transition cursor-pointer"
                        >
                          <span className="w-4 h-px bg-white/30" />
                          <span>{showRepliesMap[cId] ? 'Hide replies' : `View ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}</span>
                          {showRepliesMap[cId] ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                        </button>

                        {/* Nested Replies list */}
                        {showRepliesMap[cId] && (
                          <div className="flex flex-col gap-3 mt-3 pl-2 border-l border-white/10">
                            {replies.map((reply) => {
                              const rId = reply.id || reply._id
                              const rLiked = likedComments[rId]

                              return (
                                <div key={rId} className="flex items-start gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[10px] flex-shrink-0 mt-0.5 overflow-hidden">
                                    {reply.author?.avatar ? (
                                      <img src={reply.author.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      reply.author?.name?.charAt(0)?.toUpperCase() || 'S'
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white/90 hover:underline cursor-pointer">
                                      {reply.author?.name || 'Scholar'}
                                    </p>
                                    <p className="text-xs text-white/80 leading-relaxed mt-0.5">
                                      {reply.text}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1 text-[11px] text-white/40">
                                      <span>{reply.createdAt ? new Date(reply.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : 'Just now'}</span>
                                      <button
                                        onClick={() => setReplyTo({ commentId: cId, authorName: reply.author?.name || 'Scholar' })}
                                        className="font-semibold text-white/60 hover:text-white transition"
                                      >
                                        Reply
                                      </button>
                                      <button
                                        onClick={() => { setGiftTargetComment(reply); setGiftMsg('') }}
                                        className="font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition bg-amber-400/10 px-1.5 py-0.5 rounded-full"
                                      >
                                        <FiGift size={10} /> Gift
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-center flex-shrink-0 pt-1">
                                    <button
                                      onClick={() => toggleLikeComment(rId)}
                                      className={`transition ${rLiked ? 'text-red-500' : 'text-white/40 hover:text-white'}`}
                                    >
                                      <FiHeart size={14} className={rLiked ? 'fill-current' : ''} />
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Sticky TikTok Input Footer Bar */}
          <div className="p-4 border-t border-white/10 bg-[#121212] flex-shrink-0">
            {replyTo && (
              <div className="flex items-center justify-between bg-primary/20 border border-primary/30 px-3 py-1.5 rounded-xl text-xs text-primary font-semibold mb-2">
                <span>Replying to <strong>@{replyTo.authorName}</strong></span>
                <button onClick={() => setReplyTo(null)} className="text-white/40 hover:text-white">✕</button>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              {/* User avatar */}
              <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || 'S'
                )}
              </div>

              {/* Input container with @ and gift icons (Exact TikTok style) */}
              <div className="flex-1 flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 border border-white/10">
                <input
                  type="text"
                  placeholder={replyTo ? `Reply to ${replyTo.authorName}...` : 'Add comment...'}
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendComment()}
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
                />
                <button type="button" className="text-white/40 hover:text-white text-xs font-bold transition">@</button>
                <button
                  type="button"
                  onClick={() => { setGiftTargetComment(topLevel[0] || null); setGiftMsg('') }}
                  className="text-amber-400/80 hover:text-amber-400 transition flex-shrink-0"
                  title="Send a gift reaction"
                >
                  <FiGift size={16} />
                </button>
              </div>

              {/* Send action button */}
              <button
                onClick={handleSendComment}
                disabled={commenting || !commentText.trim()}
                className="w-9 h-9 bg-primary rounded-full flex items-center justify-center hover:opacity-90 transition disabled:opacity-30 flex-shrink-0"
              >
                <FiSend size={14} className="text-white" />
              </button>
            </div>
          </div>

          {/* Gift Reaction Panel — Slides up smoothly over the drawer */}
          <AnimatePresence>
            {giftTargetComment && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="absolute inset-0 bg-[#1c1c1e] rounded-t-2xl flex flex-col px-5 pt-4 pb-6 z-20 border-t border-white/10"
              >
                <div className="flex justify-center mb-3">
                  <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FiGift className="text-amber-400" size={20} />
                    <h4 className="text-sm font-bold text-white">
                      Gift @{giftTargetComment.author?.name || 'Scholar'}
                    </h4>
                  </div>
                  <button
                    onClick={resetGift}
                    className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition"
                  >
                    <FiX size={18} />
                  </button>
                </div>

                {giftMsg && (
                  <div className={`text-xs font-semibold mb-3 px-3 py-2 rounded-xl ${giftMsg.startsWith('✅') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {giftMsg}
                  </div>
                )}

                <p className="text-xs text-white/50 mb-3">Select a reaction gift to reward this comment:</p>

                <div className="grid grid-cols-2 gap-2.5 overflow-y-auto">
                  {REACTION_GIFTS.map((rg) => {
                    const IconComponent = rg.icon
                    return (
                      <button
                        key={rg.id}
                        disabled={gifting}
                        onClick={() => handleSendGift(rg)}
                        className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition disabled:opacity-40 cursor-pointer ${rg.color}`}
                      >
                        <IconComponent size={20} className="flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold">{rg.name}</p>
                          <p className="text-[10px] opacity-70 font-semibold">{rg.price} coins</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
