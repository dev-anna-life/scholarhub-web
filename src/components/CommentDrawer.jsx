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
  const [isMobile, setIsMobile] = useState(false)
  const listRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  const handleMentionClick = () => {
    setCommentText(prev => {
      const trimmed = prev.trimEnd()
      return trimmed ? `${trimmed} @` : '@'
    })
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 50)
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
    if (!giftTargetComment) return
    const comment = giftTargetComment
    const targetName = giftTargetComment.author?.name || (typeof giftTargetComment.author === 'string' ? giftTargetComment.author : (post?.author?.name || post?.author || 'Scholar'))
    const recipientId = giftTargetComment.author?.id || giftTargetComment.author?._id || giftTargetComment.authorId || post?.authorId || post?.author?._id || post?.author?.id

    const currentUserId = user?.id || user?._id
    if (recipientId && recipientId === currentUserId) {
      setGiftMsg('You cannot gift yourself!')
      return
    }

    setGifting(true)
    setGiftMsg('')
    try {
      let newCoins = user?.coins || 0
      if (recipientId) {
        const res = await giftReaction({
          itemId: rgItem.id,
          recipientId,
          commentId: giftTargetComment.id || giftTargetComment._id || null,
          postId: post?.id || post?._id,
        })
        newCoins = res.data?.coins !== undefined ? res.data.coins : Math.max(0, (user?.coins || 0) - rgItem.price)
      } else {
        newCoins = Math.max(0, (user?.coins || 0) - rgItem.price)
      }
      setGiftMsg(`✅ Sent ${rgItem.name} reaction to ${targetName}!`)

      if (comment) {
        if (!comment.gifts) comment.gifts = []
        comment.gifts = [...comment.gifts, rgItem.id]
      }

      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        storedUser.coins = newCoins
        localStorage.setItem('user', JSON.stringify(storedUser))
      } catch (e) {}

      if (setUser) {
        setUser(u => ({ ...u, coins: newCoins }))
      }

      if (onRefreshComments) {
        onRefreshComments(post?.id || post?._id)
      }

      window.dispatchEvent(new Event('userStateChange'))
      setTimeout(() => { resetGift() }, 1800)
    } catch (err) {
      setGiftMsg(err.response?.data?.message || 'Failed to send gift')
    } finally {
      setGifting(false)
    }
  }

  const renderCommentGifts = (gifts = []) => {
    if (!gifts || !Array.isArray(gifts) || gifts.length === 0) return null
    const counts = {}
    gifts.forEach(g => { if (g) counts[g] = (counts[g] || 0) + 1 })

    return (
      <div className="flex flex-wrap gap-1.5 mt-2 mb-1">
        {Object.entries(counts).map(([giftId, count]) => {
          const giftObj = REACTION_GIFTS.find(g => g.id === giftId) || { name: 'Gift', icon: FiGift, color: 'text-amber-400 bg-amber-500/20 border-amber-400/40' }
          const GiftIcon = giftObj.icon || FiGift
          return (
            <div key={giftId} className={`flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${giftObj.color} shadow-xs`} title={`${giftObj.name} reaction gift`}>
              <GiftIcon size={11} className="flex-shrink-0 animate-pulse" />
              <span>{giftObj.name}</span>
              {count > 1 && <span className="ml-1 opacity-80 font-bold">x{count}</span>}
            </div>
          )
        })}
      </div>
    )
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

  const drawerVariants = {
    hidden: isMobile ? { y: '100%', opacity: 0 } : { x: '100%', opacity: 1 },
    visible: { y: 0, x: 0, opacity: 1 },
    exit: isMobile ? { y: '100%', opacity: 0 } : { x: '100%', opacity: 1 }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999]">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Comment Panel: Mobile bottom sheet / Desktop side drawer */}
        <motion.div
          variants={drawerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="fixed z-[1000] bg-[#121212] text-white flex flex-col shadow-2xl overflow-hidden
                     bottom-0 left-0 right-0 w-full h-[78vh] max-h-[85vh] rounded-t-3xl border-t border-white/10
                     md:bottom-0 md:top-0 md:right-0 md:left-auto md:w-[420px] md:h-full md:max-h-full md:rounded-none md:border-t-0 md:border-l md:border-white/10"
        >
          {/* Mobile Handle Bar */}
          <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mt-2.5 mb-1 md:hidden flex-shrink-0 cursor-pointer" onClick={onClose} />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 md:py-4 border-b border-white/10 flex-shrink-0 bg-[#121212]">
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
                        {comment.text?.includes('🎁') || comment.content?.includes('🎁') || comment.isGift ? (
                          <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-600/20 border border-amber-400/50 rounded-xl p-2.5 my-1.5 shadow-sm">
                            <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-[11px] mb-0.5">
                              <FiGift size={13} className="text-amber-300" />
                              <span>GIFT ANNOUNCEMENT</span>
                            </div>
                            <p className="text-xs font-bold text-amber-100 leading-relaxed">
                              {comment.text || comment.content}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-white/90 leading-relaxed mt-0.5">
                            {comment.text || comment.content}
                          </p>
                        )}

                        {renderCommentGifts(comment.gifts)}

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
                                    {reply.text?.includes('🎁') || reply.content?.includes('🎁') || reply.isGift ? (
                                      <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-600/20 border border-amber-400/50 rounded-xl p-2 my-1 shadow-sm">
                                        <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-[10px] mb-0.5">
                                          <FiGift size={11} className="text-amber-300" />
                                          <span>GIFT ANNOUNCEMENT</span>
                                        </div>
                                        <p className="text-xs font-bold text-amber-100 leading-relaxed">
                                          {reply.text || reply.content}
                                        </p>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-white/80 leading-relaxed mt-0.5">
                                        {reply.text || reply.content}
                                      </p>
                                    )}
                                    {renderCommentGifts(reply.gifts)}
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

          {/* Sticky Input Footer Bar */}
          <div className="w-full max-w-full px-3 sm:px-4 py-2.5 sm:py-3.5 pb-6 sm:pb-4 border-t border-white/10 bg-[#121212] flex-shrink-0 box-border">
            {replyTo && (
              <div className="flex items-center justify-between bg-primary/20 border border-primary/30 px-3 py-1.5 rounded-xl text-xs text-primary font-semibold mb-2">
                <span className="truncate">Replying to <strong>@{replyTo.authorName}</strong></span>
                <button onClick={() => setReplyTo(null)} className="text-white/40 hover:text-white ml-2 flex-shrink-0">✕</button>
              </div>
            )}
            <div className="flex items-center gap-2 sm:gap-2.5 w-full">
              {/* User avatar */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/30 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || 'S'
                )}
              </div>

              {/* Input container with @ and gift icons */}
              <div className="flex-1 min-w-0 flex items-center gap-1.5 sm:gap-2 bg-white/10 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 border border-white/10">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={replyTo ? `Reply to ${replyTo.authorName}...` : 'Add comment...'}
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendComment()}
                  className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleMentionClick}
                  className="text-white/40 hover:text-white text-xs font-bold transition flex-shrink-0 px-0.5 cursor-pointer"
                  title="Mention someone"
                >
                  @
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = topLevel[0] || { author: { name: typeof post.author === 'string' ? post.author : (post.author?.name || 'Scholar'), id: post.authorId || post.author?._id } }
                    setGiftTargetComment(target)
                    setGiftMsg('')
                  }}
                  className="text-amber-400/90 hover:text-amber-400 transition flex-shrink-0 cursor-pointer p-0.5"
                  title="Send a gift reaction"
                >
                  <FiGift size={15} />
                </button>
              </div>

              {/* Send action button */}
              <button
                onClick={handleSendComment}
                disabled={commenting || !commentText.trim()}
                className="w-8 h-8 sm:w-9 sm:h-9 bg-primary rounded-full flex items-center justify-center hover:opacity-90 transition disabled:opacity-30 flex-shrink-0"
              >
                <FiSend size={13} className="text-white" />
              </button>
            </div>
          </div>

          {/* Gift Reaction Panel: Slides up smoothly over the drawer */}
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
                      Gift @{typeof giftTargetComment?.author === 'object' ? (giftTargetComment.author?.name || giftTargetComment.author?.username || 'Scholar') : (typeof giftTargetComment?.author === 'string' ? giftTargetComment.author : (typeof post?.author === 'object' ? (post.author?.name || post.author?.username || 'Scholar') : (typeof post?.author === 'string' ? post.author : 'Scholar')))}
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
