'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiX, FiSend, FiGift, FiThumbsUp, FiCompass,
  FiImage, FiZap, FiStar, FiAward, FiMessageCircle
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
  const listRef = useRef(null)

  const resetGift = () => {
    setGiftTargetComment(null)
    setGiftMsg('')
  }

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
      setGiftMsg(`✅ Sent ${rgItem.name} reaction!`)
      if (res.data?.coins !== undefined && setUser) {
        setUser(u => ({ ...u, coins: res.data.coins }))
      }
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
      <div className="fixed inset-0 z-[999] flex flex-col justify-end">
        {/* Backdrop — click to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50"
        />

        {/* Bottom Sheet — full-width, TikTok/X style, RELATIVE so gift panel stays inside */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="relative z-10 w-full bg-[#1c1c1e] rounded-t-3xl flex flex-col overflow-hidden"
          style={{ maxHeight: '82vh' }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0">
            <div className="w-9 h-1 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.08] flex-shrink-0">
            <div className="flex items-center gap-2">
              <FiMessageCircle className="text-white/60" size={16} />
              <h3 className="text-sm font-bold text-white">
                {comments.length > 0 ? `${comments.length} Comment${comments.length !== 1 ? 's' : ''}` : 'Comments'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Comment List */}
          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-white/40 text-xs">
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-white/40">
                <FiMessageCircle size={36} className="mb-3 opacity-30" />
                <p className="text-sm font-medium">Be the first to comment</p>
              </div>
            ) : (
              topLevel.map((comment) => {
                const cId = comment.id || comment._id
                const replies = repliesMap[cId] || []
                return (
                  <div key={cId} className="flex flex-col gap-1">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                        {comment.author?.name?.charAt(0)?.toUpperCase() || 'S'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-white">{comment.author?.name || 'Scholar'}</span>
                          <span className="text-[10px] text-white/30">
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : ''}
                          </span>
                        </div>
                        <p className="text-sm text-white/80 leading-snug">{comment.text}</p>
                        <div className="flex items-center gap-4 mt-1.5">
                          <button
                            onClick={() => setReplyTo({ commentId: cId, authorName: comment.author?.name || 'Scholar' })}
                            className="text-[11px] font-semibold text-white/40 hover:text-white transition"
                          >
                            Reply
                          </button>
                          <button
                            onClick={() => { setGiftTargetComment(comment); setGiftMsg('') }}
                            className="text-[11px] font-semibold text-amber-400/80 hover:text-amber-400 flex items-center gap-1 transition"
                          >
                            <FiGift size={11} /> Gift
                          </button>
                          {replies.length > 0 && (
                            <button
                              onClick={() => toggleShowReplies(cId)}
                              className="text-[11px] font-semibold text-primary/80 hover:text-primary transition"
                            >
                              {showRepliesMap[cId] ? 'Hide replies' : `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Replies */}
                    {replies.length > 0 && showRepliesMap[cId] && (
                      <div className="ml-11 pl-3 border-l border-white/10 flex flex-col gap-2 mt-1">
                        {replies.map((reply) => {
                          const rId = reply.id || reply._id
                          return (
                            <div key={rId} className="flex items-start gap-2.5">
                              <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-primary text-[10px] font-bold flex-shrink-0">
                                {reply.author?.name?.charAt(0)?.toUpperCase() || 'S'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[11px] font-bold text-white">{reply.author?.name || 'Scholar'}</span>
                                <p className="text-xs text-white/70 mt-0.5 leading-snug">{reply.text}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <button
                                    onClick={() => setReplyTo({ commentId: cId, authorName: reply.author?.name || 'Scholar' })}
                                    className="text-[10px] font-semibold text-white/40 hover:text-white transition"
                                  >
                                    Reply
                                  </button>
                                  <button
                                    onClick={() => { setGiftTargetComment(reply); setGiftMsg('') }}
                                    className="text-[10px] font-semibold text-amber-400/70 hover:text-amber-400 flex items-center gap-1 transition"
                                  >
                                    <FiGift size={10} /> Gift
                                  </button>
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
          <div className="px-3 pb-5 pt-2 border-t border-white/[0.08] bg-[#1c1c1e] flex-shrink-0">
            {replyTo && (
              <div className="flex items-center justify-between bg-primary/15 px-3 py-1.5 rounded-xl text-xs text-primary font-semibold mb-2">
                <span>Replying to <strong>@{replyTo.authorName}</strong></span>
                <button onClick={() => setReplyTo(null)} className="text-white/40 hover:text-white">✕</button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div className="flex-1 flex items-center gap-2 bg-white/[0.08] rounded-full px-4 py-2.5 border border-white/10">
                <input
                  type="text"
                  placeholder={replyTo ? `Reply to ${replyTo.authorName}...` : 'Add comment...'}
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendComment()}
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
                />
                {/* Gift icon inside input — opens gift panel WITHIN the drawer */}
                <button
                  onClick={() => { setGiftTargetComment(null); setGiftMsg('') }}
                  className="text-amber-400/60 hover:text-amber-400 transition flex-shrink-0"
                  title="Send a gift reaction"
                >
                  <FiGift size={16} />
                </button>
              </div>
              <button
                onClick={handleSendComment}
                disabled={commenting || !commentText.trim()}
                className="w-9 h-9 bg-primary rounded-full flex items-center justify-center hover:opacity-90 transition disabled:opacity-40 flex-shrink-0"
              >
                <FiSend size={14} className="text-white" />
              </button>
            </div>
          </div>

          {/* ─── Gift Panel — INSIDE the drawer (absolute over the drawer only) ─── */}
          <AnimatePresence>
            {(giftTargetComment !== undefined && giftTargetComment !== null && giftTargetComment !== false) || giftTargetComment === null && false ? null : null}
            {giftTargetComment && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="absolute inset-0 bg-[#242428] rounded-t-3xl flex flex-col px-4 pt-4 pb-6 z-20"
              >
                {/* Gift panel drag handle */}
                <div className="flex justify-center mb-3">
                  <div className="w-9 h-1 rounded-full bg-white/20" />
                </div>

                {/* Gift panel header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FiGift className="text-amber-400" size={18} />
                    <h4 className="text-sm font-bold text-white">
                      Gift @{giftTargetComment.author?.name || 'Scholar'}
                    </h4>
                  </div>
                  <button
                    onClick={resetGift}
                    className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition"
                  >
                    <FiX size={18} />
                  </button>
                </div>

                {giftMsg && (
                  <div className={`text-xs font-semibold mb-3 px-3 py-2 rounded-xl ${giftMsg.startsWith('✅') ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                    {giftMsg}
                  </div>
                )}

                <p className="text-xs text-white/40 mb-3">Choose a reaction gift to send:</p>

                <div className="grid grid-cols-2 gap-2 overflow-y-auto">
                  {REACTION_GIFTS.map((rg) => {
                    const IconComponent = rg.icon
                    return (
                      <button
                        key={rg.id}
                        disabled={gifting}
                        onClick={() => handleSendGift(rg)}
                        className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition disabled:opacity-40 ${rg.color}`}
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
          {/* ─────────────────────────────────────────────────────────────────── */}

        </motion.div>
      </div>
    </AnimatePresence>
  )
}
