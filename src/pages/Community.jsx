/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { FiArrowRight, FiBookOpen, FiStar, FiSearch, FiLock, FiExternalLink } from "react-icons/fi"
import { getLeaderboard, getMe } from "../api/auth"
import { getAllSchoolsForLevel, getCountryFromState } from '../data/schools'

const communities = [
    {
        id: 'secondary', name: 'Secondary School Hub', level: 'Secondary',
        description: 'For secondary school students',
        color: 'from-[#1F2A1F] to-[#2d4a2d]', lightColor: 'bg-green-50',
        borderColor: 'border-green-200', textColor: 'text-[#1F2A1F]', accentColor: '#008751',
        icon: FiBookOpen,
    },
    {
        id: 'university', name: 'University Hub', level: 'University',
        description: 'For university students',
        color: 'from-[#FF9F1C] to-[#ffb347]', lightColor: 'bg-orange-50',
        borderColor: 'border-orange-200', textColor: 'text-orange-800', accentColor: '#FF9F1C',
        icon: FiStar,
    },
]

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' } })
}

function Community() {
    const router = useRouter()
    const [user, setUser] = useState({})
    const [loading, setLoading] = useState(true)
    const [schoolQuery, setSchoolQuery] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)
    const searchRef = useRef(null)
    const inputRef = useRef(null)

    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target) && e.target !== inputRef.current) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const userCountry = user?.state ? getCountryFromState(user.state) : null
    const allSchools = getAllSchoolsForLevel('secondary').concat(getAllSchoolsForLevel('university'))
    const filteredSchools = (() => {
        let list = allSchools
        if (userCountry) list = list.filter(s => s.country === userCountry)
        if (schoolQuery) list = list.filter(s => s.name.toLowerCase().includes(schoolQuery.toLowerCase()))
        return list.slice(0, 30)
    })()

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user') || '{}')
        if (stored.level) {
            setUser(stored)
            setLoading(false)
        } else {
            getMe().then(res => {
                setUser(res.data)
                localStorage.setItem('user', JSON.stringify(res.data))
                setLoading(false)
            }).catch(() => {
                setLoading(false)
            })
        }
    }, [])

    const stored = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {}
    const effectiveLevel = stored.level || user.level
    const userLevel = effectiveLevel === 'JSS' || effectiveLevel === 'SSS' ? 'Secondary' : effectiveLevel

    if (loading) {
        return (
            <div className="min-h-screen bg-light md:pl-56 pt-16 md:pt-0 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Loading...</p>
                </div>
            </div>
        )
    }

    if (!effectiveLevel) {
        return (
            <div className="min-h-screen bg-light md:pl-56 pt-16 md:pt-0">
                <div className="sticky top-0 z-40 bg-light/95 backdrop-blur-md border-b border-gray-100 px-4 md:px-6 py-3 md:py-4">
                    <div className="max-w-5xl mx-auto">
                        <h1 className="text-xl md:text-2xl font-extrabold text-dark">Communities</h1>
                        <p className="text-xs md:text-sm text-gray-400 mt-0.5">Find your people. Share your knowledge</p>
                    </div>
                </div>
                <div className="max-w-5xl mx-auto px-4 py-16 text-center">
                    <p className="text-4xl mb-3">🎓</p>
                    <h2 className="text-xl font-bold text-dark mb-2">Set your education level</h2>
                    <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
                        You need to set your education level before you can access communities. 
                        Go to Settings to update your profile.
                    </p>
                    <button onClick={() => router.push('/settings')}
                        className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition">
                        Go to Settings
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-light md:pl-56 pt-16 md:pt-0">
            <div className="sticky top-0 z-40 bg-light/95 backdrop-blur-md border-b border-gray-100 px-4 md:px-6 py-3 md:py-4">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-xl md:text-2xl font-extrabold text-dark">Communities</h1>
                    <p className="text-xs md:text-sm text-gray-400 mt-0.5">Find your people. Share your knowledge</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-4 md:py-8">

                <div className="relative mb-6">
                    <FiSearch size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input ref={inputRef} type="text" value={schoolQuery}
                        onFocus={() => setShowDropdown(true)}
                        onChange={e => { setSchoolQuery(e.target.value); setShowDropdown(true) }}
                        placeholder={`Search schools in ${userCountry || 'your area'}...`}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-sm bg-white shadow-sm focus:outline-none focus:border-primary transition" />
                    {showDropdown && filteredSchools.length > 0 && (
                        <div ref={searchRef} className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto border border-gray-100 rounded-xl bg-white shadow-md">
                            {filteredSchools.map(s => (
                                <button key={s.name} type="button"
                                    onMouseDown={() => { router.push(`/school/${encodeURIComponent(s.name)}`); setShowDropdown(false); setSchoolQuery('') }}
                                    className="w-full text-left px-3 py-2.5 text-sm transition-all flex items-center gap-2 text-gray-700 hover:bg-gray-50">
                                    <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                                        style={{ backgroundColor: s.color }}>
                                        {s.name.charAt(0)}
                                    </div>
                                    <span className="flex-1">{s.name}</span>
                                    <span className="text-[10px] text-gray-400">{s.country}</span>
                                    <FiExternalLink size={12} className="text-gray-300" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {effectiveLevel && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-dark rounded-2xl p-4 md:p-5 mb-6 md:mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <p className="text-gray-400 text-xs mb-1">Your community</p>
                                <p className="text-white font-bold text-base md:text-lg">
                                    {communities.find(c => c.level === userLevel)?.name || 'ScholarHub'}
                                </p>
                                <p className="text-gray-400 text-xs mt-0.5">Based on your education level — {userLevel}</p>
                            </div>
                            <button
                                onClick={() => router.push(`/community/${userLevel?.toLowerCase()}`)}
                                className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition flex items-center gap-2 self-start sm:self-auto">
                                Enter <FiArrowRight size={15} />
                            </button>
                        </div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                    {communities.map((c, i) => {
                        const isLocked = c.level !== userLevel
                        return (
                            <motion.div key={c.id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                                whileHover={isLocked ? {} : { y: -4 }}
                                className={`bg-white rounded-2xl border ${c.borderColor} overflow-hidden transition-all duration-300 ${isLocked ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer group hover:shadow-xl'}`}>
                                <div className={`bg-gradient-to-r ${c.color} p-4 md:p-5 ${isLocked ? 'opacity-60' : ''}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <c.icon size={24} className="text-white" />
                                        {isLocked ? (
                                            <span className="bg-black/30 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                                                <FiLock size={11} /> Locked
                                            </span>
                                        ) : (
                                            <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-white font-extrabold text-lg md:text-xl mb-1">{c.name}</h2>
                                    <p className="text-white/80 text-xs md:text-sm leading-relaxed">{c.description}</p>
                                </div>

                                <div className="p-4 md:p-5">
                                    {isLocked ? (
                                        <div className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-gray-100 text-gray-400">
                                            <FiLock size={14} /> Not available for {userLevel}
                                        </div>
                                    ) : (
                                        <button onClick={() => router.push(`/community/${c.id}`)}
                                            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-white hover:opacity-90"
                                            style={{ backgroundColor: c.accentColor }}>
                                            Enter Community <FiArrowRight size={14} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

            </div>
        </div>
    )
}

export default Community
