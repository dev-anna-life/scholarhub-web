'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCopy, FiCheck, FiShare2, FiSend } from 'react-icons/fi'
import { FaWhatsapp, FaTwitter, FaFacebook, FaLinkedin } from 'react-icons/fa'

export default function ShareModal({ isOpen, onClose, post }) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !post) return null

  const postId = post.id || post._id || 'clip'
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/post/${postId}` : `https://scholarhub-web.vercel.app/post/${postId}`
  const shareTitle = post.title || post.caption || 'Check out this post on ScholarHub!'
  const shareText = `${shareTitle}\n\n${shareUrl}`

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const handleWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank')
  }

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  const handleLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-sm bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-150 dark:border-zinc-700"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-zinc-700/60">
            <h3 className="font-extrabold text-base text-dark dark:text-white flex items-center gap-2">
              <FiShare2 className="text-primary" size={18} />
              <span>Share Content</span>
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Share Channels Grid */}
          <div className="p-5">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-4">Select platform to share:</p>

            <div className="grid grid-cols-4 gap-3 mb-5 text-center">
              {/* WhatsApp */}
              <button
                type="button"
                onClick={handleWhatsApp}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="w-12 h-12 rounded-full bg-[#25D366]/10 text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white flex items-center justify-center transition-all shadow-xs">
                  <FaWhatsapp size={24} />
                </div>
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">WhatsApp</span>
              </button>

              {/* Twitter / X */}
              <button
                type="button"
                onClick={handleTwitter}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="w-12 h-12 rounded-full bg-black/10 dark:bg-white/10 text-dark dark:text-white group-hover:bg-dark group-hover:text-white flex items-center justify-center transition-all shadow-xs">
                  <FaTwitter size={22} />
                </div>
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">X (Twitter)</span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={handleFacebook}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="w-12 h-12 rounded-full bg-[#1877F2]/10 text-[#1877F2] group-hover:bg-[#1877F2] group-hover:text-white flex items-center justify-center transition-all shadow-xs">
                  <FaFacebook size={22} />
                </div>
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">Facebook</span>
              </button>

              {/* LinkedIn */}
              <button
                type="button"
                onClick={handleLinkedIn}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="w-12 h-12 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] group-hover:bg-[#0A66C2] group-hover:text-white flex items-center justify-center transition-all shadow-xs">
                  <FaLinkedin size={22} />
                </div>
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">LinkedIn</span>
              </button>
            </div>

            {/* Direct Copy Link Bar with Sleek Icon Button */}
            <div className="relative flex items-center">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full py-2.5 pl-3 pr-12 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-mono bg-gray-50 dark:bg-zinc-900 text-gray-700 dark:text-gray-300 focus:outline-none truncate"
                title={shareUrl}
              />
              <button
                type="button"
                onClick={handleCopyLink}
                title={copied ? 'Copied to clipboard' : 'Copy link'}
                className={`absolute right-1.5 p-2 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-primary text-white hover:opacity-90'
                }`}
              >
                {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
