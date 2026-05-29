/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiUser, FiPhone, FiArrowRight, FiEye, FiEyeOff, FiSearch, FiX } from "react-icons/fi";
import Link from "next/link"
import { useRouter } from "next/navigation";
import { signupUser } from "../api/auth"
import { GoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../api/auth";
import { courses } from '../data/courses'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: 30, transition: { duration: 0.3 } },
}

const levels = ['Secondary', 'University']
const interests = ['Science', 'Mathematics', 'Law', 'Medicine', 'Technology', 'Arts & Lit', 'Commerce', 'History', 'Entertainment']

const africanCountries = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Tanzania', 'Uganda', 'Rwanda', 'Ethiopia', 'Morocco',
  'Tunisia', 'Zimbabwe', 'Mozambique', 'Angola',
  'Sudan', 'Somalia', 'Mali', 'Burkina Faso', 'Niger', 'Chad', 'Guinea', 'Benin', 'Togo', 'Sierra Leone', 'Liberia', 'Malawi'
]

const fallbackSchools = [
  'University of Lagos', 'Obafemi Awolowo University', 'Ahmadu Bello University',
  'University of Nigeria Nsukka', 'Covenant University', 'University of Ibadan',
  'Lagos State University', 'University of Benin', 'Nnamdi Azikiwe University',
  'University of Port Harcourt', 'University of Ilorin', 'Babcock University',
  'Enugu State University of Technology (ESUT)', 'University of Ghana',
  'Kwame Nkrumah University of Science and Technology', 'University of Cape Coast',
  'University of Nairobi', 'Kenyatta University', 'Makerere University',
  'University of Cape Town', 'University of Pretoria', 'University of the Witwatersrand',
  'Stellenbosch University', 'Cairo University', 'Addis Ababa University',
  'University of Dar es Salaam', 'University of Rwanda', 'Federal University of Technology Owerri',
  'Federal University of Technology Akure', 'University of Agriculture Makurdi',
  'Rivers State University', 'Ekiti State University', 'Delta State University',
]

const API_BASE_URL = 'https://scholarhub-api-production.up.railway.app/api'

const schoolsByState = {
  'enugu': ['University of Nigeria Nsukka', 'Enugu State University of Technology (ESUT)', 'Godfrey Okoye University', 'Coal City University', 'Caritas University', 'Madonna University (Okija campus)', 'Renaissance University', 'Institute of Management and Technology (IMT)'],
  'lagos': ['University of Lagos', 'Lagos State University', 'Covenant University', 'Pan-Atlantic University', 'Yaba College of Technology', 'Lagos State Polytechnic'],
  'oyo': ['University of Ibadan', 'Lead City University', 'Dominion University', 'The Polytechnic Ibadan'],
  'kaduna': ['Ahmadu Bello University', 'Kaduna State University', 'Nigerian Defence Academy'],
  'abuja': ['University of Abuja', 'Baze University', 'Veritas University', 'Nile University of Nigeria'],
  'rivers': ['University of Port Harcourt', 'Rivers State University', 'Ignatius Ajuru University of Education'],
  'delta': ['Delta State University', 'Federal University of Petroleum Resources', 'Western Delta University'],
  'edo': ['University of Benin', 'Ambrose Alli University', 'Igbinedion University', 'Benson Idahosa University'],
  'imo': ['Federal University of Technology Owerri', 'Imo State University'],
  'anambra': ['Nnamdi Azikiwe University', 'Chukwuemeka Odumegwu Ojukwu University', 'Madonna University'],
  'kano': ['Bayero University Kano', 'Kano State Polytechnic'],
  'ogun': ['Federal University of Agriculture Abeokuta', 'Babcock University', 'Crawford University', 'McPherson University'],
  'osun': ['Obafemi Awolowo University', 'Osun State University', 'Redeemer\'s University'],
  'kwara': ['University of Ilorin', 'Kwara State University', 'Al-Hikmah University'],
  'plateau': ['University of Jos', 'Plateau State University'],
  'akwa ibom': ['University of Uyo', 'Akwa Ibom State University'],
  'cross river': ['University of Calabar', 'Cross River University of Technology'],
  'ebonyi': ['Ebonyi State University', 'Federal University Ndufu-Alike Ikwo'],
  'benue': ['Federal University of Agriculture Makurdi', 'Benue State University'],
  'nasarawa': ['Federal University of Lafia', 'Nasarawa State University'],
  'kogi': ['Federal University Lokoja', 'Kogi State University'],
  'ekiti': ['Ekiti State University', 'Federal University of Technology Akure (FUTA)'],
  'borno': ['University of Maiduguri', 'Ramat Polytechnic'],
  'sokoto': ['Usmanu Danfodiyo University Sokoto', 'Sokoto State University'],
  'bauchi': ['Abubakar Tafawa Balewa University', 'Bauchi State University'],
  'gombe': ['Gombe State University', 'Federal University of Kashere'],
  'yobe': ['Yobe State University', 'Federal University Gashua'],
  'taraba': ['Taraba State University', 'Federal University Wukari'],
  'jigawa': ['Federal University Dutse', 'Jigawa State University'],
  'katsina': ['Umaru Musa Yar\'Adua University', 'Katsina State University'],
  'zamfara': ['Federal University Gusau', 'Zamfara State University'],
  'niger': ['Federal University of Technology Minna', 'Ibrahim Badamasi Babangida University'],
  'adamawa': ['American University of Nigeria', 'Modibbo Adama University'],
  'bayelsa': ['Niger Delta University', 'Federal University Otuoke'],
  'nassarawa': ['Nasarawa State University', 'Federal University of Lafia'],
}

