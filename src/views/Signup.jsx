import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiUser, FiPhone, FiArrowRight, FiEye, FiEyeOff, FiSearch, FiX, FiCheck } from "react-icons/fi";
import Link from "next/link"
import { useRouter } from "next/navigation";
import { signupUser, updateSchool, searchSchools, requestSchool } from "../api/auth"
import { GoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../api/auth";
import { courses } from '../data/courses'
import { faculties, departmentsByFaculty, getSuggestedDepartment, getSuggestedFaculty } from '../data/faculties'
import { getCountryFromState, getSchoolLogo } from '../data/schools'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: 30, transition: { duration: 0.3 } },
}

const levels = ['Secondary', 'University']
const secondaryInterests = ['Sciences', 'Mathematics', 'English & Literature', 'Arts & Creativity', 'Commerce / Business', 'Technology / ICT', 'History & Government', 'Sports']
const universityInterests = ['Science', 'Mathematics', 'Law', 'Medicine', 'Technology', 'Arts & Lit', 'Commerce', 'History', 'Entertainment']
const tracks = ['Science', 'Art', 'Commercial']
const stateOptions = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT (Abuja)', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
  'Nairobi, Kenya', 'Mombasa, Kenya', 'Kampala, Uganda',
  'Accra, Ghana', 'Kumasi, Ghana', 'Cape Coast, Ghana',
  'Cape Town, South Africa', 'Johannesburg, South Africa', 'Durban, South Africa', 'Pretoria, South Africa',
  'Addis Ababa, Ethiopia', 'Cairo, Egypt', 'Dar es Salaam, Tanzania',
  'Khartoum, Sudan', 'Gaborone, Botswana', 'Dakar, Senegal',
  'Abidjan, Côte d\'Ivoire',
]

