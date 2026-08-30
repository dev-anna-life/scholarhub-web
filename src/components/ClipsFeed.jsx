'use client'
import { useState, useRef, useEffect } from 'react'
import TikTokVideoCard from './TikTokVideoCard'

const SAMPLE_CLIPS = [
  {
    id: 'clip_1',
    authorName: 'Alex Rivers',
    authorUsername: 'alex_ux',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    skillDomain: 'UI/UX Design Studio',
    title: '3 Mobile Navigation UX Patterns You Need to Know',
    caption: 'Stop using complex 3-level accordion menus on mobile screens! Here are 3 clean navigation patterns that increase mobile retention by 40%...',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-student-reading-a-book-in-a-library-42930-large.mp4',
    likesCount: 342,
    commentCount: 28,
    allowDownload: true,
    citationSource: 'Google',
  },
  {
    id: 'clip_2',
    authorName: 'Sarah Jenkins',
    authorUsername: 'sarah_dev',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    skillDomain: 'Web & Software Engineering',
    title: 'How Async/Await Actually Works in JavaScript',
    caption: 'The event loop processes microtasks before macrotasks! Watch this 45-second visual breakdown of async execution order...',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-laptop-43093-large.mp4',
    likesCount: 512,
    commentCount: 45,
    allowDownload: true,
    citationSource: 'IEEE',
  },
  {
    id: 'clip_3',
    authorName: 'Dr. Michael Chen',
    authorUsername: 'prof_chen',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    skillDomain: 'Data Science & AI',
    title: 'Understanding Transformer Self-Attention in 60s',
    caption: 'Why did Transformers replace RNNs in AI? Self-attention calculates query-key matrix weights in parallel across all tokens at once!',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-studying-with-a-laptop-in-a-library-42932-large.mp4',
    likesCount: 890,
    commentCount: 72,
    allowDownload: false, // Creator toggled download OFF!
    citationSource: 'NASA',
  },
]

export default function ClipsFeed() {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollPosition = container.scrollTop
      const cardHeight = container.clientHeight
      const newIndex = Math.round(scrollPosition / cardHeight)
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex)
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [activeIndex])

  return (
    <div
      ref={containerRef}
      className="w-full max-w-md mx-auto h-[82vh] md:h-[85vh] overflow-y-scroll snap-y snap-mandatory rounded-3xl space-y-4 no-scrollbar border border-gray-200 dark:border-zinc-800 shadow-2xl bg-black"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {SAMPLE_CLIPS.map((clip, index) => (
        <TikTokVideoCard
          key={clip.id}
          video={clip}
          isActive={index === activeIndex}
        />
      ))}
    </div>
  )
}
