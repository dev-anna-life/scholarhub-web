/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiSend, FiTrash2, FiZap } from "react-icons/fi"
import { BsRobot, BsShop } from "react-icons/bs"
import Link from "next/link"
import { askBot, getMe } from "../api/auth"

const suggestedQuestions = [
    "Explain photosynthesis simply",
    "How do I solve quadratic equations?",
    "What caused World War 1?",
    "Help me understand supply and demand",
    "What is DNA and RNA difference?",
    "Explain Newton's laws of motion",
    "How does the Nigerian constitution work?",
    "What is organic chemistry?"
]

function StudyBot() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm your ScholarHub Study Bot. Ask me anything and I'll explain it simply for you.",
            time: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
        }
    ])

    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [quota, setQuota] = useState({ limit: 5, used: 0, badge: 'free' })
    const [limitReached, setLimitReached] = useState(false)

    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)

    useEffect(() => {
        getMe().then(r => {
            const u = r.data
            const badge = (u.badgeSubscriptions || []).find(s => new Date(s.expiresAt) > new Date())
            const limits = { free: 5, badge_basic: 20, badge_premium: 50, badge_extra_premium: 9999 }
            const bid = badge?.id || 'free'
            setQuota({ limit: limits[bid] || 5, used: 0, badge: bid })
        }).catch(() => {})
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async (text) => {
        const messageText = text || input.trim()
        if (!messageText || loading) return

        const userMessage = {
            role: 'user',
            content: messageText,
            time: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
        }

        const updatedMessages = [...messages, userMessage]
        setMessages(updatedMessages)
        setInput('')
        setLoading(true)

        try {
            const apiMessages = updatedMessages.map(m => ({
                role: m.role === "assistant" ? "model" : "user",
                content: m.content
            }))

            const res = await askBot(apiMessages)
            if (res.data.quota) setQuota(res.data.quota)

            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: res.data.reply,
                    time: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
                }
            ])
        } catch (err) {
            const data = err.response?.data
            if (data?.limit) {
                setQuota({ limit: data.limit, used: data.used, badge: data.badge })
                setLimitReached(true)
                setMessages(prev => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: data.message || "You've reached your daily limit.",
                        time: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
                    }
                ])
            } else {
                setMessages(prev => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: "Sorry, I'm having trouble connecting. Please try again.",
                        time: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
                    }
                ])
            }
        } finally {
            setLoading(false)
        }
    }

    const clearChat = () => {
        setMessages([
            {
                role: 'assistant',
                content: "Chat cleared! What would you like to learn today?",
                time: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
            }
        ])
    }

    return (
        <div className="min-h-screen bg-light md:pl-56 pt-16 md:pt-0 flex flex-col">

            <div className="bg-dark px-4 py-4 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                        <BsRobot size={20} className="text-white" />
                    </div>

                    <div>
                        <p className="text-white font-bold text-sm">Study Bot</p>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <p className="text-gray-400 text-xs">Online</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/10 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                            <FiZap size={12} className="text-yellow-400" />
                            <div className="flex items-center gap-1">
                                <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min((quota.used / quota.limit) * 100, 100)}%` }} />
                                </div>
                                <span className="text-xs text-gray-400 min-w-[40px] text-right">{quota.used}/{quota.limit}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={clearChat}
                        className="p-2 text-gray-400 hover:text-white transition rounded-xl hover:bg-white/10"
                    >
                        <FiTrash2 size={18} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4 max-w-3xl mx-auto w-full">

                {messages.length === 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <p className="text-xs text-gray-400 mb-3 flex items-center gap-2">
                            <FiZap size={12} /> Quick questions
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {suggestedQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(q)}
                                    className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 hover:border-primary hover:text-primary transition"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                <div className="flex flex-col gap-4">

                    <AnimatePresence>
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary' : 'bg-dark'}`}>
                                    <BsRobot size={14} className="text-white" />
                                </div>

                                <div className="flex flex-col max-w-[85%] sm:max-w-[80%] md:max-w-[70%]">

                                    <div className={`px-4 py-3 rounded-2xl text-sm leading-7 break-words whitespace-pre-wrap shadow-sm ${
                                        msg.role === 'user'
                                            ? 'bg-primary text-white rounded-tr-sm'
                                            : 'bg-white border border-gray-100 text-dark rounded-tl-sm'
                                    }`}>
                                        {msg.content.split('\n').map((line, i) => (
                                            <p key={i} className="mb-2 last:mb-0">
                                                {line}
                                            </p>
                                        ))}
                                    </div>

                                    <p className="text-xs text-gray-400 mt-1 px-1">
                                        {msg.time}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {loading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 bg-dark rounded-xl flex items-center justify-center">
                                <BsRobot size={14} className="text-white" />
                            </div>

                            <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                <div ref={messagesEndRef} />
            </div>

            <div className="sticky bottom-0 bg-light border-t border-gray-100 px-3 py-3">

                <div className="max-w-3xl mx-auto flex items-end gap-2">

                    <div className="flex-1 min-w-0">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    sendMessage()
                                }
                            }}
                            placeholder="Ask anything..."
                            rows={1}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm resize-none focus:outline-none focus:border-primary overflow-hidden"
                            style={{ minHeight: '50px', maxHeight: '140px' }}
                        />
                    </div>

                    <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || loading}
                        className="w-12 h-12 min-w-[48px] bg-primary text-white rounded-2xl flex items-center justify-center disabled:opacity-50"
                    >
                        <FiSend size={18} />
                    </button>

                </div>

                {limitReached && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-2 flex items-center justify-between">
                        <p className="text-xs text-amber-700">Daily limit reached. Upgrade to keep chatting.</p>
                        <Link href="/shop" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                            <BsShop size={12} /> Shop
                        </Link>
                    </div>
                )}

                <p className="text-center text-xs text-gray-400 mt-2">
                    Enter to send • Shift + Enter for new line
                </p>

            </div>
        </div>
    )
}

export default StudyBot