function SchoolSearchInput({ value, onChange, error, stateFilter }) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selected, setSelected] = useState(!!value)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const searchSchools = async (searchQuery) => {
    setLoading(true)
    try {
      const url = searchQuery.length >= 2
        ? `${API_BASE_URL}/schools/search?query=${encodeURIComponent(searchQuery)}`
        : `${API_BASE_URL}/schools/search`

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      const response = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        let schools = data.schools || fallbackSchools
        if (stateFilter && searchQuery.length < 2) {
          const stateSchools = schoolsByState[stateFilter.toLowerCase().trim()]
          if (stateSchools) {
            schools = stateSchools.concat(schools.filter(s => !stateSchools.includes(s)))
          }
        }
        if (searchQuery.length >= 2) {
          const stateSchools = schoolsByState[stateFilter?.toLowerCase().trim()]
          if (stateSchools) {
            const matched = stateSchools.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
            if (matched.length > 0) {
              schools = matched.concat(schools.filter(s => !matched.includes(s)))
            }
          }
        }
        setSuggestions(schools.slice(0, 30))
        setShowDropdown(schools.length > 0)
      } else {
        throw new Error('Failed to fetch')
      }
    } catch (err) {
      let filtered = fallbackSchools
      if (searchQuery.length >= 2) {
        filtered = fallbackSchools.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      }
      if (stateFilter && filtered.length < 10) {
        const stateSchools = schoolsByState[stateFilter.toLowerCase().trim()]
        if (stateSchools) {
          const matched = stateSchools.filter(s => searchQuery.length < 2 || s.toLowerCase().includes(searchQuery.toLowerCase()))
          filtered = matched.concat(filtered.filter(s => !matched.includes(s)))
        }
      }
      setSuggestions(filtered.slice(0, 30))
      setShowDropdown(filtered.length > 0)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (!showDropdown) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      setActiveIndex(-1)
    }
  }

  const handleFocus = () => {
    setActiveIndex(-1)
    if (query.length < 2) {
      setSuggestions(fallbackSchools.slice(0, 30))
      setShowDropdown(true)
    } else {
      setShowDropdown(suggestions.length > 0)
    }
  }

  const handleInput = (e) => {
    const val = e.target.value
    setQuery(val)
    setSelected(false)
    onChange(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchSchools(val), 400)
  }

  const handleSelect = (school) => {
    setQuery(school)
    setSelected(true)
    setShowDropdown(false)
    onChange(school)
  }

  const handleClear = () => {
    setQuery('')
    setSelected(false)
    onChange('')
    setSuggestions([])
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <FiSearch className="absolute left-3 top-3.5 text-gray-400" size={16} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search your university or school..."
          className={`input-field !pl-9 !pr-9 ${error ? 'border-red-400' : selected ? 'border-primary' : ''}`}
          autoComplete="off"
        />
        {query && (
          <button type="button" onClick={handleClear} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
            <FiX size={15} />
          </button>
        )}
      </div>

      {loading && (
        <div className="absolute right-9 top-3.5">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden max-h-56 sm:max-h-60 overflow-y-auto"
          >
            <div className="px-3 sm:px-4 py-2 bg-gray-50 text-xs text-gray-400 font-medium">
              {suggestions.length} school{suggestions.length !== 1 ? 's' : ''} found
            </div>
            {suggestions.map((school, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(school)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-sm transition-colors border-b border-gray-50 last:border-0 flex items-center gap-2 ${activeIndex === i ? 'bg-primary/10 text-primary' : 'text-dark hover:bg-primary/5 hover:text-primary'}`}
              >
                <span className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                  {school.split(' ').filter(w => w.length > 2).map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </span>
                <span className="truncate">{school}</span>
              </button>
            ))}
            <div className="px-3 sm:px-4 py-2 bg-gray-50 text-xs text-gray-400">
              Can't find your school? Just type the name and continue
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selected && <p className="text-primary text-xs mt-1">✓ School selected</p>}
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
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    level: '', school: '', state: '', course: '', interests: [],
  })

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
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignup = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await signupUser(form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      router.push('/feed')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-light flex items-center justify-center px-4 py-6 sm:py-10">
      <motion.div
        className="form-card w-full max-w-md p-5 sm:p-8"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      >
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
                  width="400"
                  text="continue_with"
                  shape="rectangular"
                  theme="outline"
                  useOneTap={false}
                />
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
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password (min 8 characters)"
                    value={form.password}
                    onChange={handleChange}
                    className={`input-field ${errors.password ? 'border-red-400' : ''}`}
                  />
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
              <h2 className="text-xl font-bold text-dark mb-1">Your education level</h2>
              <p className="text-sm text-gray-400 mb-5">We'll personalise your feed for you</p>

              <div className="grid grid-cols-2 gap-3 mb-2">
                {levels.map(level => (
                  <motion.button
                    key={level}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setForm({ ...form, level, course: '' })}
                    className={`py-4 rounded-xl border-2 text-sm font-semibold transition-all duration-300 ${form.level === level ? 'border-primary bg-primary text-white' : 'border-gray-200 text-dark hover:border-primary'}`}
                  >
                    {level}
                  </motion.button>
                ))}
              </div>
              {errors.level && <p className="text-red-500 text-xs mb-3">{errors.level}</p>}

              <div className="space-y-3 mb-6 mt-3">
                <div>
                  <input
                    name="state"
                    type="text"
                    placeholder="Your state / city — we'll find schools near you"
                    value={form.state}
                    onChange={handleChange}
                    className={`input-field !pl-4 ${errors.state ? 'border-red-400' : ''}`}
                  />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
                <SchoolSearchInput
                  value={form.school}
                  onChange={(val) => setForm(prev => ({ ...prev, school: val }))}
                  error={errors.school}
                  stateFilter={form.state}
                />
              </div>

              {(form.level === 'University') && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Your Course / Field of Study</label>
                  <div className="max-h-36 overflow-y-auto flex flex-wrap gap-1.5 border border-gray-200 rounded-xl p-2">
                    {courses.map(c => (
                      <button key={c} type="button" onClick={() => setForm(prev => ({ ...prev, course: c }))}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${form.course === c ? 'bg-primary text-white' : 'bg-gray-50 text-dark border border-gray-200 hover:border-primary'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
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
              <p className="text-sm text-gray-400 mb-5">Choose subjects you love — pick as many as you want</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {interests.map(item => (
                  <motion.button
                    key={item}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleInterest(item)}
                    className={`px-4 py-2 rounded-full border text-sm transition-all duration-300 ${form.interests.includes(item) ? 'bg-primary text-white border-primary' : 'bg-white text-dark border-gray-200 hover:border-primary'}`}
                  >
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