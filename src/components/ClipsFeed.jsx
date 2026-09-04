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
    storyScenario: 'Law Case Story: Landlord Lockout\n- Fact: Landlord changed locks without court order\n- Statute: Recovery of Premises Law & S.42\n- Takeaway: Self-help eviction is illegal in law',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
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
    storyScenario: 'Clinical Story: Referred Cardiac Pain\n- Symptom: Left jaw & elbow ache post-10km run\n- Pathway: T1-T4 spinal nerve visceral convergence\n- Takeaway: Cardiac distress can manifest without chest pain',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/elephants.mp4',
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
    storyScenario: 'UX Story: The $300M Checkout Button\n- Problem: 45% user dropoff on mandatory registration\n- Fix: Replaced with "Continue as Guest" option\n- Impact: +45% conversion ($300 Million extra revenue)',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
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
    storyScenario: 'Dev Incident Story: $45K Serverless Loop\n- Bug: Omitted counter variable in while loop\n- Impact: 140 Million cloud function calls in 48h\n- Takeaway: Always configure billing triggers & max timeout',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
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

  const goToNext = () => {
    if (activeIndex < SAMPLE_CLIPS.length - 1) {
      const nextIndex = activeIndex + 1
      setActiveIndex(nextIndex)
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: nextIndex * containerRef.current.clientHeight,
          behavior: 'smooth'
        })
      }
    }
  }

  const goToPrev = () => {
    if (activeIndex > 0) {
      const prevIndex = activeIndex - 1
      setActiveIndex(prevIndex)
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: prevIndex * containerRef.current.clientHeight,
          behavior: 'smooth'
        })
      }
    }
  }

  // Support Desktop Keyboard Up/Down Arrow Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        goToNext()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        goToPrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex])

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Desktop Up / Down Arrow Navigation Buttons */}
      <div className="hidden sm:flex flex-col gap-3 absolute -right-14 top-1/2 -translate-y-1/2 z-30">
        <button
          type="button"
          onClick={goToPrev}
          disabled={activeIndex === 0}
          className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-dark dark:text-white shadow-lg disabled:opacity-30 hover:bg-primary hover:text-white transition"
          title="Previous Video (Up Arrow)"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={goToNext}
          disabled={activeIndex === SAMPLE_CLIPS.length - 1}
          className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-dark dark:text-white shadow-lg disabled:opacity-30 hover:bg-primary hover:text-white transition"
          title="Next Video (Down Arrow)"
        >
          ▼
        </button>
      </div>

      {/* Main Snap Scroll Container - Hides Browser Scrollbar Line Completely */}
      <div
        ref={containerRef}
        className="h-[calc(100vh-140px)] md:h-[620px] w-full overflow-y-scroll snap-y snap-mandatory bg-black rounded-3xl relative scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-y shadow-2xl border-0"
        style={{ scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {SAMPLE_CLIPS.map((clip, index) => (
          <div
            key={clip.id}
            className="h-[calc(100vh-140px)] md:h-[620px] w-full snap-start snap-always relative flex-shrink-0 overflow-hidden"
            style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
          >
            <TikTokVideoCard
              video={clip}
              isActive={index === activeIndex}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
