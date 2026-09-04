'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiHeart, FiMessageSquare, FiGift, FiDownload, FiLock, FiShare2, FiVolume2, FiVolumeX, FiPlay, FiPause, FiCheckCircle, FiBookOpen, FiActivity, FiCpu, FiLayout, FiShield, FiCode, FiCheck, FiX } from 'react-icons/fi'
import CommentDrawer from './CommentDrawer'
import PostGiftModal from './PostGiftModal'
import ShareModal from './ShareModal'

function AIVisualStoryCanvas({ video, isPlaying, isMuted }) {
  const [typedText, setTypedText] = useState('')
  const rawText = video.storyScenario || video.caption || ''
  // Strip raw emojis from text
  const fullText = rawText.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()

  useEffect(() => {
    if (!isPlaying) return
    setTypedText('')
    let idx = 0
    const timer = setInterval(() => {
      if (idx < fullText.length) {
        setTypedText(prev => prev + fullText.charAt(idx))
        idx++
      } else {
        clearInterval(timer)
      }
    }, 28)
    return () => clearInterval(timer)
  }, [isPlaying, fullText])

  const username = video.authorUsername || ''

  if (username === 'uni_law' || video.skillDomain?.includes('Law')) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-sky-950 flex flex-col justify-between p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
          <div className="w-80 h-80 rounded-full border border-sky-400 animate-ping" style={{ animationDuration: '6s' }} />
        </div>

        <div className="relative z-10 flex items-center justify-between pt-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/40 backdrop-blur-md text-sky-300 text-xs font-bold">
            <FiShield size={14} className="text-sky-400 animate-pulse" />
            <span>AI Legal Visual Storyboard</span>
          </div>
          <span className="text-[10px] text-sky-200/70 font-semibold">Nigerian Constitutional Law</span>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center px-2">
          <motion.div
            animate={{ rotate: isPlaying ? [0, 4, -4, 0] : 0 }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-sky-500/30 mb-4 border border-sky-300/30"
          >
            <FiShield size={48} className="text-white drop-shadow-md" />
          </motion.div>

          <h2 className="text-lg md:text-xl font-extrabold text-white mb-2 leading-tight drop-shadow-md">
            {(video.title || '').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()}
          </h2>

          <div className="w-full max-w-sm p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-sky-400/30 text-left shadow-2xl">
            <div className="flex items-center gap-1.5 text-sky-400 text-[11px] font-bold mb-1.5 uppercase tracking-wider">
              <FiBookOpen size={13} />
              <span>Prompt Narrative Scene</span>
            </div>
            <p className="text-xs text-sky-100 font-mono leading-relaxed min-h-[72px]">
              {typedText || fullText}
              {typedText.length < fullText.length && <span className="animate-pulse text-sky-400 font-bold">|</span>}
            </p>
          </div>
        </div>

        <div className="h-20" />
      </div>
    )
  }

  if (username === 'uni_med' || video.skillDomain?.includes('Medical')) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-teal-950 to-emerald-950 flex flex-col justify-between p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
          <div className="w-96 h-96 rounded-full border border-teal-400 animate-ping" style={{ animationDuration: '4s' }} />
        </div>

        <div className="relative z-10 flex items-center justify-between pt-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 backdrop-blur-md text-emerald-300 text-xs font-bold">
            <FiActivity size={14} className="text-emerald-400 animate-pulse" />
            <span>AI Clinical Medical Storyboard</span>
          </div>
          <span className="text-[10px] text-emerald-200/70 font-semibold">Guyton Physiology</span>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center px-2">
          <motion.div
            animate={{ scale: isPlaying ? [1, 1.1, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/30 mb-4 border border-emerald-300/30"
          >
            <FiActivity size={48} className="text-white drop-shadow-md" />
          </motion.div>

          <h2 className="text-lg md:text-xl font-extrabold text-white mb-2 leading-tight drop-shadow-md">
            {(video.title || '').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()}
          </h2>

          <div className="w-full max-w-sm p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-emerald-400/30 text-left shadow-2xl">
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold mb-1.5 uppercase tracking-wider">
              <FiBookOpen size={13} />
              <span>Clinical Symptom Pathway</span>
            </div>
            <p className="text-xs text-emerald-100 font-mono leading-relaxed min-h-[72px]">
              {typedText || fullText}
              {typedText.length < fullText.length && <span className="animate-pulse text-emerald-400 font-bold">|</span>}
            </p>
          </div>
        </div>

        <div className="h-20" />
      </div>
    )
  }

  if (username === 'pro_uiux' || video.skillDomain?.includes('UI/UX')) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950 to-indigo-950 flex flex-col justify-between p-6 overflow-hidden">
        <div className="relative z-10 flex items-center justify-between pt-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/40 backdrop-blur-md text-purple-300 text-xs font-bold">
            <FiLayout size={14} className="text-purple-400 animate-pulse" />
            <span>AI Product Design Visual Story</span>
          </div>
          <span className="text-[10px] text-purple-200/70 font-semibold">Figma & Apple HIG</span>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center px-2">
          <motion.div
            animate={{ y: isPlaying ? [-4, 4, -4] : 0 }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-2xl shadow-purple-500/30 mb-4 border border-purple-300/30"
          >
            <FiLayout size={48} className="text-white drop-shadow-md" />
          </motion.div>

          <h2 className="text-lg md:text-xl font-extrabold text-white mb-2 leading-tight drop-shadow-md">
            {(video.title || '').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()}
          </h2>

          <div className="w-full max-w-sm p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-purple-400/30 text-left shadow-2xl">
            <div className="flex items-center gap-1.5 text-purple-400 text-[11px] font-bold mb-1.5 uppercase tracking-wider">
              <FiBookOpen size={13} />
              <span>UX Friction Case Breakdown</span>
            </div>
            <p className="text-xs text-purple-100 font-mono leading-relaxed min-h-[72px]">
              {typedText || fullText}
              {typedText.length < fullText.length && <span className="animate-pulse text-purple-400 font-bold">|</span>}
            </p>
          </div>
        </div>

        <div className="h-20" />
      </div>
    )
  }

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-zinc-900 to-slate-950 flex flex-col justify-between p-6 overflow-hidden">
      <div className="relative z-10 flex items-center justify-between pt-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 backdrop-blur-md text-amber-300 text-xs font-bold">
          <FiCode size={14} className="text-amber-400 animate-pulse" />
          <span>AI Software Engineering Storyboard</span>
        </div>
        <span className="text-[10px] text-amber-200/70 font-semibold">MDN & AWS Serverless</span>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center px-2">
        <motion.div
          animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-600 to-orange-600 flex items-center justify-center text-white shadow-2xl shadow-amber-500/30 mb-4 border border-amber-300/30"
        >
          <FiCode size={48} className="text-white drop-shadow-md" />
        </motion.div>

        <h2 className="text-lg md:text-xl font-extrabold text-white mb-2 leading-tight drop-shadow-md">
          {(video.title || '').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()}
        </h2>

        <div className="w-full max-w-sm p-4 rounded-2xl bg-black/75 backdrop-blur-md border border-amber-400/30 text-left shadow-2xl">
          <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-bold mb-1.5 uppercase tracking-wider">
            <FiBookOpen size={13} />
            <span>Code Incident Scenario</span>
          </div>
          <p className="text-xs text-amber-100 font-mono leading-relaxed min-h-[72px]">
            {typedText || fullText}
            {typedText.length < fullText.length && <span className="animate-pulse text-amber-400 font-bold">|</span>}
          </p>
        </div>
      </div>

      <div className="h-20" />
    </div>
  )
}

