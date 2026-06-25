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
export const getPosts = (page = 1, search = '', tab = '', category = '', communityId = '') => {
  let url = `/posts?page=${page}&limit=20`
  if (search) url += `&search=${encodeURIComponent(search)}`
  if (tab) url += `&tab=${tab}`
  if (category) url += `&category=${encodeURIComponent(category)}`
  if (communityId) url += `&communityId=${communityId}`
  return API.get(url)
}
export const getPostById = (id) => API.get(`/posts/${id}`)
export const likePost = (id) => API.post(`/posts/${id}/like`)
export const getComments = (id) => API.get(`/posts/${id}/comments`)
export const addComment = (id, text) => API.post(`/posts/${id}/comments`, { text })
export const getLeaderboard = () => API.get('/auth/leaderboard')
export const getNotifications = () => API.get('/notifications')
export const markNotificationsRead = () => API.post('/notifications')
export const updateProfile = (data) => API.put('/auth/profile', data)
export const updateSchool = (data) => API.put('/auth/school', data)
export const changePassword = (data) => API.put('/auth/password', data)
export const askBot = (messages) => API.post('/bot/chat', { messages })
export const getConversations = () => API.get('/chat/conversations')
export const getMessages = (userId) => API.get(`/chat/${userId}`)
export const sendMessage = (receiverId, text) => API.post('/chat/send', { receiverId, text })
export const markMessagesAsRead = (senderId) => API.put('/chat/read', { senderId })
export const searchUsers = (q) => API.get(`/chat/users/search?q=${q}`)
export const triggerSOS = (data) => API.post('/sos/trigger', data)
export const getActiveAlerts = () => API.get('/sos/active')
export const resolveSOS = (id) => API.patch(`/sos/${id}/resolve`)
export const getUserById = (id) => API.get(`/chat/users/${id}`)
export const deletePost = (id) => API.delete(`/posts/${id}`)
export const followUser = (id) => API.post(`/auth/user/${id}/follow`)
export const adminDeleteUser = (userId) => API.delete(`/admin/users/${userId}`)

export const savePost = (id) => API.post(`/posts/${id}/save`)
export const getSavedPosts = () => API.get('/posts/saved')

export const getShopItems = () => API.get('/shop/items')
export const shopAction = (endpoint, data) => API.post(`/shop/${endpoint}`, data)
export const buyShopItem = (itemId, recipientUsername) => API.post('/shop/buy', { itemId, recipientUsername })
export const giftShopItem = (itemId, recipientUsername) => API.post('/shop/gift', { itemId, recipientUsername })
export const sendCoins = (recipientUsername, amount) => API.post('/shop/send-coins', { recipientUsername, amount })
export const redeemAirtime = (itemId, network, phone) => API.post('/shop/redeem-airtime', { itemId, phone, network })
export const redeemData = (itemId, network, phone) => API.post('/shop/redeem-data', { itemId, phone, network })

export const getCommunities = (params) => API.get('/communities', { params })
export const createCommunity = (data) => API.post('/communities', data)
export const joinCommunity = (communityId, action) => API.post('/communities/join', { communityId, action })
export const getMyCommunities = () => API.get('/communities/my')
export const getCommunityFeed = () => API.get('/communities/feed')
export const requestSchool = (data) => API.post('/school-requests', data)
export const getSchoolRequests = (status) => API.get('/school-requests', { params: { status } })
export const searchSchools = (country, level, query, state) => API.get('/schools/search', { params: { country, level, query, state } })