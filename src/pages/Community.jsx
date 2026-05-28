/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { FiUsers, FiArrowRight, FiBookOpen, FiTrendingUp, FiStar, FiZap, FiAward, FiMapPin, FiSearch } from "react-icons/fi"
import { getLeaderboard } from "../api/auth"

const communities = [
    {
        id: 'jss', name: 'JSS Community', level: 'JSS',
        description: 'Junior secondary school students sharing notes, gist, assignments and exam tips.',
        color: 'from-[#1F2A1F] to-[#2d4a2d]', lightColor: 'bg-green-50',
        borderColor: 'border-green-200', textColor: 'text-[#1F2A1F]', accentColor: '#008751',
        icon: FiBookOpen,
        tags: ['Basic Science', 'Mathematics', 'English', 'Social Studies', 'CRS/IRS'],
    },
    {
        id: 'sss', name: 'SSS Community', level: 'SSS',
        description: 'Senior secondary students conquering WAEC, NECO, JAMB and sharing everything in between.',
        color: 'from-[#008751] to-[#00a86b]', lightColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200', textColor: 'text-emerald-800', accentColor: '#008751',
        icon: FiZap,
        tags: ['WAEC Prep', 'JAMB', 'Chemistry', 'Physics', 'Literature'],
    },
    {
        id: 'university', name: 'University Hub', level: 'University',
        description: 'Undergraduates sharing lecture notes, past questions, campus gist and career advice.',
        color: 'from-[#FF9F1C] to-[#ffb347]', lightColor: 'bg-orange-50',
        borderColor: 'border-orange-200', textColor: 'text-orange-800', accentColor: '#FF9F1C',
        icon: FiStar,
        tags: ['Lecture Notes', 'Past Questions', 'Campus Gist', 'Internships', 'Projects'],
    },
]

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' } })
}

const schools = [
    { name: 'Government Secondary School, Enugu', abbr: 'GSS', location: 'Enugu State', color: '#008751', level: 'SSS' },
    { name: 'Queen\'s School, Enugu', abbr: 'QS', location: 'Enugu State', color: '#FF9F1C', level: 'SSS' },
    { name: 'Community Secondary School, Nsukka', abbr: 'CSS', location: 'Nsukka, Enugu', color: '#1F2A1F', level: 'JSS' },
    { name: 'University of Nigeria Secondary School, Nsukka', abbr: 'UNSS', location: 'Nsukka, Enugu', color: '#008751', level: 'SSS' },
    { name: 'Boys\' Secondary School, Enugu', abbr: 'BSS', location: 'Enugu State', color: '#2d4a2d', level: 'SSS' },
    { name: 'St. Patrick\'s College, Enugu', abbr: 'SPC', location: 'Enugu State', color: '#00a86b', level: 'SSS' },
    { name: 'Holy Rosary College, Enugu', abbr: 'HRC', location: 'Enugu State', color: '#FF9F1C', level: 'SSS' },
    { name: 'Urban Day Secondary School, Nsukka', abbr: 'UDSS', location: 'Nsukka, Enugu', color: '#1F2A1F', level: 'JSS' },
    { name: 'King\'s College, Lagos', abbr: 'KC', location: 'Lagos State', color: '#008751', level: 'SSS' },
    { name: 'Federal Government College, Enugu', abbr: 'FGC', location: 'Enugu State', color: '#FF9F1C', level: 'SSS' },
    { name: 'College of the Immaculate Conception, Enugu', abbr: 'CIC', location: 'Enugu State', color: '#00a86b', level: 'SSS' },
    { name: 'Ihiala Secondary School, Nsukka', abbr: 'ISS', location: 'Nsukka, Enugu', color: '#2d4a2d', level: 'JSS' },
]

