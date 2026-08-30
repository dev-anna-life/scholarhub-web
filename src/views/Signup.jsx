'use client'
/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiUser, FiPhone, FiArrowRight, FiEye, FiEyeOff, FiSearch, FiX, FiCheck, FiBookOpen, FiCode, FiZap, FiAward, FiGlobe, FiShield, FiRefreshCw } from "react-icons/fi";
import Link from "next/link"
import { useRouter } from "next/navigation";
import { signupUser, checkAvailability, sendOTP, verifyOTPAndSignup, searchSchools } from "../api/auth"
import { GoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../api/auth";
import { courses } from '../data/courses'
import { faculties, departmentsByFaculty, getSuggestedDepartment, getSuggestedFaculty } from '../data/faculties'
import { getCountryFromState } from '../data/schools'
import { resolveSchoolName } from '../data/schoolAliases'
import SchoolLogo from '../components/SchoolLogo'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: 30, transition: { duration: 0.3 } },
}

const levels = ['High School', 'University']

export const secondaryInterests = [
  'Global Social Studies & World Civics',
  'Earth & Climate Systems (Global Geography)',
  'World History & Global Cultures',
  'Global Languages & Linguistics',
  'World Economics & Global Trade',
  'Public Speaking & Keynote Debate',
  'Sciences & Physics',
  'Mathematics & Algebra',
  'Coding & Robotics',
  'English & World Literature',
  'Visual Arts & Media',
  'Computer ICT & Web Skills',
  'Sports & Athletics',
  'Music & Performing Arts',
  'Youth Entrepreneurship & Leadership',
]

export const universityInterests = [
  'Global Relations & International Diplomacy',
  'International Trade & Macroeconomics',
  'Earth & Climate Systems (Global Geography)',
  'World History & Geopolitics',
  'Global Languages & Cross-Cultural Linguistics',
  'Public Speaking & Executive Communication',
  'Executive Leadership & Organizational Management',
  'Computer Science & AI',
  'Software & Cloud Engineering',
  'UI/UX & Digital Product Design',
  'Data Science & Analytics',
  'Cybersecurity & Networks',
  'Medicine, Anatomy & Global Public Health',
  'Law & International Jurisprudence',
  'Electrical & Civil Engineering',
  'Business, Banking & Corporate Finance',
  'Entrepreneurship & Global Startups',
  'Creative Writing, Journalism & PR',
  'Film Production & Photography',
  'Digital Marketing & Growth',
  'Psychology & Human Behavior',
  'Architecture & Urban Planning',
  'Music Production & Sound Design',
  'Philosophy, Ethics & Politics',
]

const tracks = ['Science', 'Art', 'Commercial']

export const scholarTrackOptions = [
  { id: 'academic', title: 'Academic Scholar', icon: FiBookOpen, badge: 'High School / University', desc: 'Course notes, research citations & exam preparation' },
  { id: 'dual', title: 'Dual-Track Scholar', icon: FiZap, badge: 'University ONLY', desc: 'University degree + Skill Guild project reviews' },
  { id: 'pro_skill', title: 'Pro Skill Scholar', icon: FiCode, badge: 'Skill Guilds', desc: 'Practical projects, peer feedback & portfolio building (No School Required)' },
]

export const skillCategories = [
  'UI/UX & Product Design Studio',
  'Full-Stack Web Engineering (React, Node, Python, Next.js)',
  'Mobile App Development (React Native, Flutter, Swift, Kotlin)',
  'Artificial Intelligence & Machine Learning Engineering',
  'Data Science, Big Data & Analytics',
  'Cybersecurity & Ethical Hacking',
  'Cloud Computing & DevOps (AWS, Azure, Docker)',
  'Digital Marketing, SEO & Growth Hacking',
  'Content Creation, Copywriting & Storytelling',
  'Graphic Design, 3D & Brand Identity',
  'Video Editing, Motion Graphics & Animation',
  'Product Management & Agile Leadership',
  'Public Speaking & Keynote Presentation',
  'Executive Leadership & C-Suite Management',
  'Cross-Cultural Team Management & Virtual Leadership',
  'Strategic Business Negotiation & Conflict Resolution',
  'Corporate Storytelling & Executive Pitching',
  'Crisis Communication & Public Relations (PR)',
  'Interpersonal Communication & Emotional Intelligence (EQ)',
  'Talent Management, Coaching & Executive Mentorship',
  '3D Design, Game Development & AR/VR',
  'Financial Tech, Trading & Accounting Systems',
  'Environmental Science & Green Tech',
]

export const skillLevels = ['Foundation / Beginner', 'Builder / Intermediate', 'Advanced / Pro']

