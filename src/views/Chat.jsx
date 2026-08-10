'use client'
/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiSend, FiSearch, FiArrowLeft, FiX, FiMessageCircle, FiCheck } from "react-icons/fi"
import { getConversations, getMessages, sendMessage, markMessagesAsRead, searchUsers, getUserById, followUser } from "../api/auth"
import { useSearchParams } from "next/navigation"

const knownAbbreviations = {
    'university of lagos': 'UNILAG', 'unilag': 'UNILAG',
    'obafemi awolowo university': 'OAU', 'oau ile-ife': 'OAU',
    'ahmadu bello university': 'ABU', 'covenant university': 'CU',
    'enugu state university of technology (esut)': 'ESUT',
    'enugu state university of technology': 'ESUT', 'esut': 'ESUT',
    'university of ghana': 'UG', 'university of nairobi': 'UON',
    'makerere university': 'MAK',
}

const schoolColors = {
    'university of lagos': '#003366', 'unilag': '#003366',
    'oau ile-ife': '#006400', 'obafemi awolowo university': '#006400',
    'covenant university': '#722F37',
    'enugu state university of technology (esut)': '#006400',
    'enugu state university of technology': '#006400',
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

function Avatar({ name, school, size = 'md' }) {
    const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }
    return (
        <div className={`${sizes[size]} rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0`}
            style={{ backgroundColor: stringToColor(school) }}>
            {name?.charAt(0)?.toUpperCase() || '?'}
        </div>
    )
}

