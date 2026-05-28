/* eslint-disable no-unused-vars */
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { triggerSOS } from "../api/auth"
import { FiPhone } from "react-icons/fi"
import { MdMedicalServices, MdEmergency } from "react-icons/md"
import { FaFireAlt } from "react-icons/fa"
import { IoShieldCheckmark } from "react-icons/io5"

function SOSButton() {
    const [sent, setSent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const handleSendSOS = async () => {
        setLoading(true)
        setError('')
        try {
            let latitude, longitude, address
            if (navigator.geolocation) {
                try {
                    const pos = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
                    })
                    latitude = pos.coords.latitude
                    longitude = pos.coords.longitude
                    address = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`
                } catch {
                    // ignore location error
                }
            }
            await triggerSOS({ message, latitude, longitude, address })
            setSent(true)
            setShowModal(false)
            setTimeout(() => setSent(false), 5000)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send SOS. Try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="fixed bottom-24 right-4 md:bottom-32 md:right-8 z-40 flex flex-col items-center">
                <AnimatePresence>
                    {sent && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-16 right-0 bg-green-500 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-lg whitespace-nowrap"
                        >
                            ✅ SOS sent! Help is on the way
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    onClick={() => setShowModal(true)}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex flex-col items-center justify-center shadow-lg shadow-red-500/40"
                >
                    <MdEmergency size={18} />
                    <span className="text-[9px] font-bold mt-0.5">SOS</span>
                </motion.button>

                <p className="text-center text-[10px] text-gray-400 mt-1 whitespace-nowrap">
                    Tap for emergency
                </p>
            </div>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
                        onClick={() => !loading && setShowModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center mb-5">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <MdEmergency size={30} className="text-red-500" />
                                </div>
                                <h2 className="text-xl font-extrabold text-dark">Send SOS Alert?</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    This will alert emergency response immediately.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {[
                                    { label: 'Medical Emergency', value: 'I need medical help urgently!', icon: <MdMedicalServices size={18} /> },
                                    { label: 'Safety Threat', value: 'I feel unsafe and need help!', icon: <IoShieldCheckmark size={18} /> },
                                    { label: 'Fire/Disaster', value: 'There is a fire or disaster emergency!', icon: <FaFireAlt size={18} /> },
                                    { label: 'Other Emergency', value: 'I need immediate help!', icon: <FiPhone size={18} /> }
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setMessage(opt.value)}
                                        className={`p-3 rounded-xl text-xs border-2 text-left transition flex gap-2 items-start ${
                                            message === opt.value
                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                : 'border-gray-200 text-gray-600 hover:border-red-300'
                                        }`}
                                    >
                                        {opt.icon}
                                        <span>{opt.label}</span>
                                    </button>
                                ))}
                            </div>

                            <textarea
                                placeholder="Add more details (optional)..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border rounded-xl text-sm mb-4 focus:outline-none focus:border-red-400"
                            />

                            {error && <p className="text-red-500 text-xs mb-3 text-center">{error}</p>}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowModal(false); setMessage(''); setError('') }}
                                    className="flex-1 py-3 border rounded-xl text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendSOS}
                                    disabled={loading || !message.trim()}
                                    className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : 'Send SOS'}
                                </button>
                            </div>

                            <p className="text-center text-xs text-gray-400 mt-3">
                                Emergency alert system active
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default SOSButton