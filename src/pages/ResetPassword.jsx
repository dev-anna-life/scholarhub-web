/* eslint-disable no-unused-vars */
import { useState } from "react";
import { motion } from "framer-motion"
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi"
import { useParams, useRouter } from "next/navigation"
import { resetPassword } from "../api/auth";

function ResetPassword() {
    const params = useParams() || {}
    const token = params.token
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleReset = async () => {
        if (!password.trim()) { setError('Password is required'); return }
        if (password.length < 8) { setError('Password must be at least 8 characters'); return }
        if (password !== confirm) { setError('Passwords do not match'); return }
        setLoading(true)
        setError('')
        try {
            await resetPassword(token, password)
            router.push('/login')
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
                        Scholar<span className="text-primary">Hub</span>
                    </h1>
                </div>

                <h2 className="text-xl font-bold text-dark mb-1">Reset your password</h2>
                <p className="text-sm text-gray-400 mb-6">Enter your new password below</p>

                <div className="space-y-3 mb-4">
                    <div className="relative">
                        <FiLock className="absolute left-3 top-3.5 text-gray-400" size={16} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="New password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="input-field"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-gray-400 hover:text-primary transition"
                        >
                            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                    </div>
                    <div className="relative">
                        <FiLock className="absolute left-3 top-3.5 text-gray-400" size={16} />
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            className="input-field"
                        />
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                <button onClick={handleReset} disabled={loading} className="btn-primary">
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
            </motion.div>
        </div>
    )

}

export default ResetPassword 