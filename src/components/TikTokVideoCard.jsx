'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiHeart, FiMessageSquare, FiGift, FiDownload, FiLock, FiShare2, FiVolume2, FiVolumeX, FiPlay, FiPause, FiCheckCircle } from 'react-icons/fi'
import CommentDrawer from './CommentDrawer'
import PostGiftModal from './PostGiftModal'

export default function TikTokVideoCard({ video, onGift, isActive }) {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(video?.likesCount || 24)
  const [showGiftModal, setShowGiftModal] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadNotice, setDownloadNotice] = useState('')
  const [shareNotice, setShareNotice] = useState('')

  const handleShare = (e) => {
    e.stopPropagation()
    const url = typeof window !== 'undefined' ? (window.location.origin + '/post/' + (video.id || video._id || 'clip')) : ''
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
    }
    setShareNotice('🔗 Video link copied to clipboard!')
    setTimeout(() => setShareNotice(''), 3000)
  }

  const allowDownload = video?.allowDownload !== false // Default true unless creator toggled false

  useEffect(() => {
    if (!videoRef.current) return

    if (isActive) {
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay blocked by browser autoplay policy, try muted
            setIsMuted(true)
            videoRef.current.muted = true
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
          })
      }
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [isActive])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const toggleMute = (e) => {
    e.stopPropagation()
    if (!videoRef.current) return
    const newMute = !isMuted
    videoRef.current.muted = newMute
    setIsMuted(newMute)
  }

  const handleLike = (e) => {
    e.stopPropagation()
    if (isLiked) {
      setLikesCount(prev => prev - 1)
      setIsLiked(false)
    } else {
      setLikesCount(prev => prev + 1)
      setIsLiked(true)
    }
  }

  const handleDownload = async (e) => {
    e.stopPropagation()
    if (!allowDownload) {
      setDownloadNotice('🔒 Creator has disabled video downloads for this clip')
      setTimeout(() => setDownloadNotice(''), 3000)
      return
    }

    try {
      setIsDownloading(true)
      setDownloadNotice('📥 Starting download...')
      
      const response = await fetch(video.videoUrl || video.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `ScholarHub_Clip_${video.id || 'video'}.mp4`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
      setDownloadNotice('✅ Downloaded successfully!')
    } catch (err) {
      console.error('Download failed', err)
      setDownloadNotice('❌ Download failed. Try again.')
    } finally {
      setIsDownloading(false)
      setTimeout(() => setDownloadNotice(''), 3000)
    }
  }

  return (
    <div className="relative w-full h-[82vh] md:h-[85vh] bg-black rounded-3xl overflow-hidden shadow-2xl snap-start flex flex-col justify-center items-center group">
      
      {/* Video Element */}
      <video
        ref={videoRef}
        src={video.videoUrl || video.url || 'https://assets.mixkit.co/videos/preview/mixkit-student-reading-a-book-in-a-library-42930-large.mp4'}
        poster={video.poster}
        loop
        playsInline
        className="w-full h-full object-cover cursor-pointer"
        onClick={togglePlay}
      />

      {/* Play/Pause Overlay Icon */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
          <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white text-2xl">
            <FiPlay size={32} className="ml-1" />
          </div>
        </div>
      )}

      {/* Mute/Unmute Quick Toggle */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition"
      >
        {isMuted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
      </button>

      {/* Share / Download Status Toast Notice */}
      <AnimatePresence>
        {(downloadNotice || shareNotice) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-lg text-center"
          >
            {downloadNotice || shareNotice}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Info Overlay */}
      <div className="absolute bottom-0 left-0 right-16 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 text-white pointer-events-none">
        
        {/* Creator Info Header */}
        <div className="flex items-center gap-2.5 mb-2 pointer-events-auto">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-white text-sm border-2 border-white overflow-hidden">
            {video.authorAvatar ? (
              <img src={video.authorAvatar} alt={video.authorName} className="w-full h-full object-cover" />
            ) : (
              (video.authorName || 'Scholar')[0]
            )}
          </div>
          <div>
            <p className="font-bold text-sm text-white flex items-center gap-1">
              {video.authorName || 'Scholar Creator'}
              <FiCheckCircle size={14} className="text-primary" />
            </p>
            <p className="text-[11px] text-gray-300 font-medium">@{video.authorUsername || 'scholar_creator'} • {video.skillDomain || 'Pro Skill Guild'}</p>
          </div>
        </div>

        {/* Video Title & Caption */}
        <h3 className="font-bold text-sm md:text-base text-white mb-1.5 line-clamp-2">{video.title || 'Micro-Lesson: 3 Quick Tips for Modern Scholars'}</h3>
        <p className="text-xs text-gray-200 line-clamp-2 font-normal leading-relaxed">{video.caption || video.content || 'Learn how to boost your study retention in 60 seconds with active recall techniques!'}</p>

        {/* Citation / Source Badge */}
        {video.citationSource && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
            🟢 Verified Source: {video.citationSource}
          </div>
        )}
      </div>

      {/* Right Side Floating Action Buttons Overlay */}
      <div className="absolute right-3 bottom-8 z-20 flex flex-col items-center gap-5">
        
        {/* Like Button */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1 text-white group/btn">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${isLiked ? 'bg-red-500 text-white scale-110' : 'bg-black/40 hover:bg-black/60 text-white'}`}>
            <FiHeart size={22} className={isLiked ? 'fill-current' : ''} />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow-md">{likesCount}</span>
        </button>

        {/* Comments Button */}
        <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1 text-white">
          <div className="w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition">
            <FiMessageSquare size={22} />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow-md">{video.commentCount || 8}</span>
        </button>

        {/* Gift Reaction Button */}
        <button onClick={() => setShowGiftModal(true)} className="flex flex-col items-center gap-1 text-white animate-bounce" style={{ animationDuration: '3s' }}>
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 hover:opacity-90 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 transition scale-105">
            <FiGift size={22} />
          </div>
          <span className="text-[10px] font-extrabold text-amber-300 drop-shadow-md">Gift Coins</span>
        </button>

        {/* Share Video Button */}
        <button onClick={handleShare} className="flex flex-col items-center gap-1 text-white">
          <div className="w-12 h-12 rounded-full bg-black/40 hover:bg-emerald-500 backdrop-blur-md flex items-center justify-center text-white transition">
            <FiShare2 size={20} />
          </div>
          <span className="text-[10px] font-bold text-white drop-shadow-md">Share</span>
        </button>

        {/* Download Video Button (With Creator Download Preference) */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          title={allowDownload ? 'Download Video' : 'Creator has disabled downloads'}
          className="flex flex-col items-center gap-1 text-white"
        >
          <div className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition ${allowDownload ? 'bg-black/40 hover:bg-primary text-white' : 'bg-black/60 text-gray-400 cursor-not-allowed'}`}>
            {allowDownload ? (
              <FiDownload size={20} className={isDownloading ? 'animate-bounce' : ''} />
            ) : (
              <FiLock size={20} className="text-gray-400" />
            )}
          </div>
          <span className="text-[10px] font-bold text-white drop-shadow-md">
            {allowDownload ? (isDownloading ? 'Downloading' : 'Download') : 'Locked'}
          </span>
        </button>
      </div>

      {/* Gift Modal Integration */}
      <PostGiftModal
        isOpen={showGiftModal}
        post={video}
        onClose={() => setShowGiftModal(false)}
      />

      {/* Comment Drawer Integration */}
      {showComments && (
        <CommentDrawer
          post={video}
          isOpen={showComments}
          onClose={() => setShowComments(false)}
        />
      )}

    </div>
  )
}
