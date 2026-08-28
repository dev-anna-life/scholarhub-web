'use client'
/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { FiArrowRight, FiUsers, FiBookOpen, FiAward, FiZap, FiMenu, FiX, FiGlobe, FiCode, FiLayers, FiCheckCircle } from "react-icons/fi"
import { useRouter } from "next/navigation"
import { getLeaderboard } from "../api/auth"

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' }
  })
}

const features = [
  { icon: FiCode, title: "Skill Guilds & Peer Reviews", desc: "Build in public, submit project drafts for constructive peer reviews, and build a verified job-ready portfolio." },
  { icon: FiUsers, title: "Global Campus Communities", desc: "Connect with students at your university, school, or skill category worldwide. Find your tribe." },
  { icon: FiAward, title: "Reaction Gifts & Coins", desc: "Earn reaction gift badges (Helpful, Brilliant, Masterclass) and Scholar Coins for adding value." },
  { icon: FiCheckCircle, title: "Citation Source Verification", desc: "Share academic posts backed by official citation tags like NASA, Google Scholar, Wikipedia, and UNESCO." },
]

const steps = [
  { number: "01", title: "Create your Scholar account", desc: "Choose your primary track (Academic Scholar or Pro Skill Scholar) in seconds." },
  { number: "02", title: "Join Campus Hubs & Skill Guilds", desc: "Select your school or skill interests so we can personalize your live home feed." },
  { number: "03", title: "Build, engage & earn", desc: "Share projects, get peer reviews, earn reaction gifts and build your verified reputation." },
]

const communities = [
  { id: 'academic', name: "Academic Campus Hubs", color: "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30", badge: "text-emerald-600 dark:text-emerald-400", desc: "Universities, High Schools & Course Cohorts worldwide" },
  { id: 'skills', name: "Pro Skill Guilds", color: "bg-blue-50/40 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30", badge: "text-blue-600 dark:text-blue-400", desc: "UI/UX Design, Web Dev, Data Analytics, Public Speaking" },
]

const navLinks = [
  { label: "Home", id: "hero" },
  { label: "Features", id: "features" },
  { label: "Hubs & Guilds", id: "communities" },
  { label: "How It Works", id: "how" },
  { label: "Leaderboard", id: "leaderboard" },
]

