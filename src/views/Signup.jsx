'use client'
/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiUser, FiPhone, FiArrowRight, FiEye, FiEyeOff, FiSearch, FiX, FiCheck, FiBookOpen, FiCode, FiZap, FiAward, FiGlobe, FiLayers } from "react-icons/fi";
import Link from "next/link"
import { useRouter } from "next/navigation";
import { signupUser, updateSchool, searchSchools, requestSchool, checkUsername } from "../api/auth"
import { GoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../api/auth";
import { courses } from '../data/courses'
import { faculties, departmentsByFaculty, getSuggestedDepartment, getSuggestedFaculty } from '../data/faculties'
import { getCountryFromState, getSchoolLogo } from '../data/schools'
import { resolveSchoolName } from '../data/schoolAliases'
import SchoolLogo from '../components/SchoolLogo'
import SchoolBadge from '../components/SchoolBadge'
import { getClientGeo } from '../utils/geo'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: 30, transition: { duration: 0.3 } },
}

const levels = ['High School', 'University']
const secondaryInterests = ['Sciences', 'Mathematics', 'English & Literature', 'Arts & Creativity', 'Commerce / Business', 'Technology / ICT', 'History & Government', 'Sports']
const universityInterests = ['Science', 'Mathematics', 'Law', 'Medicine', 'Technology', 'Arts & Lit', 'Commerce', 'History', 'Entertainment']
const tracks = ['Science', 'Art', 'Commercial']

export const scholarTrackOptions = [
  { id: 'academic', title: 'Academic Scholar', icon: FiBookOpen, badge: 'High School / University', desc: 'Course notes, research citations & exam preparation' },
  { id: 'dual', title: 'Dual-Track Scholar', icon: FiZap, badge: 'University ONLY', desc: 'University degree + Skill Guild project reviews' },
  { id: 'pro_skill', title: 'Pro Skill Scholar', icon: FiCode, badge: 'Skill Guilds', desc: 'Practical projects, peer feedback & portfolio building (No School Required)' },
]

export const skillCategories = [
  'UI/UX Design Studio',
  'Web & Software Engineering',
  'Mobile App Development',
  'Data Science & AI/ML',
  'Digital Marketing & Content Growth',
  'Graphic Design & Branding',
  'Video Editing & Motion Graphics',
  'Product & Project Management',
]

export const skillLevels = ['Foundation / Beginner', 'Builder / Intermediate', 'Advanced / Pro']

