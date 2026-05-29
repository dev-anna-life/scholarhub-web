/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { FiUsers, FiArrowRight, FiBookOpen, FiTrendingUp, FiStar, FiZap, FiAward, FiSearch } from "react-icons/fi"
import { getLeaderboard, getMe } from "../api/auth"

const communities = [
    {
        id: 'secondary', name: 'Secondary School Hub', level: 'Secondary',
        description: 'For secondary school students',
        color: 'from-[#1F2A1F] to-[#2d4a2d]', lightColor: 'bg-green-50',
        borderColor: 'border-green-200', textColor: 'text-[#1F2A1F]', accentColor: '#008751',
        icon: FiBookOpen,
        tags: ['Notes', 'Questions', 'Gist'],
    },
    {
        id: 'university', name: 'University Hub', level: 'University',
        description: 'For university students',
        color: 'from-[#FF9F1C] to-[#ffb347]', lightColor: 'bg-orange-50',
        borderColor: 'border-orange-200', textColor: 'text-orange-800', accentColor: '#FF9F1C',
        icon: FiStar,
        tags: ['Notes', 'Questions', 'Projects', 'Gist'],
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



            </div>
        </div>
    )
}

export default Community
