/* eslint-disable no-unused-vars */
import { useState } from "react";
import { motion } from "framer-motion"
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { loginUser } from "../api/auth"
import { GoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../api/auth";

function Login() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState([])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    const newErrors = {}
    if (!form.email.trim()) newErrors.email = 'Email is required'
    if (!form.password.trim()) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async () => {
    if (!validate()) return
    setLoading(true)
    setError('')
    try {
      const res = await loginUser(form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      router.push('/feed')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-light flex items-center justify-center x-4 py-10">
      <motion.div
        className="form-card w-full max-w-md p-8"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-dark">
            Scholar<span className="text-accent">Hub</span>
          </h1>
          <p className="text-sm text-gray-400 mt-2">Welcome Back 👋</p>
        </div>

        <div id="google-login-wrapper" className="w-full mb-4 overflow-hidden">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                setError('')
                const res = await googleAuth(credentialResponse.credential)
                localStorage.setItem('token', res.data.token)
                localStorage.setItem('user', JSON.stringify(res.data.user))
                if (res.data.isNewUser) {
                  router.push('/onboarding')
                } else {
                  router.push('/feed')
                }
              } catch (err) {
                setError(err.response?.data?.message || 'Google login failed. Check console for details.')
                console.error('Google auth error:', err.response?.data || err.message)
              }
            }}
            onError={() => setError('Google sign-in popup failed. Try again.')}
            width="400"
            text="continue_with"
            shape="rectangular"
            theme="outline"
            useOneTap={false}
          />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="space-y-3 mb-6">
          <div className="relative">
            <FiMail className="absolute left-3 top-3.5 text-gray-400" size={16} />
            <input name="email" type="email" placeholder="Email Address" onChange={handleChange} className={`input-field ${errors.email ? 'border-red-400' : ''}`} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div className="relative">
            <FiLock className="absolute left-3 top-3.5 text-gray-400" size={16} />
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password (min 8 characters)"
              value={form.password}
              onChange={handleChange}
              className={`input-field ${errors.password ? 'border-red-400' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-primary transition"
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
        </div>

        <div className="text-right mb-6">
          <Link href="/forgot-password" className="text-sm text-primary font-medium">
            Forgot your password?
          </Link>
        </div>

        {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

        <button onClick={handleLogin} disabled={loading} className="btn-primary">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-sm text-gray-400 mt-4 text-center">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary font-medium">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  )
}

export async function getServerSideProps() {
  return { props: {} }
}

export default Login