export default function TikTokVideoCard({ video, onGift, isActive }) {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [showGiftModal, setShowGiftModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadNotice, setDownloadNotice] = useState('')
  const [shareNotice, setShareNotice] = useState('')

  const hasRealVideo = Boolean(video?.videoUrl || video?.video)

  const handleShare = (e) => {
    e.stopPropagation()
    setShowShareModal(true)
  }

  const handleLike = (e) => {
    e.stopPropagation()
    setIsLiked(prev => !prev)
  }

  const allowDownload = video?.allowDownload !== false

  useEffect(() => {
    if (isActive) {
      setIsPlaying(true)
      if (videoRef.current) {
        videoRef.current.currentTime = 0
        videoRef.current.muted = true
        videoRef.current.play().catch(() => {})
      }
    } else {
      setIsPlaying(false)
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }
  }, [isActive])

  const togglePlay = () => {
    setIsPlaying(prev => !prev)
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause()
      else videoRef.current.play().catch(() => {})
    }
  }

  const toggleMute = (e) => {
    e.stopPropagation()
    setIsMuted(prev => !prev)
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
  }

  const handleDownload = async (e) => {
    e.stopPropagation()
    if (!allowDownload) {
      setDownloadNotice('Creator has disabled clip downloads')
      setTimeout(() => setDownloadNotice(''), 3000)
      return
    }

    try {
      setIsDownloading(true)
      setDownloadNotice('Exporting lesson transcript...')
      const cleanT = (video.title || '').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()
      const cleanC = (video.storyScenario || video.caption || '').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()
      const blob = new Blob([`${cleanT}\n\n${cleanC}\n\nCitation: ${video.citationSource || 'Verified Source'}`], { type: 'text/plain;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `ScholarHub_Lesson_${video.id || 'clip'}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      setDownloadNotice('Saved successfully!')
    } catch (err) {
      setDownloadNotice('Export failed')
    } finally {
      setIsDownloading(false)
      setTimeout(() => setDownloadNotice(''), 3000)
    }
  }

  const cleanTitle = (video.title || '').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()
  const cleanCaption = (video.caption || video.content || '').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()

  return (
    <div
      onClick={togglePlay}
      className="relative w-full h-full bg-black rounded-2xl overflow-hidden shadow-2xl snap-start snap-always flex flex-col justify-center items-center group cursor-pointer"
    >
      {hasRealVideo ? (
        <video
          ref={videoRef}
          src={video.videoUrl || video.video}
          poster={video.poster}
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          className="w-full h-full object-cover cursor-pointer"
        />
      ) : (
        <AIVisualStoryCanvas
          video={video}
          isPlaying={isPlaying}
          isMuted={isMuted}
        />
      )}

      {/* Play/Pause Overlay Icon */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs z-20 cursor-pointer">
          <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white text-2xl shadow-xl">
            <FiPlay size={32} className="ml-1" />
          </div>
        </div>
      )}

      {/* Mute/Unmute Quick Toggle */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition"
        title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
      >
        {isMuted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
      </button>

      {/* Share / Download Notice Toast */}
      <AnimatePresence>
        {(downloadNotice || shareNotice) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-lg text-center"
          >
            {downloadNotice || shareNotice}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Info Overlay */}
      <div className="absolute bottom-0 left-0 right-16 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-20 text-white pointer-events-none">
        <div className="flex items-center gap-2.5 mb-2 pointer-events-auto">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-white text-sm border-2 border-white overflow-hidden shadow-md">
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

        <h3 className="font-bold text-sm md:text-base text-white mb-1 leading-snug line-clamp-2">{cleanTitle}</h3>
        <p className="text-xs text-gray-200 line-clamp-2 font-normal leading-relaxed">{cleanCaption}</p>

        {video.citationSource && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
            <FiCheckCircle size={12} className="text-emerald-400" />
            <span>Verified Source: {video.citationSource}</span>
          </div>
        )}
      </div>

      {/* Right Side Action Buttons */}
      <div className="absolute right-3 bottom-8 z-30 flex flex-col items-center gap-5">
        <button onClick={handleLike} className="flex flex-col items-center gap-1 text-white group/btn cursor-pointer">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${isLiked ? 'bg-red-500 text-white scale-110' : 'bg-black/40 hover:bg-black/60 text-white'}`}>
            <FiHeart size={22} className={isLiked ? 'fill-current' : ''} />
          </div>
          <span className="text-[10px] font-bold text-white drop-shadow-md">Like</span>
        </button>

        <button onClick={(e) => { e.stopPropagation(); setShowComments(true) }} className="flex flex-col items-center gap-1 text-white cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition">
            <FiMessageSquare size={22} />
          </div>
          <span className="text-[10px] font-bold text-white drop-shadow-md">Comment</span>
        </button>

        <button onClick={(e) => { e.stopPropagation(); setShowGiftModal(true) }} className="flex flex-col items-center gap-1 text-white animate-bounce" style={{ animationDuration: '3s' }}>
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 hover:opacity-90 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 transition scale-105">
            <FiGift size={22} />
          </div>
          <span className="text-[10px] font-extrabold text-amber-300 drop-shadow-md">Gift Coins</span>
        </button>

        <button onClick={handleShare} className="flex flex-col items-center gap-1 text-white cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-black/40 hover:bg-emerald-500 backdrop-blur-md flex items-center justify-center text-white transition">
            <FiShare2 size={20} />
          </div>
          <span className="text-[10px] font-bold text-white drop-shadow-md">Share</span>
        </button>

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          title={allowDownload ? 'Export Lesson Transcript' : 'Creator has disabled downloads'}
          className="flex flex-col items-center gap-1 text-white cursor-pointer"
        >
          <div className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition ${allowDownload ? 'bg-black/40 hover:bg-primary text-white' : 'bg-black/60 text-gray-400 cursor-not-allowed'}`}>
            {allowDownload ? (
              <FiDownload size={20} className={isDownloading ? 'animate-bounce' : ''} />
            ) : (
              <FiLock size={20} className="text-gray-400" />
            )}
          </div>
          <span className="text-[10px] font-bold text-white drop-shadow-md">
            {allowDownload ? (isDownloading ? 'Exporting' : 'Download') : 'Locked'}
          </span>
        </button>
      </div>

      <PostGiftModal
        isOpen={showGiftModal}
        post={video}
        onClose={() => setShowGiftModal(false)}
      />

      <ShareModal
        isOpen={showShareModal}
        post={video}
        onClose={() => setShowShareModal(false)}
      />

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