function StateSelect({ value, onChange, error }) {
  const [query, setQuery] = useState(value || '')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selected, setSelected] = useState(!!value)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = query ? stateOptions.filter(s => s.toLowerCase().includes(query.toLowerCase())) : stateOptions

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <FiSearch className="absolute left-3 top-3.5 text-gray-400" size={16} />
        <input type="text" value={query}
          onChange={e => { setQuery(e.target.value); setSelected(false); onChange(e.target.value) }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Your state / region..."
          className={`input-field !pl-9 !pr-9 ${error ? 'border-red-400' : selected ? 'border-primary' : ''}`} />
        {query && (
          <button type="button" onClick={() => { setQuery(''); setSelected(false); onChange(''); }} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
            <FiX size={15} />
          </button>
        )}
      </div>
      {showDropdown && (
        <div className="absolute z-50 bottom-full mb-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="p-3 text-sm text-gray-400 text-center">Type your state or region</p>
          ) : filtered.map((s, i) => (
            <button key={i} type="button"
              onClick={() => { setQuery(s); setSelected(true); setShowDropdown(false); onChange(s) }}
              className="w-full text-left px-3 py-2.5 text-sm text-dark hover:bg-primary/5">
              {s}
            </button>
          ))}
        </div>
      )}
      {selected && <p className="text-primary text-xs mt-1"><FiCheck size={10} className="inline mr-0.5" />Selected</p>}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function SchoolSearchInput({ value, onChange, error, currentLevel, state }) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selected, setSelected] = useState(!!value)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestName, setRequestName] = useState('')
  const [requestLocation, setRequestLocation] = useState('')
  const [requestSent, setRequestSent] = useState(false)
  const [requestLoading, setRequestLoading] = useState(false)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false)
        setShowRequestForm(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const country = state ? getCountryFromState(state) : null

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!country) { setSuggestions([]); setShowDropdown(false); return }
    if (!currentLevel) return

    const level = currentLevel.toLowerCase() === 'secondary' ? 'secondary' : 'university'

    if (!query) {
      timerRef.current = setTimeout(async () => {
        setLoading(true)
        try {
          const { data } = await searchSchools(country, level, '', state)
          setSuggestions(data.schools)
          setShowDropdown(true)
        } catch { setSuggestions([]) }
        setLoading(false)
      }, 200)
      return
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await searchSchools(country, level, query, state)
        setSuggestions(data.schools)
        setShowDropdown(data.schools.length > 0)
      } catch { setSuggestions([]) }
      setLoading(false)
    }, 300)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query, currentLevel, country, state])

  const handleSelect = (school) => {
    const name = typeof school === 'string' ? school : school.name
    setQuery(name)
    setSelected(true)
    setShowDropdown(false)
    onChange(name)
  }

  const handleRequestSchool = async () => {
    if (!requestName.trim()) return
    setRequestLoading(true)
    try {
      await requestSchool({ name: requestName, location: requestLocation, level: currentLevel })
      setRequestSent(true)
      setShowRequestForm(false)
    } catch (err) {
      console.error('Request failed', err)
    } finally {
      setRequestLoading(false)
    }
  }

  const showNotFound = !loading && query && suggestions.length === 0 && !selected

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <FiSearch className="absolute left-3 top-3.5 text-gray-400" size={16} />
        <input ref={inputRef} type="text" value={query}
          onChange={e => { setQuery(e.target.value); setSelected(false); onChange(e.target.value); setRequestSent(false) }}
          onFocus={() => { setActiveIndex(-1); if (!showRequestForm) setShowDropdown(suggestions.length > 0) }}
          placeholder="Search your school..."
          className={`input-field !pl-9 !pr-9 ${error ? 'border-red-400' : selected ? 'border-primary' : ''}`}
          autoComplete="off" />
        {query && (
          <button type="button" onClick={() => { setQuery(''); setSelected(false); onChange(''); setSuggestions([]); setShowRequestForm(false) }} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
            <FiX size={15} />
          </button>
        )}
      </div>
      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="absolute z-50 bottom-full mb-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
            {suggestions.map((school, i) => (
              <button key={i} type="button" onClick={() => handleSelect(school)} onMouseEnter={() => setActiveIndex(i)}
                className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center gap-2 ${activeIndex === i ? 'bg-primary/10 text-primary' : 'text-dark hover:bg-primary/5'}`}>
                <div className="w-6 h-6 rounded-md overflow-hidden flex-shrink-0 relative">
                  <img src={getSchoolLogo(school.name || school).png} alt=""
                    className="w-full h-full object-contain"
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
                  <span className="hidden absolute inset-0 items-center justify-center text-primary text-xs font-bold bg-primary/10"
                    style={{ backgroundColor: (school.color || '#008751') + '20', color: school.color || '#008751' }}>
                    {(school.name || school).charAt(0)}
                  </span>
                </div>
                <span className="truncate">{school.name || school}</span>
              </button>
            ))}
          </motion.div>
        )}
        {showNotFound && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="absolute z-50 bottom-full mb-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 text-center">
              <p className="text-sm text-gray-400">School not found?</p>
              <button onClick={() => { setShowRequestForm(true); setShowDropdown(false); setRequestName(query) }}
                className="text-[#008751] font-medium text-xs mt-1 underline">Request to add it</button>
            </div>
          </motion.div>
        )}
        {showRequestForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="absolute z-50 bottom-full mb-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Request a New School</h3>
            <input type="text" value={requestName} onChange={e => setRequestName(e.target.value)}
              placeholder="School name" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white" />
            <input type="text" value={requestLocation} onChange={e => setRequestLocation(e.target.value)}
              placeholder="Location (optional)" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white" />
            <div className="flex gap-2">
              <button onClick={() => { setShowRequestForm(false); setRequestLocation('') }}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600">Cancel</button>
              <button onClick={handleRequestSchool} disabled={requestLoading || !requestName.trim()}
                className="px-4 py-2 rounded-xl bg-[#008751] text-white text-xs font-medium disabled:opacity-50">Submit Request</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {requestSent && <p className="text-green-600 text-xs mt-1"><FiCheck size={10} className="inline mr-0.5" />Request submitted!</p>}
      {selected && <p className="text-primary text-xs mt-1"><FiCheck size={10} className="inline mr-0.5" />Selected</p>}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function Signup() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [facultyQuery, setFacultyQuery] = useState('')
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false)
  const [deptQuery, setDeptQuery] = useState('')
  const [showDeptDropdown, setShowDeptDropdown] = useState(false)
  const facultyRef = useRef(null)
  const deptRef = useRef(null)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', username: '',
    level: '', school: '', state: '', course: '', track: '', faculty: '', department: '', interests: [],
  })

  useEffect(() => {
    if (form.email && !form.username) {
      const suggested = form.email.split('@')[0].replace(/[^a-z0-9_]/gi, '_').toLowerCase().slice(0, 20)
      setForm(prev => ({ ...prev, username: suggested }))
    }
  }, [form.email])

  useEffect(() => {
    if (form.course) {
      const sugDept = getSuggestedDepartment(form.course)
      const sugFac = getSuggestedFaculty(form.course)
      if (sugDept && !form.department) setForm(prev => ({ ...prev, department: sugDept }))
      if (sugFac && !form.faculty) setForm(prev => ({ ...prev, faculty: sugFac }))
    }
  }, [form.course])

  useEffect(() => {
    const handler = (e) => {
      if (facultyRef.current && !facultyRef.current.contains(e.target) && e.target !== facultyRef.current) {
        setShowFacultyDropdown(false)
      }
      if (deptRef.current && !deptRef.current.contains(e.target) && e.target !== deptRef.current) {
        setShowDeptDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
    if (!form.email.trim()) newErrors.email = 'Email is required'
    if (!form.phone.trim()) newErrors.phone = 'Phone Number is required'
    if (!form.password.trim()) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    if (!form.level) newErrors.level = 'Please select your education level'
    if (!form.school.trim()) newErrors.school = 'School name is required'
    if (!form.state.trim()) newErrors.state = 'State is required'
    if (form.level === 'Secondary' && !form.track) newErrors.track = 'Please select a track'
    if (form.level === 'University') {
      if (!form.faculty) newErrors.faculty = 'Faculty is required'
      if (!form.department) newErrors.department = 'Department is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignup = async () => {
    setLoading(true)
    setError('')
    try {
      const payload = { ...form }
      if (!payload.username && payload.email) {
        payload.username = payload.email.split('@')[0].replace(/[^a-z0-9_]/gi, '_').toLowerCase().slice(0, 20)
      }
      const res = await signupUser(payload)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      router.push('/feed')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again')
    } finally {
      setLoading(false)
    }
  }

  const filteredFaculties = faculties.filter(f =>
    f.toLowerCase().includes(facultyQuery.toLowerCase())
  )
  const deptOptions = form.faculty ? (departmentsByFaculty[form.faculty] || []) : []
  const filteredDepts = deptOptions.filter(d =>
    d.toLowerCase().includes(deptQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-light flex items-center justify-center px-4 py-6 sm:py-10">
      <motion.div className="form-card w-full max-w-md p-5 sm:p-8"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-dark">
            Scholar<span className="text-accent">Hub</span>
          </h1>
          <p className="text-sm text-gray-400 mt-2">Africa's student platform</p>
        </div>

        <div className="flex gap-2 mb-7">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-gray-200'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">

          {step === 1 && (
            <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-xl font-bold text-dark mb-1">Create Your Account</h2>
              <p className="text-sm text-gray-400 mb-5">Join thousands of African students on ScholarHub</p>

              <div id="google-login-wrapper" className="w-full mb-4 overflow-hidden">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    try {
                      setError('')
                      const res = await googleAuth(credentialResponse.credential)
                      localStorage.setItem('token', res.data.token)
                      localStorage.setItem('user', JSON.stringify(res.data.user))
                      if (res.data.isNewUser) {
                        router.push('/onboarding')
                      } else {
                        router.push('/feed')
                      }
                    } catch (err) {
                      setError(err.response?.data?.message || 'Google login failed. Check console for details.')
                      console.error('Google auth error:', err.response?.data || err.message)
                    }
                  }}
                  onError={() => setError('Google sign-in popup failed. Try again.')}
                  width="400" text="continue_with" shape="rectangular" theme="outline" useOneTap={false} />
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <FiUser className="absolute left-3 top-3.5 text-gray-400" size={16} />
                  <input name="name" type="text" placeholder="Full Name" value={form.name} onChange={handleChange} className={`input-field ${errors.name ? 'border-red-400' : ''}`} />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3.5 text-gray-400" size={16} />
                  <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} className={`input-field ${errors.email ? 'border-red-400' : ''}`} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-3.5 text-gray-400" size={16} />
                  <input name="phone" type="tel" placeholder="Phone Number" value={form.phone} onChange={handleChange} className={`input-field ${errors.phone ? 'border-red-400' : ''}`} />
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
              <p className="text-center text-sm text-gray-400 mt-4">
                Already have an account? <Link href="/login" className="text-primary font-semibold">Sign in</Link>
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-xl font-bold text-dark mb-1">Your school details</h2>
              <p className="text-sm text-gray-400 mb-5">We'll connect you with your school community</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {levels.map(level => (
                  <motion.button key={level} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                    onClick={() => setForm(prev => ({ ...prev, level }))}
                    className={`py-4 rounded-xl border-2 text-sm font-semibold transition-all ${form.level === level ? 'border-primary bg-primary text-white' : 'border-gray-200 text-dark hover:border-primary'}`}>
                    {level}
                  </motion.button>
                ))}
              </div>
              {errors.level && <p className="text-red-500 text-xs mb-3">{errors.level}</p>}

              {form.level === 'Secondary' && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Track</label>
                  <div className="flex gap-2">
                    {tracks.map(t => (
                      <button key={t} type="button" onClick={() => setForm(prev => ({ ...prev, track: t }))}
                        className={`flex-1 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${form.track === t ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                  {errors.track && <p className="text-red-500 text-xs mt-1">{errors.track}</p>}
                </div>
              )}

              {form.level === 'University' && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Course / Field of Study</label>
                  <div className="max-h-32 overflow-y-auto flex flex-wrap gap-1.5 border border-gray-200 rounded-xl p-2">
                    {courses.map(c => (
                      <button key={c} type="button" onClick={() => setForm(prev => ({ ...prev, course: c }))}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${form.course === c ? 'bg-primary text-white' : 'bg-gray-50 text-dark border border-gray-200 hover:border-primary'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <StateSelect value={form.state} error={errors.state}
                  onChange={(val) => setForm(prev => ({ ...prev, state: val }))} />
              </div>

              <div className="mb-3">
                <SchoolSearchInput value={form.school} currentLevel={form.level} state={form.state}
                  onChange={(val) => setForm(prev => ({ ...prev, school: val }))} error={errors.school} />
              </div>

              {form.level === 'University' && (
                <>
                  <div className="mb-3 relative">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Faculty</label>
                    <FiSearch size={14} className="absolute left-3 top-[30px] text-gray-400 z-10" />
                    <input ref={facultyRef} type="text" value={facultyQuery}
                      onFocus={() => setShowFacultyDropdown(true)}
                      onChange={e => { setFacultyQuery(e.target.value); setForm(prev => ({ ...prev, faculty: '', department: '' })); setShowFacultyDropdown(true) }}
                      placeholder={form.course ? `Suggested: ${getSuggestedFaculty(form.course) || 'Search faculty...'}` : 'Search faculty...'}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-sm bg-white" />
                    {form.faculty && <FiCheck size={14} className="absolute right-3 top-[30px] text-green-500" />}
                    {showFacultyDropdown && (
                      <div ref={facultyRef} className="mt-1 max-h-40 overflow-y-auto border border-gray-100 rounded-xl bg-white shadow-sm z-20 absolute w-full">
                        {filteredFaculties.map(f => (
                          <button key={f} type="button" onClick={() => { setForm(prev => ({ ...prev, faculty: f })); setFacultyQuery(f); setShowFacultyDropdown(false); setDeptQuery('') }}
                            className={`w-full text-left px-3 py-2 text-sm ${form.faculty === f ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                            {f}
                          </button>
                        ))}
                      </div>
                    )}
                    {errors.faculty && <p className="text-red-500 text-xs mt-1">{errors.faculty}</p>}
                  </div>

                  <div className="mb-3 relative">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Department</label>
                    <FiSearch size={14} className="absolute left-3 top-[30px] text-gray-400 z-10" />
                    <input ref={deptRef} type="text" value={deptQuery}
                      onFocus={() => setShowDeptDropdown(true)}
                      onChange={e => { setDeptQuery(e.target.value); setForm(prev => ({ ...prev, department: '' })); setShowDeptDropdown(true) }}
                      placeholder={form.course ? `Suggested: ${getSuggestedDepartment(form.course) || 'Select department...'}` : 'Select department...'}
                      disabled={!form.faculty}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-sm bg-white disabled:bg-gray-50" />
                    {form.department && <FiCheck size={14} className="absolute right-3 top-[30px] text-green-500" />}
                    {showDeptDropdown && form.faculty && (
                      <div ref={deptRef} className="mt-1 max-h-40 overflow-y-auto border border-gray-100 rounded-xl bg-white shadow-sm z-20 absolute w-full">
                        {filteredDepts.length === 0 ? (
                          <div className="p-3 text-sm text-gray-400 text-center">{deptQuery ? 'No matching departments' : 'Select a faculty first'}</div>
                        ) : filteredDepts.map(d => (
                          <button key={d} type="button" onClick={() => { setForm(prev => ({ ...prev, department: d })); setDeptQuery(d); setShowDeptDropdown(false) }}
                            className={`w-full text-left px-3 py-2 text-sm ${form.department === d ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                            {d}
                          </button>
                        ))}
                      </div>
                    )}
                    {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                  </div>
                </>
              )}

              <button onClick={() => { if (validateStep2()) setStep(3) }} className="btn-primary flex items-center justify-center gap-2">
                Continue <FiArrowRight size={16} />
              </button>
              <button onClick={() => setStep(1)} className="btn-ghost mt-3">Back</button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-xl font-bold text-dark mb-1">Pick your interests</h2>
              <p className="text-sm text-gray-400 mb-5">Choose subjects you love, pick as many as you want</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {(form.level === 'Secondary' ? secondaryInterests : universityInterests).map(item => (
                  <motion.button key={item} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => toggleInterest(item)}
                    className={`px-4 py-2 rounded-full border text-sm transition-all ${form.interests.includes(item) ? 'bg-primary text-white border-primary' : 'bg-white text-dark border-gray-200 hover:border-primary'}`}>
                    {item}
                  </motion.button>
                ))}
              </div>

              {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

              <button onClick={handleSignup} disabled={loading} className="btn-primary flex items-center justify-center gap-2">
                {loading ? 'Creating account...' : 'Create Account'}
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