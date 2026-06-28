import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { FiArrowRight, FiBookOpen, FiStar, FiLock, FiUsers, FiPlus, FiCheck, FiAward } from "react-icons/fi"
import { getMe, getMyCommunities, getCommunities, joinCommunity } from "../api/auth"
import { faculties } from '../data/faculties'

const communityIcons = { department: FiBookOpen, faculty: FiStar, school: FiBookOpen, general: FiStar }

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' } })
}

function Community() {
  const router = useRouter()
  const [user, setUser] = useState({})
  const [loading, setLoading] = useState(true)
  const [myComs, setMyComs] = useState([])
  const [facultyComs, setFacultyComs] = useState([])
  const [joining, setJoining] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem('user') || '{}')
        const res = await getMe()
        const userData = res.data
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))

        const myRes = await getMyCommunities()
        const myList = myRes.data.communities || []
        setMyComs(myList)

        if (userData.faculty && userData.school) {
          const facRes = await getCommunities({ faculty: userData.faculty, school: userData.school, type: 'department' })
          const allDepts = facRes.data || []
          const myDeptIds = new Set(myList.filter(c => c.type === 'department').map(c => c._id?.toString()))
          setFacultyComs(allDepts.filter(c => !myDeptIds.has(c._id?.toString())))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleJoin = async (communityId) => {
    setJoining(communityId)
    try {
      await joinCommunity(communityId, 'join')
      const myRes = await getMyCommunities()
      setMyComs(myRes.data.communities || [])
      setFacultyComs(prev => prev.filter(c => c._id?.toString() !== communityId))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join')
    } finally {
      setJoining(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-light md:pl-56 pt-16 md:pt-0 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user.level) {
    return (
      <div className="min-h-screen bg-light md:pl-56 pt-16 md:pt-0">
        <div className="sticky top-0 z-40 bg-dark px-4 md:px-6 py-3 md:py-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Communities</h1>
            <p className="text-xs md:text-sm mt-0.5 text-white/70">Find your people. Share your knowledge</p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <FiAward size={36} className="mb-3" />
          <h2 className="text-xl font-bold text-dark mb-2">Set your education level</h2>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
            You need to set your education level before you can access communities. Go to Settings to update your profile.
          </p>
          <button onClick={() => router.push('/settings')}
            className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition">
            Go to Settings
          </button>
        </div>
      </div>
    )
  }

  const typeLabels = { department: 'Department', faculty: 'Faculty', school: 'School', general: 'General' }
  const typeColors = { department: 'bg-blue-100 text-blue-700', faculty: 'bg-purple-100 text-purple-700', school: 'bg-green-100 text-green-700', general: 'bg-orange-100 text-orange-700' }

  return (
    <div className="min-h-screen bg-light md:pl-56 pt-16 md:pt-0">
        <div className="sticky top-0 z-40 bg-dark px-4 md:px-6 py-3 md:py-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Communities</h1>
            <p className="text-xs md:text-sm mt-0.5 text-white/70">Find your people. Share your knowledge</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-4 md:py-8">

        {myComs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-extrabold text-dark mb-4 flex items-center gap-2">
              <FiUsers size={18} className="text-primary" /> Your Communities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {myComs.sort((a, b) => {
                const order = { department: 0, faculty: 1, school: 2, general: 3 }
                return order[a.type] - order[b.type]
              }).map((c, i) => (
                <motion.div key={c._id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                  className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between hover:shadow-md transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColors[c.type].split(' ')[0]}`}>
                      {(() => {
                        const Icon = communityIcons[c.type] || FiBookOpen
                        return <Icon size={18} className={typeColors[c.type].split(' ')[1].replace('text-', 'text-')} />
                      })()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-dark">{c.type === 'general' ? 'General' : c.name}</p>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${typeColors[c.type]}`}>{typeLabels[c.type] || c.type}</span>
                    </div>
                  </div>
                  <button onClick={() => router.push(c.type === 'general' ? `/community/${user.level?.toLowerCase()}` : `/community/c/${c._id}?name=${encodeURIComponent(c.name)}`)}
                    className="flex items-center gap-1 text-primary text-xs font-semibold hover:underline">
                    View <FiArrowRight size={12} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {user.faculty && facultyComs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-extrabold text-dark mb-4 flex items-center gap-2">
              <FiPlus size={18} className="text-primary" /> More Departments in {user.faculty}
            </h2>
            <p className="text-xs text-gray-400 mb-3">Join any department within your faculty</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {facultyComs.map((c, i) => (
                <motion.div key={c._id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                  className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between hover:shadow-md transition">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark truncate">{c.department}</p>
                    <p className="text-xs text-gray-400">{c.name}</p>
                  </div>
                  <button onClick={() => handleJoin(c._id)} disabled={joining === c._id}
                    className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary/20 transition disabled:opacity-50">
                    {joining === c._id ? 'Joining...' : 'Join'}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {(!user.faculty || facultyComs.length === 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            {[
              {
                id: user.level?.toLowerCase() === 'secondary' ? 'secondary' : 'university',
                name: user.level?.toLowerCase() === 'secondary' ? 'Secondary School Hub' : 'University Hub',
                level: user.level || 'University',
                description: `For ${user.level?.toLowerCase() === 'secondary' ? 'secondary school' : 'university'} students`,
                color: user.level?.toLowerCase() === 'secondary' ? 'from-[#1F2A1F] to-[#2d4a2d]' : 'from-[#d97f00] to-[#FF9F1C]',
                accentColor: user.level?.toLowerCase() === 'secondary' ? '#008751' : '#FF9F1C',
                icon: user.level?.toLowerCase() === 'secondary' ? FiBookOpen : FiStar,
              },
              {
                id: user.level?.toLowerCase() === 'secondary' ? 'university' : 'secondary',
                name: user.level?.toLowerCase() === 'secondary' ? 'University Hub' : 'Secondary School Hub',
                level: user.level?.toLowerCase() === 'secondary' ? 'University' : 'Secondary',
                description: `For ${user.level?.toLowerCase() === 'secondary' ? 'university' : 'secondary school'} students`,
                color: user.level?.toLowerCase() === 'secondary' ? 'from-[#d97f00] to-[#FF9F1C]' : 'from-[#1F2A1F] to-[#2d4a2d]',
                accentColor: user.level?.toLowerCase() === 'secondary' ? '#FF9F1C' : '#008751',
                icon: user.level?.toLowerCase() === 'secondary' ? FiStar : FiBookOpen,
              },
            ].map((c, i) => {
              const isLocked = c.level !== user.level
              return (
                <motion.div key={c.id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                  whileHover={isLocked ? {} : { y: -4 }}
                  className={`bg-white rounded-2xl border ${isLocked ? 'border-gray-200 opacity-70' : 'border-gray-100'} overflow-hidden transition-all duration-300 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer group hover:shadow-xl'}`}>
                  <div className={`bg-gradient-to-r ${c.color} p-4 md:p-5 ${isLocked ? 'opacity-60' : ''}`}>
                    <div className="flex items-center justify-between mb-3">
                      {(() => { const Icon = c.icon; return <Icon size={24} className="text-white" /> })()}
                      {isLocked ? (
                        <span className="bg-black/30 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <FiLock size={11} /> Locked
                        </span>
                      ) : (
                        <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">Active</span>
                      )}
                    </div>
                    <h2 className="text-white font-extrabold text-lg md:text-xl mb-1">{c.name}</h2>
                    <p className="text-white/80 text-xs md:text-sm leading-relaxed">{c.description}</p>
                  </div>
                  <div className="p-4 md:p-5">
                    {isLocked ? (
                      <div className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-gray-100 text-gray-400">
                        <FiLock size={14} /> Not available for {user.level}
                      </div>
                    ) : (
                      <button onClick={() => router.push(`/community/${c.id}`)}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-white hover:opacity-90"
                        style={{ backgroundColor: c.accentColor }}>
                        Enter Community <FiArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}

export default Community
