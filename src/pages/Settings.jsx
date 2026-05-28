/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiUser, FiMail, FiLock, FiPhone, FiLogOut, FiTrash2, FiCheck, FiEye, FiEyeOff, FiSettings, FiBell, FiShield, FiMoon, FiSun, FiGlobe, FiChevronRight, FiAlertTriangle, FiX, FiSave, FiEdit2, FiBookOpen } from "react-icons/fi"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getMe, updateProfile, updateSchool, changePassword as changePasswordAPI } from "../api/auth"
import { courses } from '../data/courses'

function Settings() {
  const router = useRouter()
  const [user, setUser] = useState({})
  const [darkMode, setDarkMode] = useState(false)
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [pushNotifs, setPushNotifs] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [profileVisibility, setProfileVisibility] = useState('public')
  const [twoFactor, setTwoFactor] = useState(false)
  const [activeSection, setActiveSection] = useState('account')
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', phone: '' })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteText, setDeleteText] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [schoolForm, setSchoolForm] = useState({ level: '', school: '', state: '', course: '' })
  const [saveSuccess, setSaveSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('darkMode')
    if (stored === 'true') setDarkMode(true)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getMe()
        setUser(res.data)
        setEditForm({ name: res.data.name || '', phone: res.data.phone || '' })
        setSchoolForm({ level: res.data.level || '', school: res.data.school || '', state: res.data.state || '', course: res.data.course || '' })
        setTwoFactor(res.data.twoFactorEnabled || false)
        localStorage.setItem('user', JSON.stringify(res.data))
      } catch (err) {
        console.error('Failed to fetch user:', err)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  const showSuccess = (msg) => {
    setSaveSuccess(msg)
    setTimeout(() => setSaveSuccess(''), 3000)
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
  }

  const handleUpdateProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await updateProfile(editForm)
      setUser(res.data)
      localStorage.setItem('user', JSON.stringify(res.data))
      showSuccess('Profile updated')
      setEditMode(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    setLoading(true)
    setError('')
    if (passwordForm.new !== passwordForm.confirm) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    if (passwordForm.new.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }
    try {
      await changePasswordAPI({ currentPassword: passwordForm.current, newPassword: passwordForm.new })
      showSuccess('Password changed successfully')
      setShowPasswordForm(false)
      setPasswordForm({ current: '', new: '', confirm: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeEmail = async () => {
    setLoading(true)
    setError('')
    if (!newEmail.includes('@')) {
      setError('Please enter a valid email')
      setLoading(false)
      return
    }
    try {
      setUser(prev => ({ ...prev, email: newEmail }))
      localStorage.setItem('user', JSON.stringify({ ...user, email: newEmail }))
      showSuccess('Email changed successfully')
      setShowEmailForm(false)
      setNewEmail('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change email')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSchool = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await updateSchool(schoolForm)
      setUser(res.data)
      localStorage.setItem('user', JSON.stringify(res.data))
      showSuccess('School info updated')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update school')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = () => {
    if (deleteText === 'DELETE MY ACCOUNT') {
      localStorage.clear()
      router.push('/login')
    }
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    localStorage.setItem('darkMode', !darkMode)
    showSuccess(darkMode ? 'Light mode enabled' : 'Dark mode enabled')
  }

  const sections = [
    { id: 'account', label: 'Account', icon: FiUser },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'privacy', label: 'Privacy & Security', icon: FiShield },
    { id: 'appearance', label: 'Appearance', icon: FiSun },
    { id: 'general', label: 'General', icon: FiGlobe },
  ]

  const Toggle = ({ enabled, onChange }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? 'bg-primary' : 'bg-gray-300'}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )

  return (
    <div className="min-h-screen bg-light md:pl-56 pt-16 md:pt-0">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-primary text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium"
          >
            <FiCheck size={16} /> {saveSuccess}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 flex items-center justify-between"
          >
            <span className="text-sm">{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600"><FiX size={16} /></button>
          </motion.div>
        )}

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-dark flex items-center gap-2">
            <FiSettings size={24} /> Settings
          </h1>
          <p className="text-sm text-gray-400 mt-1">Manage your account preferences</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">

          <div className="md:w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-2 sticky top-4">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeSection === section.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-dark'
                    }`}
                >
                  <section.icon size={18} />
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <AnimatePresence mode="wait">

              {activeSection === 'account' && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-dark flex items-center gap-2">
                        <FiUser size={20} className="text-primary" />
                        Profile Information
                      </h2>
                      <button
                        onClick={() => setEditMode(!editMode)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition"
                      >
                        <FiEdit2 size={14} /> {editMode ? 'Cancel' : 'Edit'}
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={editMode ? editForm.name : user.name || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          disabled={!editMode}
                          className={`w-full px-3 py-2.5 rounded-xl border text-sm ${editMode ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'} text-dark`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="email"
                            value={showEmailForm ? newEmail : user.email || ''}
                            disabled={!showEmailForm}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className={`flex-1 px-3 py-2.5 rounded-xl border text-sm ${showEmailForm ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'} text-dark`}
                          />
                          {!showEmailForm ? (
                            <button onClick={() => setShowEmailForm(true)} className="text-primary text-sm font-medium">Change</button>
                          ) : (
                            <div className="flex gap-1">
                              <button onClick={handleChangeEmail} disabled={loading} className="bg-primary text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50">Save</button>
                              <button onClick={() => { setShowEmailForm(false); setNewEmail('') }} className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium">Cancel</button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={editMode ? editForm.phone : user.phone || 'Not set'}
                          onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={!editMode}
                          className={`w-full px-3 py-2.5 rounded-xl border text-sm ${editMode ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'} text-dark`}
                        />
                      </div>

                      {editMode && (
                        <button
                          onClick={handleUpdateProfile}
                          disabled={loading}
                          className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
                        >
                          <FiSave size={14} /> Save Changes
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-dark flex items-center gap-2 mb-4">
                      <FiLock size={20} className="text-primary" />
                      Password
                    </h2>

                    {!showPasswordForm ? (
                      <button
                        onClick={() => setShowPasswordForm(true)}
                        className="text-primary text-sm font-medium flex items-center gap-1"
                      >
                        Change Password <FiChevronRight size={14} />
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Current Password</label>
                          <div className="relative">
                            <input
                              type={showPasswords.current ? 'text' : 'password'}
                              value={passwordForm.current}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                              className="w-full px-3 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                              className="absolute right-3 top-2.5 text-gray-400"
                            >
                              {showPasswords.current ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">New Password</label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              value={passwordForm.new}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                              className="w-full px-3 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                              className="absolute right-3 top-2.5 text-gray-400"
                            >
                              {showPasswords.new ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Confirm New Password</label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              value={passwordForm.confirm}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                              className="w-full px-3 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                              className="absolute right-3 top-2.5 text-gray-400"
                            >
                              {showPasswords.confirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={handleChangePassword}
                            disabled={loading}
                            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                          >
                            Update Password
                          </button>
                          <button
                            onClick={() => { setShowPasswordForm(false); setPasswordForm({ current: '', new: '', confirm: '' }) }}
                            className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-dark flex items-center gap-2 mb-4">
                      <FiBookOpen size={20} className="text-primary" />
                      School Information
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Education Level</label>
                        <select
                          value={schoolForm.level}
                          onChange={(e) => setSchoolForm(prev => ({ ...prev, level: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white"
                        >
                          <option value="">Select level</option>
                          <option value="JSS">JSS</option>
                          <option value="SSS">SSS</option>
                          <option value="University">University</option>
                          <option value="Postgrad">Postgrad</option>
                        </select>
                      </div>

                      {(schoolForm.level === 'University' || schoolForm.level === 'Postgrad') && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Course / Field of Study</label>
                          <div className="max-h-40 overflow-y-auto flex flex-wrap gap-1.5 border border-gray-200 rounded-xl p-2">
                            {courses.map(c => (
                              <button key={c} type="button" onClick={() => setSchoolForm(prev => ({ ...prev, course: c }))}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${schoolForm.course === c ? 'bg-primary text-white' : 'bg-gray-50 text-dark border border-gray-200 hover:border-primary'}`}>
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">School</label>
                        <input
                          type="text"
                          value={schoolForm.school}
                          onChange={(e) => setSchoolForm(prev => ({ ...prev, school: e.target.value }))}
                          placeholder="Enter your school name"
                          className="w-full px-3 py-2.5 rounded-xl border text-dark bg-white border-gray-200 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">State</label>
                        <input
                          type="text"
                          value={schoolForm.state}
                          onChange={(e) => setSchoolForm(prev => ({ ...prev, state: e.target.value }))}
                          placeholder="Enter your state"
                          className="w-full px-3 py-2.5 rounded-xl text-dark bg-white border border-gray-200 text-sm"
                        />
                      </div>

                      <button
                        onClick={handleUpdateSchool}
                        disabled={loading}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        Update School Info
                      </button>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
                    <h2 className="text-lg font-bold text-red-600 flex items-center gap-2 mb-2">
                      <FiAlertTriangle size={20} />
                      Danger Zone
                    </h2>
                    <p className="text-sm text-red-500/70 mb-4">Once you delete your account, all your data will be permanently removed.</p>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                    >
                      Delete Account
                    </button>

                    <AnimatePresence>
                      {showDeleteConfirm && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                          onClick={() => setShowDeleteConfirm(false)}
                        >
                          <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-lg font-bold text-dark mb-2">Delete Account?</h3>
                            <p className="text-sm text-gray-500 mb-4">This action cannot be undone. Type <strong className="text-red-500">DELETE MY ACCOUNT</strong> to confirm.</p>
                            <input
                              type="text"
                              value={deleteText}
                              onChange={(e) => setDeleteText(e.target.value)}
                              placeholder="DELETE MY ACCOUNT"
                              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm mb-4"
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => { setShowDeleteConfirm(false); setDeleteText('') }}
                                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleDeleteAccount}
                                disabled={deleteText !== 'DELETE MY ACCOUNT'}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {activeSection === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-dark flex items-center gap-2 mb-6">
                      <FiBell size={20} className="text-primary" />
                      Notification Preferences
                    </h2>

                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-dark">Email Notifications</p>
                          <p className="text-xs text-gray-400 mt-0.5">Receive updates and alerts via email</p>
                        </div>
                        <Toggle enabled={emailNotifs} onChange={setEmailNotifs} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-dark">Push Notifications</p>
                          <p className="text-xs text-gray-400 mt-0.5">Get real-time push notifications</p>
                        </div>
                        <Toggle enabled={pushNotifs} onChange={setPushNotifs} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-dark">Weekly Digest</p>
                          <p className="text-xs text-gray-400 mt-0.5">Receive a weekly summary of activity</p>
                        </div>
                        <Toggle enabled={weeklyDigest} onChange={setWeeklyDigest} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'privacy' && (
                <motion.div
                  key="privacy"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-dark flex items-center gap-2 mb-6">
                      <FiShield size={20} className="text-primary" />
                      Privacy Settings
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-dark mb-2">Profile Visibility</p>
                        <div className="flex gap-2">
                          {['public', 'private'].map(opt => (
                            <button
                              key={opt}
                              onClick={() => setProfileVisibility(opt)}
                              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${profileVisibility === opt
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                            >
                              {opt.charAt(0).toUpperCase() + opt.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-dark flex items-center gap-2 mb-4">
                      <FiLock size={20} className="text-primary" />
                      Security
                    </h2>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-dark">Active Sessions</p>
                          <p className="text-xs text-gray-400 mt-0.5">Manage your logged-in devices</p>
                        </div>
                        <button className="text-primary text-sm font-medium">View</button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-dark">Two-Factor Auth</p>
                          <p className="text-xs text-gray-400 mt-0.5">Add extra security to your account</p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full font-medium">Coming Soon</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'appearance' && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-dark flex items-center gap-2 mb-6">
                      {darkMode ? <FiMoon size={20} className="text-primary" /> : <FiSun size={20} className="text-primary" />}
                      Theme
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => { setDarkMode(false); localStorage.setItem('darkMode', 'false') }}
                        className={`p-4 rounded-xl border-2 transition ${!darkMode ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                      >
                        <FiSun size={24} className="mx-auto mb-2 text-yellow-500" />
                        <p className="text-sm font-medium text-dark">Light</p>
                      </button>

                      <button
                        onClick={() => { setDarkMode(true); localStorage.setItem('darkMode', 'true') }}
                        className={`p-4 rounded-xl border-2 transition ${darkMode ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                      >
                        <FiMoon size={24} className="mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium text-dark">Dark</p>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'general' && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-dark flex items-center gap-2 mb-6">
                      <FiGlobe size={20} className="text-primary" />
                      Connected Accounts
                    </h2>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-dark">Google</p>
                            <p className="text-xs text-gray-400">Connected</p>
                          </div>
                        </div>
                        <button className="text-gray-400 text-sm">Disconnect</button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-dark flex items-center gap-2 mb-6">
                      <FiSettings size={20} className="text-primary" />
                      Other
                    </h2>

                    <div className="space-y-3">
                      <Link href="/terms" className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                        <div className="text-left">
                          <p className="text-sm font-medium text-dark">Terms of Service</p>
                        </div>
                        <FiChevronRight size={16} className="text-gray-400" />
                      </Link>

                      <Link href="/privacy" className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                        <div className="text-left">
                          <p className="text-sm font-medium text-dark">Privacy Policy</p>
                        </div>
                        <FiChevronRight size={16} className="text-gray-400" />
                      </Link>

                      <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                        <div className="text-left">
                          <p className="text-sm font-medium text-dark">About ScholarHub</p>
                          <p className="text-xs text-gray-400">Version 1.0.0</p>
                        </div>
                        <FiChevronRight size={16} className="text-gray-400" />
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between p-3 bg-red-50 rounded-xl hover:bg-red-100 transition text-red-600"
                      >
                        <div className="text-left">
                          <p className="text-sm font-medium">Log Out</p>
                        </div>
                        <FiLogOut size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
