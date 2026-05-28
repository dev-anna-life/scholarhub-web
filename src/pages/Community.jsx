/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { FiUsers, FiArrowRight, FiBookOpen, FiTrendingUp, FiStar, FiZap, FiAward, FiSearch } from "react-icons/fi"
import { getLeaderboard, getMe } from "../api/auth"

const communities = [
    {
        id: 'secondary', name: 'Secondary School Hub', level: 'Secondary',
        description: 'Junior and senior secondary students sharing notes, gist, assignments and exam tips.',
        color: 'from-[#1F2A1F] to-[#2d4a2d]', lightColor: 'bg-green-50',
        borderColor: 'border-green-200', textColor: 'text-[#1F2A1F]', accentColor: '#008751',
        icon: FiBookOpen,
        tags: ['WAEC Prep', 'JAMB', 'Mathematics', 'English', 'Science'],
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

function Community() {
    const router = useRouter()
    const [user, setUser] = useState({})

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user') || '{}')
        setUser(stored)
        if (!stored.level) {
            getMe().then(res => {
                setUser(res.data)
                localStorage.setItem('user', JSON.stringify(res.data))
            }).catch(() => {})
        }
    }, [])

    const userLevel = user.level === 'JSS' || user.level === 'SSS' ? 'Secondary' : user.level
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
                    {communities.filter(c => !userLevel || c.level === userLevel).map((c, i) => (
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

            </div>
        </div>
    )
}

export default Community
