'use client'
/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { updateSchool, getMe, requestSchool, searchSchools } from "../api/auth"
import { courses } from '../data/courses'
import { faculties, departmentsByFaculty } from '../data/faculties'
import { resolveSchoolName } from '../data/schoolAliases'
import { FiBookOpen, FiCheck, FiArrowRight, FiSearch, FiAward, FiCode, FiZap, FiGlobe } from "react-icons/fi"
import { getCountryFromState } from '../data/schools'
import { scholarTrackOptions, skillCategories, skillLevels, countryList } from './Signup'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

const levels = ['High School', 'University']

export default function Onboarding() {
  const router = useRouter()
  const [scholarTrack, setScholarTrack] = useState('academic') // 'academic' | 'dual' | 'pro_skill'
  const [level, setLevel] = useState('University')
  const [country, setCountry] = useState('Nigeria')
  const [course, setCourse] = useState('')
  const [track, setTrack] = useState('Science')
  const [school, setSchool] = useState('')
  const [faculty, setFaculty] = useState('')
  const [department, setDepartment] = useState('')
  const [state, setState] = useState('')
  const [skillDomain, setSkillDomain] = useState(skillCategories[0])
  const [skillLevel, setSkillLevel] = useState(skillLevels[1])

  const [schoolQuery, setSchoolQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [schoolSuggestions, setSchoolSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    getMe().then(res => {
      setUserData(res.data.user)
    }).catch(() => {
      router.push('/login')
    })
  }, [router])

  useEffect(() => {
    if (!country) return
    const lvlKey = (level || 'University').toLowerCase() === 'high school' ? 'secondary' : 'university'
    searchSchools(country, lvlKey, schoolQuery, state)
      .then(res => setSchoolSuggestions(res.data?.schools || []))
      .catch(() => setSchoolSuggestions([]))
  }, [schoolQuery, country, level, state])

  const handleBlurSchool = () => {
    if (schoolQuery) {
      const resolved = resolveSchoolName(schoolQuery, country)
      setSchoolQuery(resolved)
      setSchool(resolved)
    }
  }

  const canSubmit = scholarTrack === 'pro_skill' 
    ? Boolean(skillDomain)
    : scholarTrack === 'dual'
    ? Boolean(country && state && school && department && skillDomain)
    : Boolean(level && country && state && school && (level === 'High School' ? track : department))

  const handleSubmit = async () => {
    if (!canSubmit || loading) return
    setLoading(true)
    setError('')
    try {
      const finalSchool = resolveSchoolName(school || schoolQuery, country)
      const res = await updateSchool({
        scholarTrack,
        level: scholarTrack === 'pro_skill' ? 'Pro Skill' : scholarTrack === 'dual' ? 'University' : level,
        country,
        school: finalSchool,
        course,
        track,
        state,
        faculty: faculty || 'General Faculty',
        department: department || 'General Studies',
        skillDomain,
        skillLevel,
      })
      localStorage.setItem('user', JSON.stringify(res.data.user))
      router.push('/feed')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!userData) {
    return <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#008751] border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center p-4 py-8">
      <motion.div className="w-full max-w-lg" initial="hidden" animate="visible" variants={fadeUp}>
        <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-700 overflow-hidden">
          
          <div className="bg-gradient-to-br from-[#008751] to-[#006b40] px-8 py-8 text-center text-white">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FiBookOpen size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-extrabold mb-1">Welcome to ScholarHub!</h1>
            <p className="text-white/80 text-xs font-medium">Configure your global scholar profile</p>
          </div>

          <div className="p-6 space-y-5">
            {/* TRACK SELECTOR */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Select Your Scholar Track</label>
              <div className="space-y-2">
                {scholarTrackOptions.map(t => {
                  const Icon = t.icon
                  const isSelected = scholarTrack === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setScholarTrack(t.id)
                        if (t.id === 'dual') setLevel('University')
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 ${isSelected ? 'border-[#008751] bg-[#008751]/5 dark:bg-[#008751]/10 ring-2 ring-[#008751]/30' : 'border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? 'bg-[#008751] text-white' : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300'}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-dark dark:text-white truncate">{t.title}</p>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isSelected ? 'bg-[#008751] text-white' : 'bg-gray-100 dark:bg-zinc-700 text-gray-500'}`}>
                            {t.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{t.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ACADEMIC SCHOLAR FIELDS */}
            {scholarTrack === 'academic' && (
              <div className="space-y-3.5 pt-3 border-t border-gray-100 dark:border-zinc-700">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Education Level</label>
                  <div className="grid grid-cols-2 gap-2">
                    {levels.map(l => (
                      <button key={l} type="button" onClick={() => setLevel(l)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${level === l ? 'bg-[#008751] text-white border-[#008751]' : 'border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Country</label>
                  <select value={country} onChange={e => setCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-dark dark:text-white">
                    {countryList.map(c => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">State / Region</label>
                  <input type="text" value={state} onChange={e => setState(e.target.value)}
                    placeholder="State or region..." className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-xs bg-white dark:bg-zinc-800 text-dark dark:text-white" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    {level === 'High School' ? 'High School Name' : 'University Name'}
                  </label>
                  <input type="text" value={schoolQuery} onChange={e => { setSchoolQuery(e.target.value); setSchool(e.target.value) }}
                    onBlur={handleBlurSchool}
                    placeholder="Type school name or acronym (e.g. ESUT, MIT)..." className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-xs bg-white dark:bg-zinc-800 text-dark dark:text-white" />
                </div>

                {level === 'University' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Department / Major</label>
                    <input type="text" value={department} onChange={e => setDepartment(e.target.value)}
                      placeholder="Type your department (e.g. Computer Science)..." className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-xs bg-white dark:bg-zinc-800 text-dark dark:text-white" />
                  </div>
                )}
              </div>
            )}

            {/* DUAL TRACK FIELDS (UNIVERSITY ONLY) */}
            {scholarTrack === 'dual' && (
              <div className="space-y-3.5 pt-3 border-t border-gray-100 dark:border-zinc-700">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                  ⚡ Dual-Track is locked to <strong>University Students</strong> to combine degree studies with Skill Guilds!
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Country</label>
                  <select value={country} onChange={e => setCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-dark dark:text-white">
                    {countryList.map(c => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">State / Region</label>
                  <input type="text" value={state} onChange={e => setState(e.target.value)}
                    placeholder="State or region..." className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-xs bg-white dark:bg-zinc-800 text-dark dark:text-white" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">University Name</label>
                  <input type="text" value={schoolQuery} onChange={e => { setSchoolQuery(e.target.value); setSchool(e.target.value) }}
                    onBlur={handleBlurSchool}
                    placeholder="Type university or acronym (e.g. ESUT, UNILAG, MIT)..." className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-xs bg-white dark:bg-zinc-800 text-dark dark:text-white" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Department / Major</label>
                  <input type="text" value={department} onChange={e => setDepartment(e.target.value)}
                    placeholder="Type your department (e.g. Computer Science)..." className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-xs bg-white dark:bg-zinc-800 text-dark dark:text-white" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Primary Skill Guild</label>
                  <select value={skillDomain} onChange={e => setSkillDomain(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-dark dark:text-white">
                    {skillCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* PRO SKILL SCHOLAR FIELDS (NO SCHOOL) */}
            {scholarTrack === 'pro_skill' && (
              <div className="space-y-3.5 pt-3 border-t border-gray-100 dark:border-zinc-700">
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-2.5 text-xs text-blue-800 dark:text-blue-300">
                  🚀 No school or university required! Focus purely on practical skills, projects, and peer reviews.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Primary Skill Domain</label>
                  <select value={skillDomain} onChange={e => setSkillDomain(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-dark dark:text-white">
                    {skillCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Skill Experience Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {skillLevels.map(lvl => (
                      <button key={lvl} type="button" onClick={() => setSkillLevel(lvl)}
                        className={`py-2 px-1 rounded-xl border text-[11px] font-bold text-center transition-all ${skillLevel === lvl ? 'bg-[#008751] text-white border-[#008751]' : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300'}`}>
                        {lvl.split('/')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && <p className="text-red-500 text-xs text-center">{error}</p>}

            <button onClick={handleSubmit} disabled={!canSubmit || loading}
              className="w-full px-5 py-3 rounded-2xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: canSubmit && !loading ? '#008751' : '#ccc' }}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Complete Setup <FiArrowRight size={16} /></>
              )}
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  )
}
