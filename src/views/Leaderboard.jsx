/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FiSearch, FiX, FiAward } from "react-icons/fi"
import { MdLocalFireDepartment } from "react-icons/md"
import { GiTrophy } from "react-icons/gi"
import { getLeaderboard } from "../api/auth"

const knownAbbreviations = {
    'university of lagos': 'UNILAG', 'unilag': 'UNILAG',
    'obafemi awolowo university': 'OAU', 'oau ile-ife': 'OAU',
    'ahmadu bello university': 'ABU', 'abu zaria': 'ABU',
    'university of nigeria nsukka': 'UNN', 'covenant university': 'CU',
    'university of ibadan': 'UI', 'lagos state university': 'LASU',
    'university of benin': 'UNIBEN', 'university of port harcourt': 'UNIPORT',
    'university of ilorin': 'UNILORIN', 'babcock university': 'BU',
    'nnamdi azikiwe university': 'UNIZIK',
    'enugu state university of technology (esut)': 'ESUT',
    'enugu state university of technology': 'ESUT', 'esut': 'ESUT',
    'university of ghana': 'UG', 'kwame nkrumah university of science and technology': 'KNUST',
    'university of nairobi': 'UON', 'kenyatta university': 'KU',
    'makerere university': 'MAK', 'university of cape town': 'UCT',
    'university of the witwatersrand': 'WITS', 'addis ababa university': 'AAU',
}

const schoolColors = {
    'university of lagos': '#003366', 'unilag': '#003366',
    'oau ile-ife': '#006400', 'obafemi awolowo university': '#006400',
    'abu zaria': '#8B0000', 'ahmadu bello university': '#8B0000',
    'covenant university': '#722F37', 'university of ibadan': '#003399',
    'university of benin': '#006633', 'lagos state university': '#CC0000',
    'enugu state university of technology (esut)': '#006400',
    'enugu state university of technology': '#006400',
    'university of ghana': '#006B3F', 'makerere university': '#006B3F',
    'university of cape town': '#003380',
}

function getSchoolAbbr(school) {
    if (!school) return '?'
    const lower = school.toLowerCase().trim()
    if (knownAbbreviations[lower]) return knownAbbreviations[lower]
    return school.split(' ').filter(w => w.length > 2).map(w => w[0].toUpperCase()).join('').slice(0, 6) || school.slice(0, 4).toUpperCase()
}

function stringToColor(school) {
    if (!school) return '#008751'
    const lower = school.toLowerCase().trim()
    if (schoolColors[lower]) return schoolColors[lower]
    let hash = 0
    for (let i = 0; i < lower.length; i++) hash = lower.charCodeAt(i) + ((hash << 5) - hash)
    const colors = ['#008751', '#FF9F1C', '#1F2A1F', '#e63946', '#457b9d', '#6a4c93', '#f4a261', '#2a9d8f']
    return colors[Math.abs(hash) % colors.length]
}

const levels = ['All', 'Secondary', 'University']

