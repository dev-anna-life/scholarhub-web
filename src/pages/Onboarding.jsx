import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { updateSchool, getMe } from "../api/auth"
import { courses } from '../data/courses'
import { FiBookOpen, FiCheck, FiArrowRight, FiSearch } from "react-icons/fi"
import { getAllSchoolsForLevel } from '../data/schools'

const levels = ['Secondary', 'University']

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

export default function Onboarding() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [level, setLevel] = useState('')
  const [course, setCourse] = useState('')
  const [school, setSchool] = useState('')
  const [state, setState] = useState('')
  const [schoolQuery, setSchoolQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userData, setUserData] = useState(null)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    getMe().then(res => setUserData(res.data)).catch(() => router.push('/login'))
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && e.target !== inputRef.current) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const allSchools = level ? getAllSchoolsForLevel(level.toLowerCase()) : []
  const filteredSchools = schoolQuery
    ? allSchools.filter(s => s.name.toLowerCase().includes(schoolQuery.toLowerCase()))
    : allSchools

  const canSubmit = level && (level !== 'University' || course) && school

  const handleSubmit = async () => {
    if (!canSubmit || loading) return
    setLoading(true)
    setError('')
    try {
      const res = await updateSchool({ level, school, course, state })
      localStorage.setItem('user', JSON.stringify(res.data.user))
      router.push('/feed')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!userData) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#008751] border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div className="w-full max-w-lg" initial="hidden" animate="visible" variants={fadeUp}>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-br from-[#008751] to-[#006b40] px-8 py-10 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiBookOpen size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Welcome to ScholarHub!</h1>
            <p className="text-white/80 text-sm">Tell us about yourself to get started</p>
          </div>

          <div className="p-6 space-y-6">
            <AnimatePresence mode="wait">
              {!level ? (
                <motion.div key="level" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <label className="block text-sm font-medium text-gray-600 mb-3">I am a...</label>
                  <div className="grid grid-cols-2 gap-3">
                    {levels.map(l => (
                      <button key={l} onClick={() => setLevel(l)}
                        className="p-4 rounded-2xl border-2 text-center transition-all hover:border-[#008751] hover:bg-[#008751]/5"
                        style={{ borderColor: level === l ? '#008751' : '#e5e7eb', backgroundColor: level === l ? '#f0fdf4' : 'white' }}>
                        <span className="text-2xl block mb-1">{l === 'Secondary' ? '📚' : '🎓'}</span>
                        <span className="text-sm font-semibold text-gray-800">{l}</span>
                        <span className="text-xs text-gray-400 block mt-0.5">{l === 'Secondary' ? 'High School' : 'Undergraduate'}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  {level === 'University' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Course / Field of Study</label>
                      <div className="max-h-36 overflow-y-auto flex flex-wrap gap-1.5 border border-gray-200 rounded-xl p-2 mb-4">
                        {courses.map(c => (
                          <button key={c} type="button" onClick={() => setCourse(c)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${course === c ? 'bg-[#008751] text-white' : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-[#008751]'}`}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-4 relative">
                    <label className="block text-sm font-medium text-gray-600 mb-2">School</label>
                    <div className="relative">
                      <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input ref={inputRef} type="text" value={schoolQuery}
                        onFocus={() => setShowDropdown(true)}
                        onChange={e => { setSchoolQuery(e.target.value); setSchool(''); setShowDropdown(true) }}
                        placeholder={`Search ${level} schools...`}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white" />
                      {school && (
                        <FiCheck size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                      )}
                    </div>
                    {showDropdown && (
                      <div ref={dropdownRef} className="mt-2 max-h-52 overflow-y-auto border border-gray-100 rounded-xl bg-white shadow-sm z-20 absolute w-full">
                        {filteredSchools.length === 0 ? (
                          <div className="p-3 text-sm text-gray-400 text-center">No schools found</div>
                        ) : filteredSchools.map(s => (
                          <button key={s.name} onClick={() => { setSchool(s.name); setSchoolQuery(s.name); setShowDropdown(false) }}
                            className={`w-full text-left px-3 py-2.5 text-sm transition-all flex items-center gap-2 ${school === s.name ? 'bg-[#008751]/10 text-[#008751] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                            <div className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ backgroundColor: s.color }}>
                              {s.name.charAt(0)}
                            </div>
                            {s.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-2">State / Region</label>
                    <input type="text" value={state} onChange={e => setState(e.target.value)}
                      placeholder="Enter your state or region"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && <p className="text-red-500 text-xs text-center">{error}</p>}

            <div className="flex gap-3">
              {level && (
                <button onClick={() => { setLevel(''); setCourse(''); setSchool(''); setSchoolQuery('') }}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                  Back
                </button>
              )}
              {!level ? (
                <div className="w-full" />
              ) : (
                <button onClick={handleSubmit} disabled={!canSubmit || loading}
                  className="flex-1 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all flex items-center justify-center gap-2"
                  style={{ backgroundColor: canSubmit && !loading ? '#008751' : '#ccc' }}>
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Complete Setup <FiArrowRight size={16} /></>
                  )}
                </button>
              )}
            </div>

            <p className="text-xs text-gray-400 text-center">You can always update this later in Settings</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
