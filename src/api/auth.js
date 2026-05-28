import axios from 'axios'

const API = axios.create({
    baseURL: 'https://scholarhub-api.vercel.app/api',
})

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token')
    if (token) req.headers.Authorization = `Bearer ${token}`
    return req
})

export const signupUser = (formData) => API.post('/auth/signup', formData)
export const loginUser = (formData) => API.post('/auth/login', formData)
export const getMe = () => API.get('/auth/me')
export const createPost = (postData) => API.post('/posts', postData)
export const forgotPassword = (email) => API.post('/password/forgot', { email })
export const resetPassword = (token, password) => API.post(`/password/reset/${token}`, { password })
export const googleAuth = (credential) => API.post('/auth/google', { credential })
export const getAdminStats = () => API.get('/admin/stats')
export const getPendingPosts = () => API.get('/admin/posts/pending')
export const approvePost = (id) => API.put(`/admin/posts/${id}/approve`)
export const rejectPost = (id) => API.put(`/admin/posts/${id}/reject`)
export const getAllUsers = () => API.get('/admin/users')
export const getUserPosts = () => API.get('/posts/my')
export const getPosts = () => API.get('/posts')
export const likePost = (id) => API.post(`/posts/${id}/like`)
export const getComments = (id) => API.get(`/posts/${id}/comments`)
export const addComment = (id, text) => API.post(`/posts/${id}/comments`, { text })
export const getLeaderboard = () => API.get('/auth/leaderboard')
export const getNotifications = () => API.get('/notifications')
export const markNotificationsRead = () => API.patch('/notifications/read')
export const updateProfile = (data) => API.put('/auth/profile', data)
export const updateSchool = (data) => API.put('/auth/school', data)
export const changePassword = (data) => API.put('/auth/password', data)
export const askBot = (messages) => API.post('/bot/chat', { messages })
export const getConversations = () => API.get('/chat/conversations')
export const getMessages = (userId) => API.get(`/chat/${userId}`)
export const sendMessage = (receiverId, text) => API.post('/chat/send', { receiverId, text })
export const searchUsers = (q) => API.get(`/chat/users/search?q=${q}`)
export const triggerSOS = (data) => API.post('/sos/trigger', data)
export const getActiveAlerts = () => API.get('/sos/active')
export const resolveSOS = (id) => API.patch(`/sos/${id}/resolve`)
export const getUserById = (id) => API.get(`/chat/users/${id}`)
export const deletePost = (id) => API.delete(`/posts/${id}`)
export const followUser = (id) => API.post(`/auth/user/${id}/follow`)