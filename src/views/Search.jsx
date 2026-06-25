import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FiSearch, FiUser } from "react-icons/fi"
import { useRouter } from 'next/navigation'
import { getSchoolAbbr, stringToColor } from '../utils/school'
import axios from 'axios'

function Search() {
    const router = useRouter()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (query.trim().length < 2) { setResults([]); return }
        const timer = setTimeout(async () => {
            setLoading(true)
            try {
                const token = localStorage.getItem('token')
                const res = await axios.get(`https://scholarhub-api.vercel.app/api/chat/users/search?q=${encodeURIComponent(query)}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setResults(res.data || [])
            } catch (_) { setResults([]) }
            finally { setLoading(false) }
        }, 300)
        return () => clearTimeout(timer)
    }, [query])

    return (
        <div className="min-h-screen bg-light md:pl-56 pt-16 md:pt-0">
            <div className="sticky top-0 md:top-0 z-40 bg-light/95 backdrop-blur-md border-b border-gray-100 px-4 md:px-6 py-3 md:py-4">
                <div className="max-w-3xl mx-auto flex items-center gap-2">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search students by name, username or school..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary transition"
                            autoFocus
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6">
                {loading && (
                    <div className="flex justify-center py-12">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {!loading && results.length === 0 && query.trim().length >= 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center py-16 text-gray-400">
                        <p className="text-4xl mb-3">🔍</p>
                        <p className="text-base font-semibold mb-1">No students found</p>
                        <p className="text-sm">Try a different name, username or school</p>
                    </motion.div>
                )}

                {!loading && query.trim().length < 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center py-16 text-gray-400">
                        <p className="text-4xl mb-3">👤</p>
                        <p className="text-base font-semibold mb-1">Search for students</p>
                        <p className="text-sm">Type a name, username or school to find students</p>
                    </motion.div>
                )}

                <div className="flex flex-col gap-2">
                    {results.map((user, i) => (
                        <motion.div
                            key={user._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => router.push(`/profile/${user._id}`)}
                            className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all duration-200">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                                {user.name?.charAt(0) || <FiUser size={16} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-dark text-sm truncate">{user.name}</p>
                                {user.username && (
                                    <p className="text-xs text-gray-400">@{user.username}</p>
                                )}
                                <div className="flex items-center gap-2 mt-0.5">
                                    {user.school && (
                                        <span className="text-white font-bold px-1.5 py-0.5 rounded-full"
                                            style={{ backgroundColor: stringToColor(user.school), fontSize: '9px' }}>
                                            {getSchoolAbbr(user.school)}
                                        </span>
                                    )}
                                    {user.level && (
                                        <span className="text-[10px] text-gray-400 font-medium">{user.level}</span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Search