function Landing() {
  const revealRefs = useRef([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [topScholars, setTopScholars] = useState([])
  const [scholarsLoading, setScholarsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await getLeaderboard()
        const users = (res.data?.leaderboard || res.data || []).slice(0, 5)
        setTopScholars(users)
      } catch (err) {
        console.error("Failed to load leaderboard", err)
        setTopScholars([])
      } finally {
        setScholarsLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add("revealed")
      }),
      { threshold: 0.12 }
    )
    revealRefs.current.forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const addRef = el => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el)
  }

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  const handleCommunityClick = (id) => {
    const token = localStorage.getItem('token')
    if (token) {
      router.push(id === 'skills' ? '/community?tab=skills' : '/community')
    } else {
      router.push(`/signup?track=${id}`)
    }
  }

  return (
    <div className="min-h-screen bg-light overflow-x-hidden">

      <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-300 ${scrolled ? 'bg-dark backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-dark'}`}>
        <h1 className="text-xl font-extrabold text-light">
          Scholar<span className="text-accent">Hub</span>
        </h1>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-sm font-medium text-gray-400 hover:text-accent px-3 py-2 rounded-lg hover:bg-primary/5 transition-all duration-200"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm rounded-xl bg-light px-5 py-2.5 font-medium text-accent hover:text-accent transition">
            Sign In
          </Link>
          <Link href="/signup" className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition active:scale-95 shadow-md shadow-primary/20">
            Get Started
          </Link>
        </div>

        <button className="md:hidden text-light" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </nav>

      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-16 left-0 right-0 z-40 bg-white shadow-lg border-b border-gray-100 px-6 py-4 flex flex-col gap-2 md:hidden"
        >
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-sm font-medium text-gray-600 hover:text-primary text-left py-2 border-b border-gray-50"
            >
              {link.label}
            </button>
          ))}
          <div className="flex gap-3 pt-2">
            <Link href="/login" className="flex-1 text-center py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-dark hover:border-primary transition">Sign In</Link>
            <Link href="/signup" className="flex-1 text-center py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition">Get Started</Link>
          </div>
        </motion.div>
      )}

      <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="animate-blob absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/8 blur-3xl" />
          <div className="animate-blob-delay1 absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-accent/6 blur-3xl" />
          <div className="animate-blob-delay2 absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full bg-primary/5 blur-2xl" />
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="relative inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-gray-200 rounded-full px-4 py-2 text-xs font-medium text-dark mb-6 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-green inline-block" />
          🌐 Global Social Learning Network
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="relative text-4xl md:text-6xl font-extrabold text-dark leading-tight mb-6 max-w-4xl"
        >
          Where Students & Skill Learners{" "}
          <span className="gradient-text">Connect, Build & Earn Together.</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="relative text-gray-500 text-base md:text-lg max-w-2xl mb-10 leading-relaxed"
        >
          Join global campus communities, master in-demand skills through peer project reviews, and get rewarded with reaction gifts and Scholar Coins as you learn.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="relative flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            href="/signup?track=academic"
            className="animate-glow bg-primary text-white font-bold px-7 py-3.5 rounded-xl hover:opacity-90 hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-primary/25 text-sm"
          >
            🎓 Join as Academic Scholar <FiArrowRight size={18} />
          </Link>
          <Link
            href="/signup?track=pro_skill"
            className="bg-dark text-white font-bold px-7 py-3.5 rounded-xl hover:bg-black hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-md text-sm"
          >
            🚀 Join as Pro Skill Scholar <FiArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div ref={addRef} className="reveal text-center mb-14">
            <h2 className="text-4xl font-extrabold text-dark mb-3">Built for Modern Scholars</h2>
            <p className="text-gray-400 max-w-xl mx-auto">One platform for academic excellence, hands-on skill reviews, and coin rewards worldwide.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div
                ref={addRef}
                key={f.title}
                className="card-3d reveal bg-light rounded-2xl p-6 border border-gray-100 hover:border-primary hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-default"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary transition-all duration-300">
                  <f.icon size={22} className="text-primary group-hover:text-white transition-all duration-300" />
                </div>
                <h3 className="font-bold text-dark text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="communities" className="py-24 px-6 bg-light">
        <div className="max-w-5xl mx-auto">
          <div ref={addRef} className="reveal text-center mb-14">
            <h2 className="text-4xl font-extrabold text-dark mb-3">Find Your Space</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Every scholar has a home on ScholarHub from university campus hubs to professional skill guilds.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {communities.map(c => (
              <div
                ref={addRef}
                key={c.name}
                onClick={() => handleCommunityClick(c.id)}
                className={`reveal border rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-2 transition-all duration-300 cursor-pointer ${c.color}`}
              >
                <p className={`flex justify-center mb-3 ${c.badge}`}>
                  {c.id === 'academic' ? <FiBookOpen size={32} /> : <FiLayers size={32} />}
                </p>
                <p className="font-extrabold text-dark text-lg mt-1">{c.name}</p>
                <p className="text-xs text-gray-500 mt-1 mb-5">{c.desc}</p>
                <span className={`text-xs font-bold px-5 py-2 rounded-full ${c.badge} border border-current bg-white/80 dark:bg-dark/80`}>
                  Explore Space →
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div ref={addRef} className="reveal text-center mb-14">
            <h2 className="text-4xl font-extrabold text-dark mb-3">How It Works</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Get started in three simple steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, idx) => (
              <div ref={addRef} key={s.number} className="reveal text-center group" style={{ animationDelay: `${idx * 0.15}s` }}>
                <div className="w-16 h-16 bg-dark text-white rounded-2xl flex items-center justify-center text-xl font-extrabold mx-auto mb-4 animate-float group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  {s.number}
                </div>
                <h3 className="font-bold text-dark text-lg mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="leaderboard" className="py-24 px-6 bg-light">
        <div className="max-w-3xl mx-auto">
          <div ref={addRef} className="reveal text-center mb-14">
            <h2 className="text-4xl font-extrabold text-dark mb-3">Top Scholars This Week</h2>
            <p className="text-gray-400 max-w-xl mx-auto">The most active students and skill creators rise to the top. Could you be next?</p>
          </div>
          <div ref={addRef} className="reveal flex flex-col gap-3">
            {scholarsLoading ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-4 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-xl flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-32 mb-2" />
                    <div className="h-2 bg-gray-100 rounded w-24" />
                  </div>
                  <div className="text-right">
                    <div className="h-3 bg-gray-200 rounded w-16 mb-1 ml-auto" />
                    <div className="h-2 bg-gray-100 rounded w-10 ml-auto" />
                  </div>
                </div>
              ))
            ) : topScholars.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">Leaderboard data coming soon. Be the first scholar!</p>
              </div>
            ) : (
              topScholars.map((s, i) => {
                const rankStr = i === 0 ? '1st' : i === 1 ? '2nd' : i === 2 ? '3rd' : `${i + 1}`
                const school = s.school || s.university || ''
                const name = s.name || s.username || 'Scholar'
                return (
                  <div key={s._id || i}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 hover:shadow-md hover:-translate-x-1 ${i === 0 ? 'bg-primary/5 border-primary/20' : 'bg-white border-gray-100'}`}
                  >
                    <span className="text-2xl w-8 text-center font-extrabold text-primary">{rankStr}</span>
                    <div className="flex-1">
                      <p className="font-bold text-dark text-sm">{name}</p>
                      {school && <p className="text-xs text-gray-400">{school}</p>}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </section>

      <section className="relative py-24 px-6 bg-dark overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="animate-blob absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div ref={addRef} className="reveal relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Ready to join the global movement?
          </h2>
          <p className="text-gray-400 mb-10 text-lg">
            Thousands of students and skill learners are building, connecting, and earning together on ScholarHub.
          </p>
          <Link
            href="/signup"
            className="animate-glow bg-primary text-white font-semibold px-10 py-4 rounded-xl hover:opacity-90 hover:scale-105 transition-all duration-300 inline-flex items-center gap-2 shadow-lg shadow-primary/30"
          >
            Get Started Free <FiArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="bg-dark border-t border-white/10 px-6 py-8 text-center">
        <h1 className="text-xl font-extrabold text-white mb-2">
          Scholar<span className="text-accent">Hub</span>
        </h1>
        <p className="text-gray-400 text-sm flex items-center justify-center gap-1">© 2026 ScholarHub. Global Social Learning Network. <FiGlobe size={14} className="inline" /></p>
      </footer>

    </div>
  )
}

export default Landing