export const countryList = [
  // North America
  { name: 'United States', shortName: 'United States', code: '+1', flag: '🇺🇸', region: 'Americas' },
  { name: 'United Kingdom', shortName: 'United Kingdom (UK)', code: '+44', flag: '🇬🇧', region: 'Europe' },
  { name: 'Canada', shortName: 'Canada', code: '+1', flag: '🇨🇦', region: 'Americas' },
  { name: 'Australia', shortName: 'Australia', code: '+61', flag: '🇦🇺', region: 'Oceania' },
  { name: 'New Zealand', shortName: 'New Zealand', code: '+64', flag: '🇳🇿', region: 'Oceania' },
  
  // Europe
  { name: 'Germany', shortName: 'Germany', code: '+49', flag: '🇩🇪', region: 'Europe' },
  { name: 'France', shortName: 'France', code: '+33', flag: '🇫🇷', region: 'Europe' },
  { name: 'Italy', shortName: 'Italy', code: '+39', flag: '🇮🇹', region: 'Europe' },
  { name: 'Spain', shortName: 'Spain', code: '+34', flag: '🇪🇸', region: 'Europe' },
  { name: 'Netherlands', shortName: 'Netherlands', code: '+31', flag: '🇳🇱', region: 'Europe' },
  { name: 'Switzerland', shortName: 'Switzerland', code: '+41', flag: '🇨🇭', region: 'Europe' },
  { name: 'Sweden', shortName: 'Sweden', code: '+46', flag: '🇸🇪', region: 'Europe' },
  { name: 'Norway', shortName: 'Norway', code: '+47', flag: '🇳🇴', region: 'Europe' },
  { name: 'Denmark', shortName: 'Denmark', code: '+45', flag: '🇩🇰', region: 'Europe' },
  { name: 'Finland', shortName: 'Finland', code: '+358', flag: '🇫🇮', region: 'Europe' },
  { name: 'Ireland', shortName: 'Ireland', code: '+353', flag: '🇮🇪', region: 'Europe' },
  { name: 'Portugal', shortName: 'Portugal', code: '+351', flag: '🇵🇹', region: 'Europe' },
  { name: 'Poland', shortName: 'Poland', code: '+48', flag: '🇵🇱', region: 'Europe' },
  { name: 'Austria', shortName: 'Austria', code: '+43', flag: '🇦🇹', region: 'Europe' },
  { name: 'Belgium', shortName: 'Belgium', code: '+32', flag: '🇧🇪', region: 'Europe' },
  { name: 'Greece', shortName: 'Greece', code: '+30', flag: '🇬🇷', region: 'Europe' },

  // Asia & Pacific
  { name: 'India', shortName: 'India', code: '+91', flag: '🇮🇳', region: 'Asia' },
  { name: 'China', shortName: 'China', code: '+86', flag: '🇨🇳', region: 'Asia' },
  { name: 'Japan', shortName: 'Japan', code: '+81', flag: '🇯🇵', region: 'Asia' },
  { name: 'South Korea', shortName: 'South Korea', code: '+82', flag: '🇰🇷', region: 'Asia' },
  { name: 'Singapore', shortName: 'Singapore', code: '+65', flag: '🇸🇬', region: 'Asia' },
  { name: 'Malaysia', shortName: 'Malaysia', code: '+60', flag: '🇲🇾', region: 'Asia' },
  { name: 'Indonesia', shortName: 'Indonesia', code: '+62', flag: '🇮🇩', region: 'Asia' },
  { name: 'Philippines', shortName: 'Philippines', code: '+63', flag: '🇵🇭', region: 'Asia' },
  { name: 'Thailand', shortName: 'Thailand', code: '+66', flag: '🇹🇭', region: 'Asia' },
  { name: 'Vietnam', shortName: 'Vietnam', code: '+84', flag: '🇻🇳', region: 'Asia' },
  { name: 'Pakistan', shortName: 'Pakistan', code: '+92', flag: '🇵🇰', region: 'Asia' },
  { name: 'Bangladesh', shortName: 'Bangladesh', code: '+880', flag: '🇧🇩', region: 'Asia' },

  // Middle East
  { name: 'United Arab Emirates', shortName: 'UAE', code: '+971', flag: '🇦🇪', region: 'Middle East' },
  { name: 'Saudi Arabia', shortName: 'Saudi Arabia', code: '+966', flag: '🇸🇦', region: 'Middle East' },
  { name: 'Qatar', shortName: 'Qatar', code: '+974', flag: '🇶🇦', region: 'Middle East' },
  { name: 'Kuwait', shortName: 'Kuwait', code: '+965', flag: '🇰🇼', region: 'Middle East' },
  { name: 'Oman', shortName: 'Oman', code: '+968', flag: '🇴🇲', region: 'Middle East' },
  { name: 'Bahrain', shortName: 'Bahrain', code: '+973', flag: '🇧🇭', region: 'Middle East' },
  { name: 'Turkey', shortName: 'Turkey', code: '+90', flag: '🇹🇷', region: 'Middle East' },
  { name: 'Israel', shortName: 'Israel', code: '+972', flag: '🇮🇱', region: 'Middle East' },

  // Latin America
  { name: 'Brazil', shortName: 'Brazil', code: '+55', flag: '🇧🇷', region: 'Americas' },
  { name: 'Mexico', shortName: 'Mexico', code: '+52', flag: '🇲🇽', region: 'Americas' },
  { name: 'Argentina', shortName: 'Argentina', code: '+54', flag: '🇦🇷', region: 'Americas' },
  { name: 'Colombia', shortName: 'Colombia', code: '+57', flag: '🇨🇴', region: 'Americas' },
  { name: 'Chile', shortName: 'Chile', code: '+56', flag: '🇨🇱', region: 'Americas' },
  { name: 'Peru', shortName: 'Peru', code: '+51', flag: '🇵🇪', region: 'Americas' },

  // Africa
  { name: 'Nigeria', shortName: 'Nigeria', code: '+234', flag: '🇳🇬', region: 'Africa' },
  { name: 'Ghana', shortName: 'Ghana', code: '+233', flag: '🇬🇭', region: 'Africa' },
  { name: 'Kenya', shortName: 'Kenya', code: '+254', flag: '🇰🇪', region: 'Africa' },
  { name: 'South Africa', shortName: 'South Africa', code: '+27', flag: '🇿🇦', region: 'Africa' },
  { name: 'Egypt', shortName: 'Egypt', code: '+20', flag: '🇪🇬', region: 'Africa' },
  { name: 'Morocco', shortName: 'Morocco', code: '+212', flag: '🇲🇦', region: 'Africa' },
  { name: 'Algeria', shortName: 'Algeria', code: '+213', flag: '🇩🇿', region: 'Africa' },
  { name: 'Ethiopia', shortName: 'Ethiopia', code: '+251', flag: '🇪🇹', region: 'Africa' },
  { name: 'Uganda', shortName: 'Uganda', code: '+256', flag: '🇺🇬', region: 'Africa' },
  { name: 'Rwanda', shortName: 'Rwanda', code: '+250', flag: '🇷🇼', region: 'Africa' },
  { name: 'Tanzania', shortName: 'Tanzania', code: '+255', flag: '🇹🇿', region: 'Africa' },
  { name: 'Senegal', shortName: 'Senegal', code: '+221', flag: '🇸🇳', region: 'Africa' },
  { name: 'Cameroon', shortName: 'Cameroon', code: '+237', flag: '🇨🇲', region: 'Africa' },
]

