import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { updateSchool, getMe, requestSchool, searchSchools } from "../api/auth"
import { courses } from '../data/courses'
import { faculties, departmentsByFaculty, getSuggestedDepartment, getSuggestedFaculty } from '../data/faculties'
import { FiBookOpen, FiCheck, FiArrowRight, FiSearch } from "react-icons/fi"
import { getCountryFromState, getSchoolLogo } from '../data/schools'

const levels = ['Secondary', 'University']

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}
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

export default function Onboarding() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [level, setLevel] = useState('')
  const [course, setCourse] = useState('')
  const [track, setTrack] = useState('')
  const [school, setSchool] = useState('')
  const [faculty, setFaculty] = useState('')
  const [department, setDepartment] = useState('')
  const [state, setState] = useState('')
  const [schoolQuery, setSchoolQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [facultyQuery, setFacultyQuery] = useState('')
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false)
  const [deptQuery, setDeptQuery] = useState('')
  const [showDeptDropdown, setShowDeptDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userData, setUserData] = useState(null)
  const [showRequestSchool, setShowRequestSchool] = useState(false)
  const [showStateDropdown, setShowStateDropdown] = useState(false)
  const [schoolSuggestions, setSchoolSuggestions] = useState([])
  const [schoolLoading, setSchoolLoading] = useState(false)
  const stateRef = useRef(null)
  const schoolTimerRef = useRef(null)
  const [requestName, setRequestName] = useState('')
  const [requestLocation, setRequestLocation] = useState('')
  const [requestSent, setRequestSent] = useState(false)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)
  const facultyRef = useRef(null)
  const deptRef = useRef(null)

  useEffect(() => {
    getMe().then(res => {
      const u = res.data
      setUserData(u)
      if (u.level) setLevel(u.level)
      if (u.state) setState(u.state)
    }).catch(() => router.push('/login'))
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && e.target !== inputRef.current) {
        setShowDropdown(false)
      }
      if (stateRef.current && !stateRef.current.contains(e.target)) {
        setShowStateDropdown(false)
      }
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

  useEffect(() => {
    if (course) {
      const sugDept = getSuggestedDepartment(course)
      const sugFac = getSuggestedFaculty(course)
      if (sugDept && !department) setDepartment(sugDept)
      if (sugFac && !faculty) setFaculty(sugFac)
    }
  }, [course])

  const country = state ? getCountryFromState(state) : null

  useEffect(() => {
    if (schoolTimerRef.current) clearTimeout(schoolTimerRef.current)
    if (!country || !level) { setSchoolSuggestions([]); return }
    const lvl = level.toLowerCase() === 'secondary' ? 'secondary' : 'university'
    schoolTimerRef.current = setTimeout(async () => {
      setSchoolLoading(true)
      try {
        const { data } = await searchSchools(country, lvl, schoolQuery || '', state)
        setSchoolSuggestions(data.schools)
      } catch { setSchoolSuggestions([]) }
      setSchoolLoading(false)
    }, schoolQuery ? 300 : 200)
    return () => { if (schoolTimerRef.current) clearTimeout(schoolTimerRef.current) }
  }, [schoolQuery, country, level, state])

  const filteredFaculties = facultyQuery
    ? faculties.filter(f => f.toLowerCase().includes(facultyQuery.toLowerCase()))
    : faculties

  const availableDepts = faculty ? (faculties.includes(faculty) ? departmentsByFaculty[faculty] || [] : []) : []
  const filteredDepts = deptQuery
    ? availableDepts.filter(d => d.toLowerCase().includes(deptQuery.toLowerCase()))
    : availableDepts

  const universityComplete = level === 'University' && school && faculty && department
  const secondaryComplete = level === 'Secondary' && school && track && state
  const canSubmit = level && (level !== 'University' || universityComplete) && (level !== 'Secondary' || secondaryComplete)

  const handleSubmit = async () => {
    if (!canSubmit || loading) return
    setLoading(true)
    setError('')
    try {
      const res = await updateSchool({ level, school, course, track, state, faculty, department })
      localStorage.setItem('user', JSON.stringify(res.data.user))
      router.push('/feed')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestSchool = async () => {
    if (!requestName.trim()) return
    setLoading(true)
    try {
      await requestSchool({ name: requestName, location: requestLocation, level })
      setRequestSent(true)
      setShowRequestSchool(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request')
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
                  <label className="block text-sm font-semibold text-gray-600 mb-3">I am a...</label>
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
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Course / Field of Study</label>
                        <div className="max-h-36 overflow-y-auto flex flex-wrap gap-1.5 border border-gray-200 rounded-xl p-2 mb-4">
                          {courses.map(c => (
                            <button key={c} type="button" onClick={() => setCourse(c)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${course === c ? 'bg-[#008751] text-white' : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-[#008751]'}`}>
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3 relative" ref={stateRef}>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">State / Region</label>
                        <div className="relative">
                          <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" value={state}
                            onFocus={() => setShowStateDropdown(true)}
                            onChange={e => { setState(e.target.value); setShowStateDropdown(true) }}
                            placeholder="Your state or region..."
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white" />
                          {state && <FiCheck size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />}
                        </div>
                        {showStateDropdown && (
                          <div className="absolute bottom-full mb-1 max-h-40 overflow-y-auto border border-gray-100 rounded-xl bg-white shadow-sm z-20 w-full">
                            {(state ? stateOptions.filter(s => s.toLowerCase().includes(state.toLowerCase())) : stateOptions).length === 0 ? (
                              <div className="p-3 text-sm text-gray-400 text-center">Type your state or region</div>
                            ) : (state ? stateOptions.filter(s => s.toLowerCase().includes(state.toLowerCase())) : stateOptions).map((s, i) => (
                              <button key={i} onClick={() => { setState(s); setShowStateDropdown(false) }}
                                className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">{s}</button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mb-3 relative">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">School</label>
                        <div className="relative">
                          <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input ref={inputRef} type="text" value={schoolQuery}
                            onFocus={() => setShowDropdown(true)}
                            onChange={e => { setSchoolQuery(e.target.value); setSchool(''); setShowDropdown(true) }}
                            placeholder={country ? `Search ${country} universities...` : 'Search university...'}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white" />
                          {school && <FiCheck size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />}
                          {showDropdown && (
                            <div ref={dropdownRef} className="absolute bottom-full mb-1 max-h-52 overflow-y-auto border border-gray-100 rounded-xl bg-white shadow-sm z-20 w-full">
                            {schoolLoading ? (
                              <div className="p-3 text-sm text-gray-400 text-center">Searching...</div>
                            ) : schoolSuggestions.length === 0 ? (
                              <div className="p-3 text-sm text-gray-400 text-center">
                                <p>School not found?</p>
                                <button onClick={() => { setShowDropdown(false); setShowRequestSchool(true) }}
                                  className="text-[#008751] font-medium text-xs mt-1 underline">Request to add it</button>
                              </div>
                            ) : schoolSuggestions.map(s => (
                              <button key={s.name} onClick={() => { setSchool(s.name); setSchoolQuery(s.name); setShowDropdown(false) }}
                                className={`w-full text-left px-3 py-2.5 text-sm transition-all flex items-center gap-2 ${school === s.name ? 'bg-[#008751]/10 text-[#008751] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                                {(() => { const { png } = getSchoolLogo(s.name); return <img src={png} alt="" className="w-5 h-5 rounded object-contain flex-shrink-0" /> })()}
                                {s.name}
                              </button>
                            ))}
                          </div>
                        )}
                        </div>
                      </div>

                      <div className="mb-3 relative">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Faculty</label>
                        <FiSearch size={16} className="absolute left-3 top-[38px] text-gray-400 z-10" />
                        <input ref={facultyRef} type="text" value={facultyQuery}
                          onFocus={() => setShowFacultyDropdown(true)}
                          onChange={e => { setFacultyQuery(e.target.value); setFaculty(''); setDepartment(''); setShowFacultyDropdown(true) }}
                          placeholder={course ? `Suggested: ${getSuggestedFaculty(course) || 'Search faculty...'}` : 'Search faculty...'}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white" />
                        {faculty && <FiCheck size={16} className="absolute right-3 top-[30px] text-green-500" />}
                        {showFacultyDropdown && (
                          <div ref={facultyRef} className="bottom-full mb-1 max-h-40 overflow-y-auto border border-gray-100 rounded-xl bg-white shadow-sm z-20 absolute w-full">
                            {filteredFaculties.map(f => (
                              <button key={f} onClick={() => { setFaculty(f); setFacultyQuery(f); setShowFacultyDropdown(false); setDepartment('') }}
                                className={`w-full text-left px-3 py-2 text-sm ${faculty === f ? 'bg-[#008751]/10 text-[#008751] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                                {f}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mb-3 relative">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Department</label>
                        <FiSearch size={16} className="absolute left-3 top-[38px] text-gray-400 z-10" />
                        <input ref={deptRef} type="text" value={deptQuery}
                          onFocus={() => setShowDeptDropdown(true)}
                          onChange={e => { setDeptQuery(e.target.value); setDepartment(''); setShowDeptDropdown(true) }}
                          placeholder={course ? `Suggested: ${getSuggestedDepartment(course) || 'Select department...'}` : 'Select department...'}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white"
                          disabled={!faculty} />
                        {department && <FiCheck size={16} className="absolute right-3 top-[30px] text-green-500" />}
                        {showDeptDropdown && faculty && (
                          <div ref={deptRef} className="bottom-full mb-1 max-h-40 overflow-y-auto border border-gray-100 rounded-xl bg-white shadow-sm z-20 absolute w-full">
                            {filteredDepts.length === 0 ? (
                              <div className="p-3 text-sm text-gray-400 text-center">{deptQuery ? 'No matching departments' : 'Select a faculty first'}</div>
                            ) : filteredDepts.map(d => (
                              <button key={d} onClick={() => { setDepartment(d); setDeptQuery(d); setShowDeptDropdown(false) }}
                                className={`w-full text-left px-3 py-2 text-sm ${department === d ? 'bg-[#008751]/10 text-[#008751] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                                {d}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {level === 'Secondary' && (
                    <>
                      <div className="mb-3 relative" ref={stateRef}>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">State / Region</label>
                        <div className="relative">
                          <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" value={state}
                            onFocus={() => setShowStateDropdown(true)}
                            onChange={e => { setState(e.target.value); setShowStateDropdown(true) }}
                            placeholder="Your state or region..."
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white" />
                          {state && <FiCheck size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />}
                        </div>
                        {showStateDropdown && (
                          <div className="absolute bottom-full mb-1 max-h-40 overflow-y-auto border border-gray-100 rounded-xl bg-white shadow-sm z-20 w-full">
                            {(state ? stateOptions.filter(s => s.toLowerCase().includes(state.toLowerCase())) : stateOptions).length === 0 ? (
                              <div className="p-3 text-sm text-gray-400 text-center">Type your state or region</div>
                            ) : (state ? stateOptions.filter(s => s.toLowerCase().includes(state.toLowerCase())) : stateOptions).map((s, i) => (
                              <button key={i} onClick={() => { setState(s); setShowStateDropdown(false) }}
                                className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">{s}</button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mb-3 relative">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">School</label>
                        <div className="relative">
                          <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input ref={inputRef} type="text" value={schoolQuery}
                            onFocus={() => setShowDropdown(true)}
                            onChange={e => { setSchoolQuery(e.target.value); setSchool(''); setShowDropdown(true) }}
                            placeholder={country ? `Search ${country} secondary schools...` : 'Search secondary school...'}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white" />
                          {school && <FiCheck size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />}
                          {showDropdown && (
                            <div ref={dropdownRef} className="absolute bottom-full mb-1 max-h-52 overflow-y-auto border border-gray-100 rounded-xl bg-white shadow-sm z-20 w-full">
                            {schoolLoading ? (
                              <div className="p-3 text-sm text-gray-400 text-center">Searching...</div>
                            ) : schoolSuggestions.length === 0 ? (
                              <div className="p-3 text-sm text-gray-400 text-center">
                                <p>School not found?</p>
                                <button onClick={() => { setShowDropdown(false); setShowRequestSchool(true) }}
                                  className="text-[#008751] font-medium text-xs mt-1 underline">Request to add it</button>
                              </div>
                            ) : schoolSuggestions.map(s => (
                              <button key={s.name} onClick={() => { setSchool(s.name); setSchoolQuery(s.name); setShowDropdown(false) }}
                                className={`w-full text-left px-3 py-2.5 text-sm transition-all flex items-center gap-2 ${school === s.name ? 'bg-[#008751]/10 text-[#008751] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                                {(() => { const { png } = getSchoolLogo(s.name); return <img src={png} alt="" className="w-5 h-5 rounded object-contain flex-shrink-0" /> })()}
                                {s.name}
                              </button>
                            ))}
                          </div>
                        )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Track</label>
                        <div className="flex gap-2">
                          {['Science', 'Art', 'Commercial'].map(t => (
                            <button key={t} onClick={() => setTrack(t)}
                              className={`flex-1 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                track === t ? 'bg-[#008751] text-white border-[#008751]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                              }`}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {showRequestSchool && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Request a New School</h3>
                <input type="text" value={requestName} onChange={e => setRequestName(e.target.value)}
                  placeholder="School name" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white" />
                <input type="text" value={requestLocation} onChange={e => setRequestLocation(e.target.value)}
                  placeholder="Location (optional)" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white" />
                <div className="flex gap-2">
                  <button onClick={() => { setShowRequestSchool(false); setRequestName(''); setRequestLocation('') }}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600">Cancel</button>
                  <button onClick={handleRequestSchool} disabled={loading || !requestName.trim()}
                    className="px-4 py-2 rounded-xl bg-[#008751] text-white text-xs font-medium disabled:opacity-50">Submit Request</button>
                </div>
                {requestSent && <p className="text-green-600 text-xs">Request submitted! We'll review it shortly.</p>}
              </motion.div>
            )}

            {error && <p className="text-red-500 text-xs text-center">{error}</p>}

            <div className="flex gap-3">
              {level && (
                <button onClick={() => { setLevel(''); setCourse(''); setSchool(''); setSchoolQuery(''); setFaculty(''); setDepartment('') }}
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
