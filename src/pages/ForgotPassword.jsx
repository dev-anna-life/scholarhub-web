/* eslint-disable no-unused-vars */
import { useState } from "react";
import { motion } from "framer-motion"
import { FiMail, FiArrowLeft } from "react-icons/fi"
import Link from "next/link"
import { forgotPassword } from "../api/auth";

function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        if (!email.trim()) { setError('Email is required'); return }
        setLoading(true)
        setError('')
        try {
            await forgotPassword(email)
            setSuccess(true)
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-light flex items-center justify-center px-4">
            <motion.div
                className="form-card w-full max-w-md p-8"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            >
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-extrabold text-dark">
                        Scholar<span className="text-accent">Hub</span>
                    </h1>
                </div>

                {success ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FiMail size={28} className="text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-dark mb-2">Check your email</h2>
                        <p className="text-ray-400 text-sm mb-6">We sent a password reset link to <span className="text-dark font-medium">{email}</span></p>
                        <Link href="/login" className="text-primary font-semibold text-sm">Back to Sign In</Link>
                    </motion.div>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-dark mb-1">Forgot Password?</h2>
                        <p className="text-sm text-gray-400 mb-6">Enter your email and we'll send a reset link</p>

                        <div className="relative mb-4">
                            <FiMail className="absolute left-3 top-3.5 text-gray-500" size={16} />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="input-field"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                        <button onClick={handleSubmit} disabled={loading} className="btn-primary mb-4">
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>

                        <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-primary transition">
                            <FiArrowLeft size={14} /> Back to Sign In
                        </Link>
                    </>
                )}
            </motion.div>
        </div>
    )
}

export default ForgotPassword