function CountrySelect({ value, onChange, error }) {
  const [query, setQuery] = useState(value || '')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selected, setSelected] = useState(!!value)
  const wrapperRef = useRef(null)

  useEffect(() => {
    setQuery(value || '')
    setSelected(!!value)
  }, [value])

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = query
    ? countryList.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.code.includes(query))
    : countryList

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Country</label>
      <div className="relative">
        <FiGlobe className="absolute left-3 top-3.5 text-gray-400" size={16} />
        <input type="text" value={query}
          onChange={e => { setQuery(e.target.value); setSelected(false); onChange(e.target.value) }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Select or search country..."
          className={`input-field !pl-9 !pr-9 ${error ? 'border-red-400' : selected ? 'border-primary' : ''}`} />
        {query && (
          <button type="button" onClick={() => { setQuery(''); setSelected(false); onChange(''); }} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
            <FiX size={15} />
          </button>
        )}
      </div>
      {showDropdown && (
        <div className="absolute z-50 bottom-full mb-1 w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="p-3 text-sm text-gray-400 text-center">Type your country name</p>
          ) : filtered.map((c, i) => (
            <button key={i} type="button"
              onClick={() => { setQuery(c.name); setSelected(true); setShowDropdown(false); onChange(c.name) }}
              className="w-full text-left px-3 py-2.5 text-sm text-dark dark:text-white hover:bg-primary/5 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>{c.flag}</span>
                <span>{c.shortName || c.name}</span>
              </span>
              <span className="text-xs text-gray-400 font-mono font-semibold">{c.code}</span>
            </button>
          ))}
        </div>
      )}
      {selected && <p className="text-primary text-xs mt-1"><FiCheck size={10} className="inline mr-0.5" />Selected</p>}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function StateSelect({ value, onChange, error, country, level }) {
  const [query, setQuery] = useState(value || '')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selected, setSelected] = useState(!!value)
  const [states, setStates] = useState([])
  const wrapperRef = useRef(null)

  useEffect(() => {
    setQuery(value || '')
    setSelected(!!value)
  }, [value])

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!country) { setStates([]); return }
    const lvlKey = (level || 'University').toLowerCase() === 'high school' ? 'secondary' : 'university'
    searchSchools(country, lvlKey, '', '')
      .then(res => {
        const schoolList = res.data?.schools || []
        const uniqueStates = [...new Set(schoolList.map(s => s.state).filter(Boolean))].sort()
        setStates(uniqueStates)
      })
      .catch(() => setStates([]))
  }, [country, level])

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">State / Region</label>
      <div className="relative">
        <FiSearch className="absolute left-3 top-3.5 text-gray-400" size={16} />
        <input type="text" value={query}
          onChange={e => { setQuery(e.target.value); setSelected(false); onChange(e.target.value) }}
          onFocus={() => setShowDropdown(true)}
          placeholder="State or region (e.g. California, London, New York)"
          className={`input-field !pl-9 !pr-9 ${error ? 'border-red-400' : selected ? 'border-primary' : ''}`} />
      </div>
      {showDropdown && states.length > 0 && (
        <div className="absolute z-50 bottom-full mb-1 w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden max-h-40 overflow-y-auto">
          {states.filter(s => s.toLowerCase().includes(query.toLowerCase())).map((s, i) => (
            <button key={i} type="button"
              onClick={() => { setQuery(s); setSelected(true); setShowDropdown(false); onChange(s) }}
              className="w-full text-left px-3 py-2 text-sm text-dark dark:text-white hover:bg-primary/5">
              {s}
            </button>
          ))}
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function SchoolSearchInput({ value, onChange, error, currentLevel, country, state }) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    setQuery(value || '')
  }, [value])

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!country) { setSuggestions([]); setShowDropdown(false); return }

    const lvlKey = (currentLevel || 'University').toLowerCase() === 'high school' ? 'secondary' : 'university'

    timerRef.current = setTimeout(async () => {
      let fetched = []
      try {
        const { data } = await searchSchools(country, lvlKey, query, state)
        fetched = data.schools || []
      } catch { fetched = [] }

      const acronymMatch = resolveSchoolName(query, country)
      const list = [...fetched]

      if (query && acronymMatch && acronymMatch.toLowerCase() !== query.toLowerCase()) {
        const existingIdx = list.findIndex(s => s.name.toLowerCase() === acronymMatch.toLowerCase())
        if (existingIdx !== -1) list.splice(existingIdx, 1)
        list.unshift({ name: acronymMatch, isAcronymMatch: true })
      }

      setSuggestions(list)
    }, 200)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query, currentLevel, country, state])

  const handleBlur = () => {
    if (query) {
      const resolved = resolveSchoolName(query, country)
      setQuery(resolved)
      onChange(resolved)
    }
  }

  const handleSelect = (schoolName) => {
    const resolved = resolveSchoolName(schoolName, country)
    setQuery(resolved)
    onChange(resolved)
    setShowDropdown(false)
  }

  const liveAcronymMatch = query ? resolveSchoolName(query, country) : null
  const showLiveAcronymBanner = liveAcronymMatch && liveAcronymMatch.toLowerCase() !== query.toLowerCase()

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 flex items-center justify-between">
        <span>{currentLevel === 'High School' ? 'High School Name' : 'University / Institution Name'}</span>
        {showLiveAcronymBanner && (
          <span className="text-[10px] font-bold text-primary animate-pulse">⚡ Acronym Recognized</span>
        )}
      </label>
      <div className="relative">
        <FiSearch className="absolute left-3 top-3.5 text-gray-400" size={16} />
        <input ref={inputRef} type="text" value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setShowDropdown(true) }}
          onBlur={handleBlur}
          onFocus={() => setShowDropdown(true)}
          placeholder={currentLevel === 'High School' ? 'Type High School name or acronym...' : 'Type University name (e.g. Harvard, Oxford, MIT, Stanford)...'}
          className={`input-field !pl-9 !pr-9 ${error ? 'border-red-400' : showLiveAcronymBanner ? 'border-primary ring-1 ring-primary/30' : ''}`}
          autoComplete="off" />
        {query && (
          <button type="button" onClick={() => { setQuery(''); onChange(''); setSuggestions([]); }} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
            <FiX size={15} />
          </button>
        )}
      </div>

      {showDropdown && (suggestions.length > 0 || showLiveAcronymBanner) && (
        <div className="absolute z-50 bottom-full mb-1 w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
          {showLiveAcronymBanner && (
            <button type="button" onClick={() => handleSelect(liveAcronymMatch)}
              className="w-full text-left p-3 bg-primary/10 hover:bg-primary/20 border-b border-primary/20 transition-all flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0">⚡</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-primary truncate">{liveAcronymMatch}</p>
                <p className="text-[10px] text-gray-500 font-semibold">Matched from "{query.toUpperCase()}"</p>
              </div>
            </button>
          )}

          {suggestions.filter(s => !showLiveAcronymBanner || s.name !== liveAcronymMatch).map((s, idx) => (
            <button key={idx} type="button" onClick={() => handleSelect(s.name)}
              className="w-full text-left px-3 py-2.5 text-xs text-dark dark:text-white hover:bg-primary/5 flex items-center gap-2 border-b border-gray-100 dark:border-zinc-700/50 last:border-0">
              <SchoolLogo school={s.name} size={18} />
              <span className="font-medium truncate">{s.name}</span>
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function Signup() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(countryList[0])
  const [rawPhone, setRawPhone] = useState('')

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    scholarTrack: 'academic',
    level: 'University',
    country: 'United States',
    state: '',
    school: '',
    course: '',
    track: 'Science',
    faculty: '',
    department: '',
    skillDomain: skillCategories[0],
    skillLevel: skillLevels[1],
    interests: [],
  })

  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [otpTimer, setOtpTimer] = useState(60)
  const [canResendOtp, setCanResendOtp] = useState(false)
  const otpInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)]

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [usernameStatus, setUsernameStatus] = useState({ state: '', msg: '' })
  const [emailStatus, setEmailStatus] = useState({ state: '', msg: '' })
  const [phoneStatus, setPhoneStatus] = useState({ state: '', msg: '' })

  useEffect(() => {
    let interval = null
    if (step === 2 && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000)
    } else if (otpTimer === 0) {
      setCanResendOtp(true)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [step, otpTimer])

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-gray-200' }
    let score = 0
    if (pass.length >= 8) score += 1
    if (/[A-Z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass)) score += 1

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-red-500' }
    if (score === 2) return { score: 50, label: 'Medium', color: 'bg-amber-500' }
    if (score === 3) return { score: 75, label: 'Strong', color: 'bg-blue-500' }
    return { score: 100, label: 'Secure & Strong', color: 'bg-emerald-500' }
  }

  const passStrength = getPasswordStrength(form.password)

  const usernameTimerRef = useRef(null)
  useEffect(() => {
    if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current)
    const u = form.username.trim()
    if (!u) { setUsernameStatus({ state: '', msg: '' }); return }
    if (u.length < 5) {
      setUsernameStatus({ state: 'error', msg: 'Username must be at least 5 characters' })
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(u)) {
      setUsernameStatus({ state: 'error', msg: 'Only letters, numbers and underscores allowed' })
      return
    }

    setUsernameStatus({ state: 'checking', msg: 'Checking availability...' })
    usernameTimerRef.current = setTimeout(async () => {
      try {
        const { data } = await checkAvailability({ username: u })
        if (data.available) {
          setUsernameStatus({ state: 'available', msg: 'Username available' })
          setErrors(prev => ({ ...prev, username: '' }))
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Username unavailable'
        setUsernameStatus({ state: 'taken', msg })
        setErrors(prev => ({ ...prev, username: msg }))
      }
    }, 350)
    return () => { if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current) }
  }, [form.username])

  const handleEmailBlur = async () => {
    const email = form.email.trim()
    if (!email || !/\S+@\S+\.\S+/.test(email)) return
    try {
      await checkAvailability({ email })
      setEmailStatus({ state: 'available', msg: '' })
      setErrors(prev => ({ ...prev, email: '' }))
    } catch (err) {
      const msg = err.response?.data?.message || 'This email address is already registered.'
      setEmailStatus({ state: 'taken', msg })
      setErrors(prev => ({ ...prev, email: msg }))
    }
  }

  const handlePhoneBlur = async () => {
    const phone = form.phone.trim()
    if (!phone) return
    try {
      await checkAvailability({ phone })
      setPhoneStatus({ state: 'available', msg: '' })
      setErrors(prev => ({ ...prev, phone: '' }))
    } catch (err) {
      const msg = err.response?.data?.message || 'This phone number is already registered.'
      setPhoneStatus({ state: 'taken', msg })
      setErrors(prev => ({ ...prev, phone: msg }))
    }
  }

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const toggleInterest = (item) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(item)
        ? prev.interests.filter(i => i !== item)
        : [...prev.interests, item]
    }))
  }

  const validateStep1 = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Full Name is required'
    if (!form.username.trim()) newErrors.username = 'Username is required'
    else if (form.username.trim().length < 5) newErrors.username = 'Username must be at least 5 characters'
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username.trim())) newErrors.username = 'Username can only contain letters, numbers, and underscores'
    
    if (!form.email.trim()) newErrors.email = 'Email address is required'
    else if (!/\S+@\S+\.\S+/.test(form.email.trim())) newErrors.email = 'Please enter a valid email address'
    
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required'
    
    if (!form.password.trim()) newErrors.password = 'Password is required'
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0 && usernameStatus.state !== 'taken' && emailStatus.state !== 'taken' && phoneStatus.state !== 'taken'
  }

  const handleRequestOTP = async () => {
    if (!validateStep1()) return
    setLoading(true)
    setError('')
    try {
      const res = await sendOTP({ email: form.email, phone: form.phone })
      setStep(2)
      setOtpTimer(60)
      setCanResendOtp(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code. Please check your email/phone and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpBoxChange = (index, val) => {
    if (!/^[0-9]?$/.test(val)) return
    const newArr = [...otpCode]
    newArr[index] = val
    setOtpCode(newArr)

    if (val && index < 5) {
      otpInputRefs[index + 1].current?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus()
    }
  }

  const handleVerifyOTP = async () => {
    const fullCode = otpCode.join('')
    if (fullCode.length < 6) {
      setError('Please enter the complete 6-digit verification code')
      return
    }
    setLoading(true)
    setError('')
    try {
      const finalSchool = resolveSchoolName(form.school, form.country)
      const res = await verifyOTPAndSignup({
        ...form,
        otp: fullCode,
        school: finalSchool,
        level: form.scholarTrack === 'pro_skill' ? 'Pro Skill' : form.scholarTrack === 'dual' ? 'University' : form.level,
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      window.dispatchEvent(new Event('userStateChange'))
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired verification code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const validateStep3 = () => {
    const newErrors = {}
    if (form.scholarTrack === 'pro_skill') {
      if (!form.skillDomain) newErrors.skillDomain = 'Please select your primary skill domain'
    } else if (form.scholarTrack === 'dual') {
      if (!form.country) newErrors.country = 'Country is required'
      if (!form.state.trim()) newErrors.state = 'State / Region is required'
      if (!form.school.trim()) newErrors.school = 'University name is required'
      if (!form.skillDomain) newErrors.skillDomain = 'Please select your primary skill guild'
    } else {
      if (!form.level) newErrors.level = 'Please select High School or University'
      if (!form.country) newErrors.country = 'Country is required'
      if (!form.state.trim()) newErrors.state = 'State / Region is required'
      if (!form.school.trim()) newErrors.school = 'School name is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFinishSignup = () => {
    router.push('/feed')
  }

  return (
    <div className="min-h-screen bg-light dark:bg-zinc-900 flex items-center justify-center p-4 py-8">
      <motion.div className="w-full max-w-lg bg-white dark:bg-zinc-800 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-700/60 p-6 sm:p-8 overflow-hidden"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}>
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-dark dark:text-white tracking-tight">
            Scholar<span className="gradient-text">Hub</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-semibold">Global Social Learning Network</p>
        </div>

        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-gray-200 dark:bg-zinc-700'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* STEP 1: ACCOUNT REGISTRATION FORM */}
          {step === 1 && (
            <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-xl font-bold text-dark dark:text-white mb-1">Create Your Account</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Join thousands of students and skill learners globally</p>

              <div id="google-login-wrapper" className="w-full mb-4 overflow-hidden flex justify-center">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    try {
                      setError('')
                      const res = await googleAuth(credentialResponse.credential)
                      localStorage.setItem('token', res.data.token)
                      localStorage.setItem('user', JSON.stringify(res.data.user))
                      window.dispatchEvent(new Event('userStateChange'))
                      if (res.data.isNewUser) {
                        router.push('/onboarding')
                      } else {
                        router.push('/feed')
                      }
                    } catch (err) {
                      setError(err.response?.data?.message || 'Google login failed.')
                    }
                  }}
                  onError={() => setError('Google sign-in failed. Please try email/password.')}
                  width="350" text="continue_with" shape="rectangular" theme="outline" useOneTap={false} />
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <FiUser className="absolute left-3 top-3.5 text-gray-400" size={16} />
                  <input name="name" type="text" placeholder="Full Name" value={form.name} onChange={handleChange} className={`input-field ${errors.name ? 'border-red-400' : ''}`} />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-gray-400 font-bold text-xs">@</span>
                  <input name="username" type="text" placeholder="Choose Username (min 5 chars, e.g. alex_scholar)" value={form.username} onChange={handleChange} className={`input-field !pl-8 ${usernameStatus.state === 'taken' || errors.username ? 'border-red-400' : usernameStatus.state === 'available' ? 'border-emerald-500' : ''}`} />
                  {usernameStatus.state === 'available' && <p className="text-emerald-600 text-xs font-semibold mt-1 flex items-center gap-1"><FiCheck size={12} /> {usernameStatus.msg}</p>}
                  {usernameStatus.state === 'taken' && <p className="text-red-500 text-xs font-semibold mt-1">❌ {usernameStatus.msg}</p>}
                  {usernameStatus.state === 'error' && <p className="text-red-500 text-xs mt-1">{usernameStatus.msg}</p>}
                  {usernameStatus.state === 'checking' && <p className="text-gray-400 text-xs mt-1 animate-pulse">Checking availability...</p>}
                </div>

                <div className="relative">
                  <FiMail className="absolute left-3 top-3.5 text-gray-400" size={16} />
                  <input id="signup-email" name="email" type="email" autoComplete="email" placeholder="Email Address" value={form.email} onChange={handleChange} onBlur={handleEmailBlur} className={`input-field ${errors.email || emailStatus.state === 'taken' ? 'border-red-400' : ''}`} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <div className="flex gap-2">
                    <div className="relative w-44 flex-shrink-0">
                      <select
                        value={selectedCountry.name}
                        onChange={e => {
                          const c = countryList.find(item => item.name === e.target.value) || countryList[0]
                          setSelectedCountry(c)
                          setForm(prev => ({
                            ...prev,
                            country: c.name,
                            phone: rawPhone.trim() ? `${c.code} ${rawPhone.trim()}` : ''
                          }))
                        }}
                        className="w-full h-full py-3 px-2 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:border-primary focus:outline-none cursor-pointer"
                      >
                        {countryList.map((c, i) => (
                          <option key={i} value={c.name} className="bg-white dark:bg-zinc-800 text-gray-900 dark:text-white">
                            {c.shortName || c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="relative flex-1">
                      <FiPhone className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" size={16} />
                      <input
                        id="signup-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel-national"
                        placeholder="Phone Number"
                        value={rawPhone}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, '')
                          setRawPhone(val)
                          setForm(prev => ({
                            ...prev,
                            phone: val.trim() ? `${selectedCountry.code} ${val.trim()}` : ''
                          }))
                        }}
                        onBlur={handlePhoneBlur}
                        className={`input-field !pl-9 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white font-medium ${errors.phone || phoneStatus.state === 'taken' ? 'border-red-400' : ''}`}
                      />
                    </div>
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div className="relative">
                  <FiLock className="absolute left-3 top-3.5 text-gray-400" size={16} />
                  <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password (min 8 characters)"
                    value={form.password} onChange={handleChange} className={`input-field ${errors.password ? 'border-red-400' : ''}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-primary transition">
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  
                  {form.password && (
                    <div className="mt-2">
                      <div className="h-1.5 w-full bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div className={`h-full ${passStrength.color} transition-all duration-300`} style={{ width: `${passStrength.score}%` }} />
                      </div>
                      <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1 flex justify-between">
                        <span>Password Strength:</span>
                        <span className="font-extrabold text-primary">{passStrength.label}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {error && <p className="text-red-500 text-xs mt-3 text-center">{error}</p>}

              <button onClick={handleRequestOTP} disabled={loading} className="btn-primary mt-6 flex items-center justify-center gap-2">
                {loading ? 'Sending Verification Code...' : <>Get Verification Code <FiArrowRight size={16} /></>}
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">
                Already have an account? <Link href="/login" className="text-primary font-bold">Sign in</Link>
              </p>
            </motion.div>
          )}

          {/* STEP 2: MANDATORY 6-DIGIT OTP VERIFICATION SCREEN */}
          {step === 2 && (
            <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <FiShield size={28} />
              </div>
              <h2 className="text-xl font-bold text-dark dark:text-white mb-1">Verify Security Code</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                We sent a 6-digit verification code to <strong className="text-dark dark:text-white">{form.email}</strong>
              </p>

              <div className="flex justify-center gap-2 mb-6">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={otpInputRefs[idx]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpBoxChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-extrabold bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 rounded-xl focus:border-primary focus:outline-none transition-all text-dark dark:text-white"
                  />
                ))}
              </div>

              {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

              <button onClick={handleVerifyOTP} disabled={loading || otpCode.join('').length < 6}
                className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? 'Verifying Code...' : <>Confirm & Continue <FiArrowRight size={16} /></>}
              </button>

              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <button type="button" onClick={() => setStep(1)} className="hover:text-primary font-semibold">Change Details</button>
                {canResendOtp ? (
                  <button type="button" onClick={handleRequestOTP} className="text-primary font-bold hover:underline flex items-center gap-1">
                    <FiRefreshCw size={12} /> Resend Code
                  </button>
                ) : (
                  <span className="text-gray-400 font-mono">Resend code in {otpTimer}s</span>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 3: SCHOLAR TRACK SELECTION */}
          {step === 3 && (
            <motion.div key="step3" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-xl font-bold text-dark dark:text-white mb-1">Choose Your Scholar Track</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Select how you want to learn, build and connect</p>

              <div className="space-y-2 mb-5">
                {scholarTrackOptions.map(t => {
                  const Icon = t.icon
                  const isSelected = form.scholarTrack === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setForm(prev => ({
                        ...prev,
                        scholarTrack: t.id,
                        level: t.id === 'dual' ? 'University' : prev.level === 'Secondary' ? 'High School' : prev.level
                      }))}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${isSelected ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/30' : 'border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-primary/50'}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300'}`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-dark dark:text-white truncate">{t.title}</p>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-zinc-700 text-gray-500'}`}>
                            {t.badge}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{t.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {form.scholarTrack === 'academic' && (
                <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-zinc-700">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Education Level</label>
                    <div className="grid grid-cols-2 gap-2">
                      {levels.map(lvl => (
                        <button key={lvl} type="button" onClick={() => setForm(prev => ({ ...prev, level: lvl }))}
                          className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${form.level === lvl ? 'bg-primary text-white border-primary shadow-xs' : 'border-gray-200 dark:border-zinc-700 text-dark dark:text-white hover:border-primary'}`}>
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <CountrySelect value={form.country} error={errors.country} onChange={(val) => setForm(prev => ({ ...prev, country: val, state: '', school: '' }))} />
                  <StateSelect value={form.state} error={errors.state} country={form.country} level={form.level} onChange={(val) => setForm(prev => ({ ...prev, state: val, school: '' }))} />
                  <SchoolSearchInput value={form.school} currentLevel={form.level} country={form.country} state={form.state} onChange={(val) => setForm(prev => ({ ...prev, school: val }))} error={errors.school} />
                </div>
              )}

              {form.scholarTrack === 'dual' && (
                <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-zinc-700">
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <FiZap size={16} className="flex-shrink-0 text-emerald-600" />
                    <span>Dual-Track is locked to <strong>University Students</strong> to balance degree studies with practical Skill Guilds!</span>
                  </div>

                  <CountrySelect value={form.country} error={errors.country} onChange={(val) => setForm(prev => ({ ...prev, country: val, state: '', school: '' }))} />
                  <StateSelect value={form.state} error={errors.state} country={form.country} level="University" onChange={(val) => setForm(prev => ({ ...prev, state: val, school: '' }))} />
                  <SchoolSearchInput value={form.school} currentLevel="University" country={form.country} state={form.state} onChange={(val) => setForm(prev => ({ ...prev, school: val }))} error={errors.school} />

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Primary Skill Guild</label>
                    <select
                      value={form.skillDomain}
                      onChange={e => setForm(prev => ({ ...prev, skillDomain: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-dark dark:text-white text-xs font-bold"
                    >
                      {skillCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {form.scholarTrack === 'pro_skill' && (
                <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-zinc-700">
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
                    <FiCode size={16} className="flex-shrink-0 text-blue-600" />
                    <span>No school or university required! Focus purely on practical skills, projects, and peer reviews.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Select Primary Skill Domain</label>
                    <select value={form.skillDomain} onChange={e => setForm(prev => ({ ...prev, skillDomain: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-dark dark:text-white">
                      {skillCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={() => { if (validateStep3()) setStep(4) }} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  Continue <FiArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: TOPIC INTERESTS */}
          {step === 4 && (
            <motion.div key="step4" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-xl font-bold text-dark dark:text-white mb-1">Pick Your Favorite Topics</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Choose interests to personalize your live home feed</p>

              <div className="flex flex-wrap gap-2 mb-6 max-h-60 overflow-y-auto p-1.5 border border-gray-100 dark:border-zinc-700/60 rounded-2xl">
                {(form.level === 'High School' ? secondaryInterests : universityInterests).map(item => {
                  const isSelected = form.interests.includes(item)
                  return (
                    <motion.button key={item} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${isSelected ? 'bg-primary text-white border-primary shadow-xs' : 'bg-gray-50 dark:bg-zinc-800 text-dark dark:text-white border-gray-200 dark:border-zinc-700 hover:border-primary'}`}>
                      {item}
                    </motion.button>
                  )
                })}
              </div>

              <button onClick={handleFinishSignup} className="btn-primary flex items-center justify-center gap-2">
                Enter ScholarHub Feed <FiArrowRight size={16} />
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default Signup