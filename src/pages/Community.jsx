/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { FiUsers, FiArrowRight, FiBookOpen, FiTrendingUp, FiStar, FiZap, FiAward, FiMapPin, FiSearch } from "react-icons/fi"
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

const secondarySchools = [
    { name: 'King\'s College, Lagos', location: 'Lagos, Nigeria', country: 'Nigeria', level: 'Secondary', color: '#1F2A1F' },
    { name: 'Alliance High School', location: 'Nairobi, Kenya', country: 'Kenya', level: 'Secondary', color: '#008751' },
    { name: 'St. George\'s College', location: 'Nairobi, Kenya', country: 'Kenya', level: 'Secondary', color: '#2d4a2d' },
    { name: 'Loyola Jesuit College', location: 'Abuja, Nigeria', country: 'Nigeria', level: 'Secondary', color: '#FF9F1C' },
    { name: 'Achimota School', location: 'Accra, Ghana', country: 'Ghana', level: 'Secondary', color: '#1F2A1F' },
    { name: 'Ghana National College', location: 'Cape Coast, Ghana', country: 'Ghana', level: 'Secondary', color: '#008751' },
    { name: 'St. John\'s College', location: 'Johannesburg, South Africa', country: 'South Africa', level: 'Secondary', color: '#2d4a2d' },
    { name: 'Bishops Diocesan College', location: 'Cape Town, South Africa', country: 'South Africa', level: 'Secondary', color: '#FF9F1C' },
    { name: 'St. Mary\'s School', location: 'Nairobi, Kenya', country: 'Kenya', level: 'Secondary', color: '#1F2A1F' },
    { name: 'Government Secondary School, Enugu', location: 'Enugu, Nigeria', country: 'Nigeria', level: 'Secondary', color: '#008751' },
    { name: 'Queen\'s College', location: 'Lagos, Nigeria', country: 'Nigeria', level: 'Secondary', color: '#2d4a2d' },
    { name: 'Federal Government College, Ilorin', location: 'Ilorin, Nigeria', country: 'Nigeria', level: 'Secondary', color: '#FF9F1C' },
    { name: 'Lycée Sainte Famille', location: 'Abidjan, Côte d\'Ivoire', country: 'Côte d\'Ivoire', level: 'Secondary', color: '#1F2A1F' },
    { name: 'International School of Kenya', location: 'Nairobi, Kenya', country: 'Kenya', level: 'Secondary', color: '#008751' },
    { name: 'SOS Hermann Gmeiner School', location: 'Addis Ababa, Ethiopia', country: 'Ethiopia', level: 'Secondary', color: '#2d4a2d' },
    { name: 'St. Augustine\'s College', location: 'Cape Coast, Ghana', country: 'Ghana', level: 'Secondary', color: '#FF9F1C' },
    { name: 'Mpesa Foundation Academy', location: 'Nairobi, Kenya', country: 'Kenya', level: 'Secondary', color: '#1F2A1F' },
    { name: 'Hillcrest Secondary School', location: 'Nairobi, Kenya', country: 'Kenya', level: 'Secondary', color: '#008751' },
    { name: 'St. Joseph\'s College', location: 'Durban, South Africa', country: 'South Africa', level: 'Secondary', color: '#2d4a2d' },
    { name: 'St. Charles Lwanga School', location: 'Kampala, Uganda', country: 'Uganda', level: 'Secondary', color: '#FF9F1C' },
]

const universities = [
    { name: 'University of Cape Town', location: 'Cape Town, South Africa', country: 'South Africa', level: 'University', color: '#1F2A1F' },
    { name: 'University of the Witwatersrand', location: 'Johannesburg, South Africa', country: 'South Africa', level: 'University', color: '#008751' },
    { name: 'Stellenbosch University', location: 'Stellenbosch, South Africa', country: 'South Africa', level: 'University', color: '#2d4a2d' },
    { name: 'University of Ibadan', location: 'Ibadan, Nigeria', country: 'Nigeria', level: 'University', color: '#FF9F1C' },
    { name: 'Obafemi Awolowo University', location: 'Ile-Ife, Nigeria', country: 'Nigeria', level: 'University', color: '#1F2A1F' },
    { name: 'University of Lagos', location: 'Lagos, Nigeria', country: 'Nigeria', level: 'University', color: '#008751' },
    { name: 'University of Ghana', location: 'Accra, Ghana', country: 'Ghana', level: 'University', color: '#2d4a2d' },
    { name: 'University of Nairobi', location: 'Nairobi, Kenya', country: 'Kenya', level: 'University', color: '#FF9F1C' },
    { name: 'Cairo University', location: 'Giza, Egypt', country: 'Egypt', level: 'University', color: '#1F2A1F' },
    { name: 'Makerere University', location: 'Kampala, Uganda', country: 'Uganda', level: 'University', color: '#008751' },
    { name: 'University of Dar es Salaam', location: 'Dar es Salaam, Tanzania', country: 'Tanzania', level: 'University', color: '#2d4a2d' },
    { name: 'Addis Ababa University', location: 'Addis Ababa, Ethiopia', country: 'Ethiopia', level: 'University', color: '#FF9F1C' },
    { name: 'University of Pretoria', location: 'Pretoria, South Africa', country: 'South Africa', level: 'University', color: '#1F2A1F' },
    { name: 'Rhodes University', location: 'Makhanda, South Africa', country: 'South Africa', level: 'University', color: '#008751' },
    { name: 'Covenant University', location: 'Ota, Nigeria', country: 'Nigeria', level: 'University', color: '#2d4a2d' },
    { name: 'University of Johannesburg', location: 'Johannesburg, South Africa', country: 'South Africa', level: 'University', color: '#FF9F1C' },
    { name: 'Kwame Nkrumah University of Science and Technology', location: 'Kumasi, Ghana', country: 'Ghana', level: 'University', color: '#1F2A1F' },
    { name: 'University of Khartoum', location: 'Khartoum, Sudan', country: 'Sudan', level: 'University', color: '#008751' },
    { name: 'University of Botswana', location: 'Gaborone, Botswana', country: 'Botswana', level: 'University', color: '#2d4a2d' },
    { name: 'Université Cheikh Anta Diop', location: 'Dakar, Senegal', country: 'Senegal', level: 'University', color: '#FF9F1C' },
]

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
    const schools = userLevel === 'University' ? universities : secondarySchools

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

                <div className="mt-10 md:mt-12">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div>
                            <h2 className="text-lg md:text-xl font-extrabold text-dark flex items-center gap-2">
                                <FiMapPin className="text-primary" size={20} /> {userLevel === 'University' ? 'Top Universities in Africa' : 'Top Secondary Schools in Africa'}
                            </h2>
                            <p className="text-xs md:text-sm text-gray-400 mt-0.5">
                                {userLevel === 'University' ? 'Connect with students from leading universities across Africa' : 'Connect with students from leading secondary schools across Africa'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {schools.map((school, i) => (
                            <motion.div key={school.name} custom={i + 5} variants={fadeUp} initial="hidden" animate="visible"
                                whileHover={{ y: -3 }}
                                className="bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                                onClick={() => router.push(`/school/${encodeURIComponent(school.name)}`)}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                        style={{ backgroundColor: school.color }}>
                                        {school.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-dark text-sm truncate">{school.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{school.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <FiMapPin size={12} />
                                        <span className="truncate">{school.country}</span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); router.push(`/school/${encodeURIComponent(school.name)}`) }}
                                        className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all duration-200">
                                        View
                                    </button>
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