function Community() {
    const router = useRouter()
    const [user, setUser] = useState({})

    useEffect(() => {
        try { setUser(JSON.parse(localStorage.getItem('user') || '{}')) } catch (e) {}
    }, [])

    return (
        <div className="min-h-screen bg-light md:pl-56 pt-16 md:pt-0">
            <div className="sticky top-0 z-40 bg-light/95 backdrop-blur-md border-b border-gray-100 px-4 md:px-6 py-3 md:py-4">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-xl md:text-2xl font-extrabold text-dark">Communities</h1>
                    <p className="text-xs md:text-sm text-gray-400 mt-0.5">Find your people. Share your knowledge</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-4 md:py-8">
                {user.level && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-dark rounded-2xl p-4 md:p-5 mb-6 md:mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <p className="text-gray-400 text-xs mb-1">Your community</p>
                                <p className="text-white font-bold text-base md:text-lg">
                                    {communities.find(c => c.level === user.level)?.name || 'ScholarHub'}
                                </p>
                                <p className="text-gray-400 text-xs mt-0.5">Based on your education level — {user.level}</p>
                            </div>
                            <button
                                onClick={() => router.push(`/community/${user.level?.toLowerCase()}`)}
                                className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition flex items-center gap-2 self-start sm:self-auto">
                                Enter <FiArrowRight size={15} />
                            </button>
                        </div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                    {communities.filter(c => !user.level || c.level === user.level).map((c, i) => (
                        <motion.div key={c.id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                            whileHover={{ y: -4 }}
                            className={`bg-white rounded-2xl border ${c.borderColor} overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-xl`}
                            onClick={() => router.push(`/community/${c.id}`)}>
                            <div className={`bg-gradient-to-r ${c.color} p-4 md:p-5`}>
                                <div className="flex items-center justify-between mb-3">
                                    <c.icon size={24} className="text-white" />
                                    <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                                        Active
                                    </span>
                                </div>
                                <h2 className="text-white font-extrabold text-lg md:text-xl mb-1">{c.name}</h2>
                                <p className="text-white/80 text-xs md:text-sm leading-relaxed">{c.description}</p>
                            </div>

                            <div className="p-4 md:p-5">
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {c.tags.slice(0, 4).map(tag => (
                                        <span key={tag}
                                            className={`${c.lightColor} ${c.textColor} text-xs font-medium px-2 py-0.5 rounded-full border ${c.borderColor}`}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <button
                                    className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-white hover:opacity-90"
                                    style={{ backgroundColor: c.accentColor }}>
                                    Enter Community <FiArrowRight size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-10 md:mt-12">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div>
                            <h2 className="text-lg md:text-xl font-extrabold text-dark flex items-center gap-2">
                                <FiMapPin className="text-primary" size={20} /> School Communities
                            </h2>
                            <p className="text-xs md:text-sm text-gray-400 mt-0.5">Connect with students from your school</p>
                        </div>
                    </div>

                    {user.state && (() => {
                        const stateKey = user.state.toLowerCase().trim()
                        const stateSchools = schools.filter(s => s.location.toLowerCase().includes(stateKey) || s.name.toLowerCase().includes(stateKey)).filter(s => !user.level || s.level === user.level)
                        if (stateSchools.length === 0) return null
                        return (
                            <div className="mb-6">
                                <p className="text-sm font-semibold text-dark mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-5 bg-primary rounded-full inline-block" />
                                    Schools in {user.state}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                    {stateSchools.map((school, i) => (
                                        <motion.div key={school.name} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                                            whileHover={{ y: -3 }}
                                            className="bg-primary/5 border border-primary/20 rounded-2xl p-4 cursor-pointer hover:shadow-lg hover:border-primary transition-all duration-300"
                                            onClick={() => router.push(`/school/${encodeURIComponent(school.name)}`)}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                                    style={{ backgroundColor: school.color }}>
                                                    {school.abbr}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-dark text-sm truncate">{school.name}</p>
                                                    <p className="text-xs text-gray-400 truncate">{school.location}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <FiUsers size={12} /><span>Students</span>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-primary text-xs font-medium">Near you</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )
                    })()}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {schools.filter(s => !user.level || s.level === user.level).slice(0, 9).map((school, i) => (
                            <motion.div key={school.name} custom={i + 5} variants={fadeUp} initial="hidden" animate="visible"
                                whileHover={{ y: -3 }}
                                className="bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                                onClick={() => router.push(`/school/${encodeURIComponent(school.name)}`)}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                        style={{ backgroundColor: school.color }}>
                                        {school.abbr}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-dark text-sm truncate">{school.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{school.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <FiUsers size={12} />
                                    <span>Students</span>
                                    {school.level && (
                                        <>
                                            <span className="text-gray-300">•</span>
                                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">{school.level}</span>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Community