function Chat() {
    const [conversations, setConversations] = useState([])
    const [activeChat, setActiveChat] = useState(null)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const messagesEndRef = useRef(null)
    const searchRef = useRef(null)
    const searchParams = useSearchParams()
    const [activeChatDetails, setActiveChatDetails] = useState(null)
    const [followingChatUser, setFollowingChatUser] = useState(false)
    const [followLoading, setFollowLoading] = useState(false)

    useEffect(() => {
        try { setUser(JSON.parse(localStorage.getItem('user') || '{}')) } catch (e) {}
    }, [])

    useEffect(() => {
        fetchConversations()
        const interval = setInterval(fetchConversations, 10000)
        return () => clearInterval(interval)
    }, [])

    // Handle opening chat from URL param e.g. /chat?user=userId
    useEffect(() => {
        const userId = searchParams.get('user')
        if (userId) {
            const openUserChat = async () => {
                try {
                    const existingConv = conversations.find(c => {
                        const cId = c.user?.id || c.user?._id
                        return cId === userId || cId?.toString() === userId?.toString()
                    })
                    if (existingConv) {
                        openChat(existingConv.user)
                        return
                    }
                    const userRes = await getUserById(userId).catch(() => null)
                    const chatUser = userRes?.data || { id: userId, name: 'Scholar', school: '', level: '' }
                    openChat(chatUser)
                } catch (err) {
                    console.error(err)
                    openChat({ id: userId, name: 'Scholar', school: '', level: '' })
                }
            }
            openUserChat()
        }
    }, [searchParams])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([])
            return
        }
        const timer = setTimeout(async () => {
            setSearching(true)
            try {
                const res = await searchUsers(searchQuery)
                setSearchResults(res.data)
            } catch (err) {
                console.error(err)
            } finally {
                setSearching(false)
            }
        }, 400)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const fetchConversations = async () => {
        try {
            const res = await getConversations()
            setConversations(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const openChat = async (chatUser) => {
        const chatId = chatUser.id || chatUser._id
        setActiveChat(chatUser)
        setActiveChatDetails(null)
        setFollowingChatUser(false)
        setShowSearch(false)
        setSearchQuery('')
        setSearchResults([])
        try {
            const [msgRes, userRes] = await Promise.all([
                getMessages(chatId),
                getUserById(chatId).catch(() => null),
                markMessagesAsRead(chatId).catch(() => {}),
            ])
            setMessages(msgRes.data || [])
            if (userRes?.data) {
                setActiveChatDetails(userRes.data)
                setFollowingChatUser(!!userRes.data.isFollowing)
            }
            setConversations(prev => prev.map(c => {
                const cId = c.user?.id || c.user?._id
                return cId === chatId ? { ...c, unread: 0 } : c
            }))
        } catch (err) {
            console.error(err)
        }
    }

    const handleFollowActiveUser = async () => {
        if (!activeChat || followLoading) return
        const chatId = activeChat.id || activeChat._id
        setFollowLoading(true)
        const wasFollowing = followingChatUser
        setFollowingChatUser(!wasFollowing)
        try {
            await followUser(chatId)
            const userRes = await getUserById(chatId).catch(() => null)
            if (userRes?.data) {
                setActiveChatDetails(userRes.data)
                setFollowingChatUser(!!userRes.data.isFollowing)
            }
        } catch (err) {
            setFollowingChatUser(wasFollowing)
        } finally {
            setFollowLoading(false)
        }
    }

    const startNewChat = (searchUser) => {
        const searchId = searchUser.id || searchUser._id
        const existing = conversations.find(c => (c.user?.id || c.user?._id) === searchId)
        if (existing) {
            openChat(searchUser)
        } else {
            setActiveChat(searchUser)
            setMessages([])
            setShowSearch(false)
            setSearchQuery('')
        }
    }

    const handleSend = async () => {
        if (!input.trim() || !activeChat || sending) return
        const activeChatId = activeChat.id || activeChat._id
        if (!activeChatId) return
        setSending(true)
        const text = input.trim()
        setInput('')

        const tempMsg = {
            _id: Date.now(),
            sender: { _id: user.id || user._id, name: user.name },
            receiver: { _id: activeChatId },
            text,
            createdAt: new Date().toISOString(),
            temp: true
        }
        setMessages(prev => [...prev, tempMsg])

        try {
            const res = await sendMessage(activeChatId, text)
            setMessages(prev => prev.map(m => m._id === tempMsg._id ? res.data : m))
            await fetchConversations()
        } catch (err) {
            console.error('Send failed:', err)
            setMessages(prev => prev.filter(m => m._id !== tempMsg._id))
            setInput(text)
        } finally {
            setSending(false)
        }
    }

    const formatTime = (date) => new Date(date).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
    const formatDate = (date) => {
        const d = new Date(date)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        if (d.toDateString() === today.toDateString()) return 'Today'
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
        return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
    }

    const totalUnread = conversations.reduce((acc, c) => acc + (c.unread || 0), 0)

    return (
        <div className="h-screen bg-light md:pl-56 pt-16 md:pt-0 flex">

            <div className={`${activeChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 bg-white border-r border-gray-100 flex-shrink-0`}>
                <div className="px-4 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h1 className="text-lg font-extrabold text-dark">Messages</h1>
                            {totalUnread > 0 && (
                                <p className="text-xs text-primary font-semibold">{totalUnread} unread</p>
                            )}
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowSearch(!showSearch)}
                            className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center hover:bg-primary/20 transition"
                        >
                            {showSearch ? <FiX size={16} /> : <FiSearch size={16} />}
                        </motion.button>
                    </div>

                    <AnimatePresence>
                        {showSearch && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <div className="relative">
                                    <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={14} />
                                    <input
                                        ref={searchRef}
                                        type="text"
                                        placeholder="Search students..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        autoFocus
                                        className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary transition"
                                    />
                                </div>
                                {searchResults.length > 0 && (
                                    <div className="mt-2 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-md">
                                        {searchResults.map(u => (
                                            <button
                                                key={u._id}
                                                onClick={() => startNewChat(u)}
                                                className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0"
                                            >
                                                <Avatar name={u.name} school={u.school} size="sm" />
                                                <div className="flex-1 text-left min-w-0">
                                                    <p className="text-sm font-semibold text-dark truncate">{u.name}</p>
                                                    <div className="flex items-center gap-1.5">
                                                        {u.school && (
                                                            <span className="text-white font-bold rounded-full px-1.5 py-0.5"
                                                                style={{ backgroundColor: stringToColor(u.school), fontSize: '9px' }}>
                                                                {getSchoolAbbr(u.school)}
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-gray-400">{u.level}</span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {searching && <p className="text-xs text-gray-400 mt-2 text-center">Searching...</p>}
                                {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                                    <p className="text-xs text-gray-400 mt-2 text-center">No students found</p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col gap-2 p-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-3 animate-pulse">
                                    <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                                    <div className="flex-1">
                                        <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
                                        <div className="h-2 bg-gray-100 rounded w-32" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                                <FiMessageCircle size={28} className="text-primary" />
                            </div>
                            <p className="font-bold text-dark mb-1">No messages yet</p>
                            <p className="text-sm text-gray-400 mb-4">Search for a student to start chatting</p>
                            <button
                                onClick={() => setShowSearch(true)}
                                className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold"
                            >
                                Find Students
                            </button>
                        </div>
                    ) : (
                        conversations.map(conv => {
                            if (!conv?.user) return null
                            const lastMsg = conv.lastMessage
                            return (
                            <motion.button
                                key={conv.user._id}
                                onClick={() => openChat(conv.user)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition border-b border-gray-50 ${activeChat?._id === conv.user._id ? 'bg-primary/5 border-l-2 border-primary' : ''}`}
                            >
                                <div className="relative">
                                    <Avatar name={conv.user.name} school={conv.user.school} />
                                    {conv.unread > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-white text-xs flex items-center justify-center font-bold">
                                            {conv.unread}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <p className="text-sm font-semibold text-dark truncate">{conv.user.name}</p>
                                        <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                            {lastMsg?.createdAt ? formatTime(lastMsg.createdAt) : ''}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className={`text-xs truncate flex-1 ${conv.unread > 0 ? 'text-dark font-semibold' : 'text-gray-400'}`}>
                                            {lastMsg?.sender?._id === user.id ? 'You: ' : ''}
                                            {lastMsg?.text || ''}
                                        </p>
                                        {conv.user.school && (
                                            <span className="text-white font-bold rounded-full px-1.5 py-0.5 ml-2 flex-shrink-0"
                                                style={{ backgroundColor: stringToColor(conv.user.school), fontSize: '9px' }}>
                                                {getSchoolAbbr(conv.user.school)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.button>
                            )
                        })
                    )}
                </div>
            </div>

            {activeChat ? (
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                        <button
                            onClick={() => setActiveChat(null)}
                            className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition"
                        >
                            <FiArrowLeft size={18} className="text-dark" />
                        </button>
                        <Avatar name={activeChat.name} school={activeChat.school} />
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-dark text-sm truncate">{activeChat.name}</p>
                            <div className="flex items-center gap-2">
                                {activeChat.school && (
                                    <span className="text-white font-bold rounded-full px-2 py-0.5"
                                        style={{ backgroundColor: stringToColor(activeChat.school), fontSize: '10px' }}>
                                        {getSchoolAbbr(activeChat.school)}
                                    </span>
                                )}
                                <span className="text-xs text-gray-400">{activeChat.level}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-4 bg-light">
                        <div className="flex flex-col gap-2 max-w-2xl mx-auto">
                            {/* TikTok Style Top Profile Card */}
                            <div className="flex flex-col items-center justify-center text-center py-6 px-4 mb-4 border-b border-gray-200/60">
                                <Avatar name={activeChat.name} school={activeChat.school} size="lg" />
                                <h2 className="font-extrabold text-dark text-base mt-2.5">{activeChat.name}</h2>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">
                                    @{activeChatDetails?.username || activeChat.username || activeChat.name?.toLowerCase().replace(/\s+/g, '')}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500 font-medium">
                                    <span>{activeChatDetails?.followingCount ?? 0} following</span>
                                    <span>·</span>
                                    <span>{activeChatDetails?.followersCount ?? 0} followers</span>
                                </div>
                                {activeChat.school && (
                                    <span className="mt-2 text-white font-bold rounded-full px-2.5 py-0.5" style={{ backgroundColor: stringToColor(activeChat.school), fontSize: '10px' }}>
                                        {getSchoolAbbr(activeChat.school)}
                                    </span>
                                )}
                                {!followingChatUser && (
                                    <button
                                        onClick={handleFollowActiveUser}
                                        disabled={followLoading}
                                        className="mt-3 px-5 py-1.5 bg-primary text-white rounded-xl text-xs font-semibold hover:opacity-90 transition flex items-center gap-1 shadow-sm shadow-primary/20"
                                    >
                                        {followingChatUser ? 'Following' : 'Follow'}
                                    </button>
                                )}
                            </div>

                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <p className="text-xs text-gray-400">No messages yet. Send a message request below!</p>
                                </div>
                            ) : (
                                messages.map((msg, i) => {
                                    if (!msg?.sender) return null
                                    const isMe = msg.sender._id === user.id || msg.sender._id === user._id
                                    const showDate = i === 0 || formatDate(messages[i - 1]?.createdAt) !== formatDate(msg.createdAt)
                                    return (
                                        <div key={msg._id}>
                                            {showDate && (
                                                <div className="flex items-center justify-center my-3">
                                                    <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">
                                                        {formatDate(msg.createdAt)}
                                                    </span>
                                                </div>
                                            )}
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                                            >
                                                {!isMe && <Avatar name={msg.sender.name} school={msg.sender.school} size="sm" />}
                                                <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-primary text-white rounded-tr-sm'
                                                            : 'bg-white text-dark border border-gray-100 rounded-tl-sm shadow-sm'
                                                        } ${msg.temp ? 'opacity-70' : ''}`}>
                                                        {msg.text}
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-0.5 px-1">
                                                        {formatTime(msg.createdAt)}
                                                        {isMe && !msg.temp && <span className="ml-1 text-primary"><FiCheck size={12} /></span>}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* TikTok Style Message Request Banner */}
                    {!followingChatUser && (
                        <div className="bg-slate-900 text-white border-t border-slate-800 px-4 py-3 shadow-lg">
                            <div className="max-w-2xl mx-auto flex items-start gap-3">
                                <div className="w-9 h-9 bg-primary/20 text-primary rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <FiMessageCircle size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-white truncate">
                                        Send message request to {activeChat.name?.split(' ')[0] || activeChat.name}
                                    </p>
                                    <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
                                        You can send a direct message until the user replies. You can also follow them to stay connected.
                                    </p>
                                </div>
                                <button
                                    onClick={handleFollowActiveUser}
                                    disabled={followLoading}
                                    className="bg-primary text-white text-xs font-semibold px-3.5 py-2 rounded-xl hover:opacity-90 transition flex-shrink-0 shadow-md shadow-primary/20"
                                >
                                    {followingChatUser ? 'Following' : 'Follow'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="bg-white border-t border-gray-100 px-4 py-3">
                        <div className="max-w-2xl mx-auto flex gap-2 items-end">
                            <textarea
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSend()
                                    }
                                }}
                                placeholder={`Message ${activeChat.name?.split(' ')[0]}...`}
                                rows={1}
                                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-primary transition resize-none"
                                style={{ minHeight: '48px', maxHeight: '120px' }}
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSend}
                                disabled={!input.trim() || sending}
                                className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 disabled:opacity-50 flex-shrink-0"
                            >
                                <FiSend size={18} />
                            </motion.button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center bg-light">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <FiMessageCircle size={36} className="text-primary" />
                        </div>
                        <p className="font-extrabold text-dark text-xl mb-2">Your Messages</p>
                        <p className="text-gray-400 text-sm mb-6">Select a conversation or search for a student to start chatting</p>
                        <button
                            onClick={() => setShowSearch(true)}
                            className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition"
                        >
                            Start a Conversation
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Chat