export const countryList = [
  { name: 'Nigeria', code: '+234', flag: '🇳🇬', region: 'Africa' },
  { name: 'United States', code: '+1', flag: '🇺🇸', region: 'Americas' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧', region: 'Europe' },
  { name: 'Canada', code: '+1', flag: '🇨🇦', region: 'Americas' },
  { name: 'Ghana', code: '+233', flag: '🇬🇭', region: 'Africa' },
  { name: 'Kenya', code: '+254', flag: '🇰🇪', region: 'Africa' },
  { name: 'South Africa', code: '+27', flag: '🇿🇦', region: 'Africa' },
  { name: 'Uganda', code: '+256', flag: '🇺🇬', region: 'Africa' },
  { name: 'Rwanda', code: '+250', flag: '🇷🇼', region: 'Africa' },
  { name: 'Cameroon', code: '+237', flag: '🇨🇲', region: 'Africa' },
  { name: 'Tanzania', code: '+255', flag: '🇹🇿', region: 'Africa' },
  { name: 'Senegal', code: '+221', flag: '🇸🇳', region: 'Africa' },
  { name: 'Egypt', code: '+20', flag: '🇪🇬', region: 'Africa' },
  { name: 'Germany', code: '+49', flag: '🇩🇪', region: 'Europe' },
  { name: 'France', code: '+33', flag: '🇫🇷', region: 'Europe' },
  { name: 'India', code: '+91', flag: '🇮🇳', region: 'Asia' },
  { name: 'Australia', code: '+61', flag: '🇦🇺', region: 'Oceania' },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪', region: 'Middle East' },
  { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦', region: 'Middle East' },
  { name: 'China', code: '+86', flag: '🇨🇳', region: 'Asia' },
  { name: 'Brazil', code: '+55', flag: '🇧🇷', region: 'Americas' },
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
                <span>{c.name}</span>
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
          placeholder="State or region (e.g. Lagos, California, London)"
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
      try {
        const { data } = await searchSchools(country, lvlKey, query, state)
        setSuggestions(data.schools || [])
      } catch { setSuggestions([]) }
    }, 250)

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

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
        {currentLevel === 'High School' ? 'High School Name' : 'University / Institution Name'}
      </label>
      <div className="relative">
        <FiSearch className="absolute left-3 top-3.5 text-gray-400" size={16} />
        <input ref={inputRef} type="text" value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setShowDropdown(true) }}
          onBlur={handleBlur}
          onFocus={() => setShowDropdown(true)}
          placeholder={currentLevel === 'High School' ? 'Type High School name or acronym...' : 'Type University name or acronym (e.g. ESUT, MIT, Oxford)...'}
          className={`input-field !pl-9 !pr-9 ${error ? 'border-red-400' : ''}`}
          autoComplete="off" />
        {query && (
          <button type="button" onClick={() => { setQuery(''); onChange(''); setSuggestions([]); }} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
            <FiX size={15} />
          </button>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 bottom-full mb-1 w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
          {suggestions.map((s, idx) => (
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
    scholarTrack: 'academic', // 'academic' | 'dual' | 'pro_skill'
    level: 'University', // 'High School' | 'University'
    country: 'Nigeria',
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

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [facultyQuery, setFacultyQuery] = useState('')
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false)
  const [deptQuery, setDeptQuery] = useState('')
  const [showDeptDropdown, setShowDeptDropdown] = useState(false)

  const [usernameStatus, setUsernameStatus] = useState({ state: '', msg: '' })

  const facultyRef = useRef(null)
  const deptRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      const trackParam = searchParams.get('track')
      if (trackParam === 'pro_skill' || trackParam === 'skills') {
        setForm(prev => ({ ...prev, scholarTrack: 'pro_skill' }))
      } else if (trackParam === 'dual') {
        setForm(prev => ({ ...prev, scholarTrack: 'dual', level: 'University' }))
      } else if (trackParam === 'academic') {
        setForm(prev => ({ ...prev, scholarTrack: 'academic' }))
      }
    }
  }, [])

  useEffect(() => {
    if (form.state && (!form.country || form.country === 'Nigeria')) {
      const derived = getCountryFromState(form.state)
      if (derived && derived !== form.country) setForm(prev => ({ ...prev, country: derived }))
    }
  }, [form.state, form.country])

  useEffect(() => {
    if (form.course && !form.faculty) {
      const sugF = getSuggestedFaculty(form.course)
      if (sugF) { setForm(prev => ({ ...prev, faculty: sugF })); setFacultyQuery(sugF) }
    }
  }, [form.course, form.faculty])

  useEffect(() => {
    if (form.course && form.faculty && !form.department) {
      const sugD = getSuggestedDepartment(form.course, form.faculty)
      if (sugD) { setForm(prev => ({ ...prev, department: sugD })); setDeptQuery(sugD) }
    }
  }, [form.course, form.faculty, form.department])

  const filteredFaculties = facultyQuery
    ? faculties.filter(f => f.toLowerCase().includes(facultyQuery.toLowerCase()))
    : faculties

  const availableDepts = form.faculty ? (faculties.includes(form.faculty) ? departmentsByFaculty[form.faculty] || [] : []) : []
  const filteredDepts = deptQuery
    ? availableDepts.filter(d => d.toLowerCase().includes(deptQuery.toLowerCase()))
    : availableDepts

  const usernameTimerRef = useRef(null)

  useEffect(() => {
    if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current)
    const u = form.username.trim()
    if (!u || u.length < 3) {
      setUsernameStatus({ state: '', msg: '' })
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(u)) {
      setUsernameStatus({ state: 'error', msg: 'Only letters, numbers and underscores allowed' })
      return
    }

    setUsernameStatus({ state: 'checking', msg: 'Checking availability...' })
    usernameTimerRef.current = setTimeout(async () => {
      try {
        const { data } = await checkUsername(u)
        if (data.available) {
          setUsernameStatus({ state: 'available', msg: 'Username available' })
          setErrors(prev => ({ ...prev, username: '' }))
        } else {
          setUsernameStatus({ state: 'taken', msg: data.message || 'Username already taken' })
          setErrors(prev => ({ ...prev, username: data.message || 'Username already taken' }))
        }
      } catch (_) {
        setUsernameStatus({ state: '', msg: '' })
      }
    }, 400)

    return () => { if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current) }
  }, [form.username])

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
    else if (form.username.trim().length < 3) newErrors.username = 'Username must be at least 3 characters'
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username.trim())) newErrors.username = 'Username can only contain letters, numbers, and underscores'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    if (!form.phone.trim()) newErrors.phone = 'Phone Number is required'
    if (!form.password.trim()) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    if (form.scholarTrack === 'pro_skill') {
      if (!form.skillDomain) newErrors.skillDomain = 'Please select your primary skill domain'
    } else if (form.scholarTrack === 'dual') {
      if (!form.country) newErrors.country = 'Country is required'
      if (!form.state.trim()) newErrors.state = 'State / Region is required'
      if (!form.school.trim()) newErrors.school = 'University name is required'
      if (!form.faculty) newErrors.faculty = 'Faculty is required'
      if (!form.department) newErrors.department = 'Department is required'
      if (!form.skillDomain) newErrors.skillDomain = 'Please select your primary skill guild'
    } else { // 'academic'
      if (!form.level) newErrors.level = 'Please select High School or University'
      if (!form.country) newErrors.country = 'Country is required'
      if (!form.state.trim()) newErrors.state = 'State / Region is required'
      if (!form.school.trim()) newErrors.school = 'School name is required'
      if (form.level === 'High School' && !form.track) newErrors.track = 'Please select a stream'
      if (form.level === 'University') {
        if (!form.faculty) newErrors.faculty = 'Faculty is required'
        if (!form.department) newErrors.department = 'Department is required'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignup = async () => {
    setLoading(true)
    setError('')
    try {
      const finalSchool = resolveSchoolName(form.school, form.country)
      const res = await signupUser({
        ...form,
        school: finalSchool,
        level: form.scholarTrack === 'pro_skill' ? 'Pro Skill' : form.scholarTrack === 'dual' ? 'University' : form.level,
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      window.dispatchEvent(new Event('userStateChange'))
      router.push('/feed')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your credentials and try again.')
    } finally {
      setLoading(false)
    }
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
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-gray-200 dark:bg-zinc-700'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">

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
                  <input name="username" type="text" placeholder="Choose Username (e.g. alex_scholar)" value={form.username} onChange={handleChange} className={`input-field !pl-8 ${usernameStatus.state === 'taken' || errors.username ? 'border-red-400' : usernameStatus.state === 'available' ? 'border-emerald-500' : ''}`} />
                  {usernameStatus.state === 'available' && <p className="text-emerald-600 text-xs font-semibold mt-1 flex items-center gap-1"><FiCheck size={12} /> {usernameStatus.msg}</p>}
                  {usernameStatus.state === 'taken' && <p className="text-red-500 text-xs font-semibold mt-1">❌ {usernameStatus.msg}</p>}
                  {usernameStatus.state === 'checking' && <p className="text-gray-400 text-xs mt-1 animate-pulse">Checking availability...</p>}
                  {errors.username && usernameStatus.state !== 'taken' && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                </div>

                <div className="relative">
                  <FiMail className="absolute left-3 top-3.5 text-gray-400" size={16} />
                  <input id="signup-email" name="email" type="email" autoComplete="email" placeholder="Email Address" value={form.email} onChange={handleChange} className={`input-field ${errors.email ? 'border-red-400' : ''}`} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <div className="flex gap-2">
                    <div className="relative w-36 flex-shrink-0">
                      <select
                        value={selectedCountry.code}
                        onChange={e => {
                          const c = countryList.find(item => item.code === e.target.value) || countryList[0]
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
                          <option key={i} value={c.code} className="bg-white dark:bg-zinc-800 text-gray-900 dark:text-white">
                            {c.flag} {c.code} ({c.name})
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
                        placeholder="Phone Number (e.g. 8012345678)"
                        value={rawPhone}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, '')
                          setRawPhone(val)
                          setForm(prev => ({
                            ...prev,
                            phone: val.trim() ? `${selectedCountry.code} ${val.trim()}` : ''
                          }))
                        }}
                        className={`input-field !pl-9 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white font-medium ${errors.phone ? 'border-red-400' : ''}`}
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
                </div>
              </div>

              <button onClick={() => { if (validateStep1()) setStep(2) }} className="btn-primary mt-6 flex items-center justify-center gap-2">
                Continue <FiArrowRight size={16} />
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">
                Already have an account? <Link href="/login" className="text-primary font-bold">Sign in</Link>
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-xl font-bold text-dark dark:text-white mb-1">Choose Your Scholar Track</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Select how you want to learn, build and connect</p>

              {/* TRACK SELECTOR */}
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

              {/* CONDITIONAL TRACK FORM FIELDS */}
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

                  {form.level === 'High School' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Stream / Track</label>
                      <div className="flex gap-2">
                        {tracks.map(t => (
                          <button key={t} type="button" onClick={() => setForm(prev => ({ ...prev, track: t }))}
                            className={`flex-1 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${form.track === t ? 'bg-primary text-white border-primary' : 'border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50'}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {form.level === 'University' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Faculty</label>
                        <input type="text" value={facultyQuery}
                          onChange={e => { setFacultyQuery(e.target.value); setForm(prev => ({ ...prev, faculty: e.target.value, department: '' })) }}
                          placeholder="Type or search faculty (e.g. Engineering, Law, Science)..."
                          className="input-field" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Department / Major</label>
                        <input type="text" value={deptQuery}
                          onChange={e => { setDeptQuery(e.target.value); setForm(prev => ({ ...prev, department: e.target.value })) }}
                          placeholder="Type department (e.g. Computer Science, Public Law)..."
                          className="input-field" />
                      </div>
                    </>
                  )}
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
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Faculty & Department</label>
                    <input type="text" value={deptQuery}
                      onChange={e => { setDeptQuery(e.target.value); setForm(prev => ({ ...prev, faculty: 'University Faculty', department: e.target.value })) }}
                      placeholder="Type your Department (e.g. Software Engineering)..."
                      className="input-field" />
                  </div>

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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-gray-200 dark:border-zinc-700 rounded-xl">
                      {skillCategories.map(cat => {
                        const isSelected = form.skillDomain === cat
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, skillDomain: cat }))}
                            className={`p-2.5 rounded-lg border text-left text-xs font-bold transition-all ${isSelected ? 'bg-primary text-white border-primary' : 'bg-gray-50 dark:bg-zinc-700/50 text-dark dark:text-white border-gray-200 dark:border-zinc-700 hover:border-primary'}`}
                          >
                            {cat}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Skill Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {skillLevels.map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, skillLevel: lvl }))}
                          className={`py-2 px-2 rounded-xl border text-[11px] font-bold text-center transition-all ${form.skillLevel === lvl ? 'bg-dark text-white border-dark' : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:border-dark'}`}
                        >
                          {lvl.split('/')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {error && <p className="text-red-500 text-xs mt-3 text-center">{error}</p>}

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn-ghost !w-auto px-5">Back</button>
                <button onClick={() => { if (validateStep2()) setStep(3) }} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  Continue <FiArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-xl font-bold text-dark dark:text-white mb-1">Pick Your Favorite Topics</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Choose interests to personalize your live feed</p>

              <div className="flex flex-wrap gap-2 mb-6 max-h-56 overflow-y-auto p-1">
                {(form.level === 'High School' ? secondaryInterests : universityInterests).map(item => (
                  <motion.button key={item} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => toggleInterest(item)}
                    className={`px-3.5 py-2 rounded-full border text-xs font-bold transition-all ${form.interests.includes(item) ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-zinc-800 text-dark dark:text-white border-gray-200 dark:border-zinc-700 hover:border-primary'}`}>
                    {item}
                  </motion.button>
                ))}
              </div>

              {error && <p className="text-red-500 text-xs mb-3 text-center">{error}</p>}

              <button onClick={handleSignup} disabled={loading} className="btn-primary flex items-center justify-center gap-2">
                {loading ? 'Creating account...' : 'Create Account & Enter Hub'}
              </button>
              <button onClick={() => setStep(2)} className="btn-ghost mt-3">Back</button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default Signup