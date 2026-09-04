'use client'
import { useState, useRef, useEffect } from 'react'
import TikTokVideoCard from './TikTokVideoCard'

const SAMPLE_CLIPS = [
  {
    id: 'clip_1',
    authorName: 'Official Law AI Bot',
    authorUsername: 'uni_law',
    authorAvatar: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=150',
    skillDomain: 'University Law Track',
    title: 'AI Case Story: The Locked-Out Tenant & Self-Help Eviction Law',
    caption: 'Meet Sarah. Her landlord changed her locks overnight without a court order. Is self-help eviction legal? Watch this 45-second legal case story...',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    likesCount: 642,
    commentCount: 48,
    allowDownload: true,
    citationSource: 'Nigerian Constitutional Law & Supreme Court Law Reports',
    isOfficial: true
  },
  {
    id: 'clip_2',
    authorName: 'Official Medical AI Bot',
    authorUsername: 'uni_med',
    authorAvatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150',
    skillDomain: 'Medical Sciences Track',
    title: 'AI Clinical Story: The Marathon Runner\'s Hidden Heart Warning',
    caption: 'Marcus felt zero chest pain after his 10km run, but his jaw and left elbow were aching. Watch how the brain misinterprets heart distress (Referred Pain)...',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    likesCount: 812,
    commentCount: 65,
    allowDownload: true,
    citationSource: 'Guyton & Hall Medical Physiology Textbook',
    isOfficial: true
  },
  {
    id: 'clip_3',
    authorName: 'Official UI/UX AI Bot',
    authorUsername: 'pro_uiux',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    skillDomain: 'UI/UX & Product Design',
    title: 'AI Design Story: How 1 Button Change Generated $300 Million',
    caption: 'Why did removing the mandatory "Register" form at checkout generate $300M in revenue? Watch this 60-second UX friction story...',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    likesCount: 1240,
    commentCount: 92,
    allowDownload: true,
    citationSource: 'Figma & Apple Human Interface Guidelines',
    isOfficial: true
  },
  {
    id: 'clip_4',
    authorName: 'Official Web Dev AI Bot',
    authorUsername: 'pro_webdev',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    skillDomain: 'Web & Software Engineering',
    title: 'AI Dev Story: The $45,000 Infinite Loop Weekend',
    caption: 'A developer forgot one loop counter variable in a serverless function and spawned 140 million cloud calls over 48 hours. Here is why execution limits matter...',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    likesCount: 950,
    commentCount: 84,
    allowDownload: true,
    citationSource: 'MDN Web Docs & AWS Serverless Best Practices',
    isOfficial: true
  }
]

export default function ClipsFeed() {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleScroll = () => {
      const height = el.clientHeight || 1
      const scrollTop = el.scrollTop
      const newIndex = Math.round(scrollTop / height)
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex)
      }
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [activeIndex])

  return (
    <div
      ref={containerRef}
      className="h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] w-full overflow-y-scroll snap-y snap-mandatory bg-black rounded-3xl relative scrollbar-none touch-pan-y"
      style={{ scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' }}
    >
      {SAMPLE_CLIPS.map((clip, index) => (
        <div
          key={clip.id}
          className="h-full w-full snap-start snap-always relative flex-shrink-0"
          style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
        >
          <TikTokVideoCard
            video={clip}
            isActive={index === activeIndex}
          />
        </div>
      ))}
    </div>
  )
}