function Leaderboard() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterLevel, setFilterLevel] = useState('All')
    const [currentUser, setCurrentUser] = useState({})

    useEffect(() => {
        try { setCurrentUser(JSON.parse(localStorage.getItem('user') || '{}')) } catch (e) {}
    }, [])

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await getLeaderboard()
                setUsers(res.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchLeaderboard()
    }, [])

    const filtered = users.filter(u => {
        const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.school?.toLowerCase().includes(search.toLowerCase())
        const matchesLevel = filterLevel === 'All' || u.level === filterLevel
        return matchesSearch && matchesLevel
    })

    const myRank = filtered.findIndex(u => u._id === currentUser.id) + 1
    const top3 = filtered.slice(0, 3)
    const rest = filtered.slice(3)

    const podiumOrder = [
        { user: top3[1], rank: 2, medal: '2nd', height: 'h-20', color: 'bg-gray-100' },
        { user: top3[0], rank: 1, medal: '1st', height: 'h-28', color: 'bg-accent/20' },
        { user: top3[2], rank: 3, medal: '3rd', height: 'h-14', color: 'bg-orange-50' },
    ]

    return (
        <div className="min-h-screen bg-light md:pl-56 pt-16 md:pt-0">

            <div className="bg-dark px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-5"
                    >
                        <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <GiTrophy size={28} className="text-accent" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-white">Leaderboard</h1>
                        <p className="text-gray-400 text-sm mt-1">Top scholars ranked by activity</p>
                    </motion.div>



                    {myRank > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-primary/20 border border-primary/30 rounded-2xl p-4 flex items-center gap-3"
                        >
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold">
                                {currentUser.name?.charAt(0) || 'S'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-sm truncate">{currentUser.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    {currentUser.school && (
                                        <span className="text-white font-bold rounded-full px-2 py-0.5"
                                            style={{ backgroundColor: stringToColor(currentUser.school), fontSize: '10px' }}>
                                            {getSchoolAbbr(currentUser.school)}
                                        </span>
                                    )}
                                    <span className="text-gray-400 text-xs">{currentUser.level}</span>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-accent font-extrabold text-xl">#{myRank}</p>

                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">

                <div className="relative mb-4">
                    <FiSearch className="absolute left-3 top-3 text-gray-400" size={15} />
                    <input
                        type="text"
                        placeholder="Search by name or school..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary transition"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                            <FiX size={15} />
                        </button>
                    )}
                </div>

                <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
                    {levels.map(level => (
                        <button
                            key={level}
                            onClick={() => setFilterLevel(level)}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${filterLevel === level
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-white border border-gray-200 text-gray-500 hover:border-primary'
                                }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-5 bg-gray-200 rounded" />
                                    <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                                    <div className="flex-1">
                                        <div className="h-3 bg-gray-200 rounded w-32 mb-2" />
                                        <div className="h-2 bg-gray-100 rounded w-20" />
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded w-12" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <GiTrophy size={40} className="mx-auto mb-3 text-gray-200" />
                        <p className="font-bold text-dark mb-1">No students found</p>
                        <p className="text-sm text-gray-400">Try a different search or filter</p>
                    </div>
                ) : (
                    <>
                        {top3.length >= 3 && !search && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-end justify-center gap-3 mb-8"
                            >
                                {podiumOrder.map(({ user, rank, medal, height, color }) => user && (
                                    <div key={user._id} className="flex flex-col items-center flex-1 max-w-[120px]">
                                        <div
                                            className={`rounded-2xl flex items-center justify-center text-white font-extrabold shadow-lg mb-2 ${rank === 1 ? 'w-16 h-16 text-xl ring-4 ring-accent/30' : 'w-12 h-12 text-base'}`}
                                            style={{ backgroundColor: stringToColor(user.school) }}
                                        >
                                            {user.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <p className="text-xs font-bold text-dark text-center truncate w-full px-1">
                                            {user.name?.split(' ')[0]}
                                        </p>
                                        {user.school && (
                                            <span className="text-white font-bold rounded-full px-2 py-0.5 mt-0.5 mb-1"
                                                style={{ backgroundColor: stringToColor(user.school), fontSize: '9px' }}>
                                                {getSchoolAbbr(user.school)}
                                            </span>
                                        )}

                                        <div className={`w-full ${height} ${color} rounded-t-xl flex items-start justify-center pt-2 border border-gray-100`}>
                                            <span className="text-base font-extrabold text-gray-600">{medal}</span>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Rankings</p>
                                <p className="text-xs text-gray-400">{filtered.length} student{filtered.length !== 1 ? 's' : ''}</p>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {filtered.map((user, i) => {
                                    const isMe = user._id === currentUser.id
                                    const rank = i + 1
                                    return (
                                        <motion.div
                                            key={user._id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className={`px-4 py-3.5 flex items-center gap-3 transition-all ${isMe ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-gray-50'}`}
                                        >
                                            <div className="w-7 text-center flex-shrink-0">
                                                {rank === 1 ? <FiAward size={20} className="text-yellow-500" />
                                                    : rank === 2 ? <FiAward size={20} className="text-gray-400" />
                                                        : rank === 3 ? <FiAward size={20} className="text-orange-600" />
                                                            : <span className="text-xs font-bold text-gray-400">#{rank}</span>}
                                            </div>

                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                                style={{ backgroundColor: stringToColor(user.school) }}
                                            >
                                                {user.name?.charAt(0)?.toUpperCase() || 'S'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <p className={`font-semibold text-sm ${isMe ? 'text-primary' : 'text-dark'}`}>
                                                        {user.name}
                                                    </p>
                                                    {isMe && (
                                                        <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-semibold">You</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                    {user.school && (
                                                        <span className="text-white font-bold rounded-full px-2 py-0.5"
                                                            style={{ backgroundColor: stringToColor(user.school), fontSize: '10px' }}>
                                                            {getSchoolAbbr(user.school)}
                                                        </span>
                                                    )}
                                                    {user.level && (
                                                        <span className="text-xs text-gray-400">{user.level}</span>
                                                    )}
                                                    {user.streak > 0 && (
                                                        <span className="flex items-center gap-0.5 text-xs text-orange-500 font-semibold">
                                                            <MdLocalFireDepartment size={11} />
                                                            {user.streak}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-right flex-shrink-0">
                                            <p className="text-xs text-gray-400 mt-0.5">{user.badge || 'Beginner'}</p>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default Leaderboard