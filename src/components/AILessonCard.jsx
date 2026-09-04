'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiBookOpen, FiCheckCircle, FiAward, FiShare2, FiHeart, FiMessageCircle, FiZap, FiBook, FiCheck, FiX } from 'react-icons/fi'
import UserBadge from './UserBadge'
import ShareModal from './ShareModal'

export default function AILessonCard({ post }) {
  const [selectedOption, setSelectedOption] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post?.likesCount || 12)
  const [coinsWon, setCoinsWon] = useState(false)

  if (!post) return null

  const author = post.author || {}
  const isBot = author.email?.startsWith('bot_') || author.isBot || author.isOfficial || post.isAiAssisted

  // Extract quiz parameters if present in content or post
  const hasQuiz = post.content && post.content.includes('KNOWLEDGE CHECK')
  const defaultQuestion = post.quizQuestion || 'What is the key takeaways rule for this lesson?'
  const defaultOptions = post.quizOptions || ['Option A: Apply rule correctly', 'Option B: Ignore formula', 'Option C: Invalid concept', 'Option D: None of the above']
  const correctIdx = post.correctOptionIndex !== undefined ? post.correctOptionIndex : 0

  const handleSelectOption = (index) => {
    if (isAnswered) return
    setSelectedOption(index)
    setIsAnswered(true)
    if (index === correctIdx) {
      setCoinsWon(true)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900 border-2 border-amber-500/30 dark:border-amber-500/20 rounded-2xl p-5 shadow-sm hover:shadow-md transition relative overflow-hidden mb-5"
    >
      {/* Decorative Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-primary" />

      {/* Card Header: AI Lesson Badge & Author */}
      <div className="flex items-center justify-between mb-4 pt-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-emerald-600 text-white flex items-center justify-center font-bold overflow-hidden shadow-md">
            {author.avatar ? (
              <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
            ) : (
              <FiBookOpen size={18} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm text-dark dark:text-white">{author.name || 'Official AI Study Bot'}</h3>
              <UserBadge user={author} />
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">@{author.username || 'ai_tutor'} • {post.category || 'Academic Track'}</p>
          </div>
        </div>

        {/* Prominent Official AI Study Lesson Tag */}
        <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-2xs">
          <FiBook size={12} />
          <span>🏛️ OFFICIAL AI LESSON</span>
        </span>
      </div>

      {/* Lesson Title */}
      <h2 className="text-base font-extrabold text-dark dark:text-white mb-3 leading-snug">
        {post.title}
      </h2>

      {/* Lesson Body Content */}
      <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-amber-500/5 dark:bg-zinc-800/60 p-4 rounded-xl border border-amber-500/10 dark:border-zinc-700/50 mb-4 font-normal">
        {post.content}
      </div>

      {/* Verified Academic Source / Citation Badge */}
      {post.citationSource && (
        <div className="mb-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
          <FiCheckCircle size={13} />
          <span>Verified Curriculum Source: {post.citationSource}</span>
        </div>
      )}

      {/* Interactive 30-Second Quiz Widget */}
      <div className="bg-gray-50 dark:bg-zinc-800/80 p-4 rounded-xl border border-gray-200/80 dark:border-zinc-700/80 mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-extrabold text-dark dark:text-white flex items-center gap-1.5">
            <FiZap className="text-amber-500" size={14} />
            <span>30-Second Knowledge Check</span>
          </h4>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            +5 Scholar Coins 🪙
          </span>
        </div>

        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-3">
          {defaultQuestion}
        </p>

        {/* 4-Option Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {defaultOptions.map((opt, idx) => {
            let btnStyle = 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:border-primary'

            if (isAnswered) {
              if (idx === correctIdx) {
                btnStyle = 'bg-emerald-500 text-white border-emerald-600 font-bold shadow-md'
              } else if (idx === selectedOption) {
                btnStyle = 'bg-red-500 text-white border-red-600 font-bold'
              } else {
                btnStyle = 'bg-gray-100 dark:bg-zinc-900/50 text-gray-400 border-gray-200 dark:border-zinc-800 opacity-60'
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswered}
                className={`p-2.5 text-left rounded-xl text-xs border transition flex items-center justify-between ${btnStyle}`}
              >
                <span>{opt}</span>
                {isAnswered && idx === correctIdx && <FiCheck size={14} className="flex-shrink-0" />}
                {isAnswered && idx === selectedOption && idx !== correctIdx && <FiX size={14} className="flex-shrink-0" />}
              </button>
            )
          })}
        </div>

        {/* Coin Reward Banner */}
        <AnimatePresence>
          {coinsWon && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-2.5 bg-emerald-500 text-white rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
            >
              <FiAward size={16} />
              <span>Correct! 🎉 You earned +5 Scholar Coins!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-800 text-gray-500 text-xs font-bold">
        <button
          onClick={() => {
            setLiked(!liked)
            setLikesCount(prev => prev + (liked ? -1 : 1))
          }}
          className={`flex items-center gap-1.5 transition ${liked ? 'text-red-500' : 'hover:text-dark dark:hover:text-white'}`}
        >
          <FiHeart size={16} className={liked ? 'fill-current' : ''} />
          <span>{likesCount} Likes</span>
        </button>

        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-1.5 hover:text-primary transition"
        >
          <FiShare2 size={16} />
          <span>Share Lesson</span>
        </button>
      </div>

      {/* Share Modal Integration */}
      <ShareModal
        isOpen={showShareModal}
        post={post}
        onClose={() => setShowShareModal(false)}
      />
    </motion.div>
  )
}
