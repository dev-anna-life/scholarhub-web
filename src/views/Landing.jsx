/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { FiArrowRight, FiUsers, FiBookOpen, FiAward, FiZap, FiMenu, FiX, FiGlobe } from "react-icons/fi"
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
  { icon: FiBookOpen, title: "Share Knowledge", desc: "Post study notes, past questions, exam tips and educational content for students across Africa." },
  { icon: FiUsers, title: "Join Communities", desc: "Connect with students at your level, Secondary or University. Find your tribe." },
  { icon: FiAward, title: "Earn & Grow", desc: "Get rewarded with coins for every approved post. Streak daily and earn even more." },
  { icon: FiZap, title: "Stay Updated", desc: "Get the latest on JAMB, WAEC, NECO, campus gist and education news across Africa." },
]

const steps = [
  { number: "01", title: "Create your account", desc: "Sign up with email, Google or phone number in seconds." },
  { number: "02", title: "Pick your interests", desc: "Tell us your level and what subjects you love. We personalise your feed." },
  { number: "03", title: "Post, engage & earn", desc: "Share content, get approved, earn coins and build your reputation." },
]

const communities = [
  { id: 'secondary', name: "Secondary School Hub", color: "bg-emerald-50 border-emerald-200", badge: "text-primary", desc: "Notes, gist & exam tips" },
  { id: 'university', name: "University Hub", color: "bg-blue-50 border-blue-200", badge: "text-blue-600", desc: "Lecture notes & campus life" },
]

const navLinks = [
  { label: "Home", id: "hero" },
  { label: "Features", id: "features" },
  { label: "Communities", id: "communities" },
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
    router.push(`/community/${id}`)
  } else {
    router.push('/signup')
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

      <section id="hero" className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-xs font-medium text-dark mb-6 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-green inline-block" />
          Africa's #1 Student Content Platform
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="text-5xl md:text-7xl font-extrabold text-dark leading-tight mb-6 max-w-3xl"
        >
          Learn. Share.{" "}
          <span className="text-primary">Earn.</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="text-gray-500 text-lg max-w-xl mb-10 leading-relaxed"
        >
          ScholarHub is where African students come to share knowledge, connect with their community and get rewarded for adding value.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <Link
            href="/signup"
            className="bg-primary text-white font-semibold px-8 py-4 rounded-xl hover:opacity-90 hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-primary/25"
          >
            Join ScholarHub Free <FiArrowRight size={18} />
          </Link>
          <Link
            href="/login"
            className="bg-white border border-gray-200 text-dark font-medium px-8 py-4 rounded-xl hover:border-primary hover:scale-105 transition-all duration-300"
          >
            Sign In
          </Link>
        </motion.div>
      </section>

      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div ref={addRef} className="reveal text-center mb-14">
            <h2 className="text-4xl font-extrabold text-dark mb-3">Everything a student needs</h2>
            <p className="text-gray-400 max-w-xl mx-auto">One platform for learning, connecting and earning, built for African students.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div
                ref={addRef}
                key={f.title}
                className="reveal bg-light rounded-2xl p-6 border border-gray-100 hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-default"
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
            <h2 className="text-4xl font-extrabold text-dark mb-3">Find your community</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Every student has a space on ScholarHub from Secondary to University.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {communities.map(c => (
              <div
                ref={addRef}
                key={c.name}
                onClick={() => handleCommunityClick(c.id)}
                className={`reveal border rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-2 transition-all duration-300 cursor-pointer ${c.color}`}
              >
                <p className={`text-2xl font-extrabold mb-1 ${c.id === 'sss' ? 'text-accent' : c.badge}`}>
                  {c.id === 'jss' ? <FiBookOpen size={24} /> : c.id === 'sss' ? <FiZap size={24} /> : <FiAward size={24} />}
                </p>
                <p className="font-semibold text-dark text-sm mt-1">{c.name}</p>
                <p className="text-xs text-gray-400 mt-1 mb-3">{c.desc}</p>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${c.badge} border ${c.color}`}>
                  Enter →
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div ref={addRef} className="reveal text-center mb-14">
            <h2 className="text-4xl font-extrabold text-dark mb-3">How it works</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Get started in three simple steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(s => (
              <div ref={addRef} key={s.number} className="reveal text-center group">
                <div className="w-16 h-16 bg-dark text-white rounded-2xl flex items-center justify-center text-xl font-extrabold mx-auto mb-4 animate-float group-hover:bg-primary transition-colors duration-300">
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
            <h2 className="text-4xl font-extrabold text-dark mb-3">Top Scholars this week</h2>
            <p className="text-gray-400 max-w-xl mx-auto">The most active students rise to the top. Could you be next?</p>
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
                const name = s.name || s.username || 'Student'
                return (
                  <div key={s._id || i}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 hover:shadow-md hover:-translate-x-1 ${i === 0 ? 'bg-primary/5 border-primary/20' : 'bg-white border-gray-100'}`}
                  >
                    <span className="text-2xl w-8 text-center">{rankStr}</span>
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

      <section className="py-24 px-6 bg-dark">
        <div ref={addRef} className="reveal max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Ready to join the movement?
          </h2>
          <p className="text-gray-400 mb-10 text-lg">
            Thousands of African students are already learning, sharing and earning on ScholarHub.
          </p>
          <Link
            href="/signup"
            className="bg-primary text-white font-semibold px-10 py-4 rounded-xl hover:opacity-90 hover:scale-105 transition-all duration-300 inline-flex items-center gap-2 shadow-lg shadow-primary/30"
          >
            Get Started Free <FiArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="bg-dark border-t border-white/10 px-6 py-8 text-center">
        <h1 className="text-xl font-extrabold text-white mb-2">
          Scholar<span className="text-accent">Hub</span>
        </h1>
        <p className="text-gray-400 text-sm flex items-center justify-center gap-1">© 2026 ScholarHub. Built for African students. <FiGlobe size={14} className="inline" /></p>
      </footer>

    </div>
  )
}

export default Landing