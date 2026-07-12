import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiSearch, FiBell, FiHeart, FiMessageCircle, FiShare2, FiPlus, FiTrendingUp, FiBookmark, FiSend, FiCamera, FiRefreshCw, FiImage, FiUsers, FiInbox, FiHome, FiCheck } from "react-icons/fi"
import { useRouter } from 'next/navigation'
import { createPost, getPosts, getUserPosts, likePost, getComments, addComment, getNotifications, markNotificationsRead, getLeaderboard, followUser, getMyCommunities, savePost, getSavedPosts } from '../api/auth'
import SOSButton from '../components/SOSButton'
import { getSchoolAbbr, stringToColor } from '../utils/school'
import axios from 'axios'

function Home() {
    const router = useRouter()
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loadingMore, setLoadingMore] = useState(false)
    const [showCreatePost, setShowCreatePost] = useState(false)
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'University', community: '' })
    const [postImage, setPostImage] = useState(null)
    const [postImageFile, setPostImageFile] = useState(null)
    const [userCommunities, setUserCommunities] = useState([])
    const [selectedCommunityIds, setSelectedCommunityIds] = useState([])
    const [showComments, setShowComments] = useState(null)
    const [myPostCount, setMyPostCount] = useState(0)
    const [postLoading, setPostLoading] = useState(false)
    const [postError, setPostError] = useState('')
    const [postSuccess, setPostSuccess] = useState(false)
    const [commentsMap, setCommentsMap] = useState({})
    const [commentText, setCommentText] = useState('')
    const [commentLoading, setCommentLoading] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [showNotifications, setShowNotifications] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const [leaderboard, setLeaderboard] = useState([])
    const [followedNotifs, setFollowedNotifs] = useState(new Set())
    const notifRef = useRef(null)
    const prevUnreadRef = useRef(0)
    const audioCtxRef = useRef(null)
    const loaderRef = useRef(null)

    const [user, setUser] = useState({})
    const [activeTab, setActiveTab] = useState('for_you')
    const [categoryTabs, setCategoryTabs] = useState([])
    const [activeCommunity, setActiveCommunity] = useState(null)
    const [showTopics, setShowTopics] = useState(false)
    const topicsBtnRef = useRef(null)
    const [topicsPos, setTopicsPos] = useState({ left: 0, top: 0 })
    const feedCategories = ['University', 'Secondary']
    const categories = feedCategories

    useEffect(() => {
        try { setUser(JSON.parse(localStorage.getItem('user') || '{}')) } catch (e) {}
        if (window.location.search.includes('create=true')) {
            setShowCreatePost(true)
            window.history.replaceState({}, '', '/feed')
        }
    }, [])

    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifications(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const ensureAudio = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume()
        }
    }

    const playNotifSound = () => {
        try {
            ensureAudio()
            const ctx = audioCtxRef.current
            const playTone = (freq, start, duration) => {
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.frequency.value = freq
                osc.type = 'sine'
                gain.gain.setValueAtTime(0.15, start)
                gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
                osc.start(start)
                osc.stop(start + duration)
            }
            playTone(523, ctx.currentTime, 0.1)
            playTone(659, ctx.currentTime + 0.12, 0.15)
        } catch (_) {}
    }

    const showDesktopNotif = (title, body) => {
        if (!('Notification' in window)) return
        if (Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/favicon.ico' })
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission()
        }
    }

    const fetchNotificationsOnly = async () => {
        try {
            const notifRes = await getNotifications()
            const newCount = notifRes.data.filter(n => !n.read).length
            if (newCount > prevUnreadRef.current) {
                playNotifSound()
                const latest = notifRes.data.find(n => !n.read)
                if (latest) {
                    const from = latest.fromUser || latest.sender
                    const label = latest.type === 'message' ? 'sent you a message'
                        : latest.type === 'like' ? 'liked your post'
                        : latest.type === 'comment' ? 'commented on your post'
                        : latest.type === 'follow' ? 'started following you'
                        : latest.type === 'gift' ? 'sent you a gift'
                        : 'notification'
                    showDesktopNotif(from?.name || 'ScholarHub', label)
                }
            }
            prevUnreadRef.current = newCount
            setNotifications(notifRes.data)
            setUnreadCount(newCount)
        } catch (_) {}
    }

    const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
        if (append) setLoadingMore(true); else setLoading(true)
        try {
            const userId = user?._id || user?.id || JSON.parse(localStorage.getItem('user') || '{}')._id
            let tabParam = activeTab === 'category' ? 'category' : activeTab === 'community' ? 'community' : activeTab
            let catParam = ''
            let comId = ''
            if (activeTab === 'category') catParam = categoryTabs[0] || ''
            if (activeTab === 'community' && activeCommunity) { comId = activeCommunity._id }
            const [postsRes, myPostsRes, notifRes, leaderRes, commRes, savedRes] = await Promise.all([
                getPosts(pageNum, searchQuery, tabParam, catParam, comId).catch(() => ({ data: { posts: [], totalPages: 1 } })),
                getUserPosts().catch(() => ({ data: [] })),
                getNotifications().catch(() => ({ data: [] })),
                getLeaderboard().catch(() => ({ data: [] })),
                getMyCommunities().catch(() => ({ data: [] })),
                getSavedPosts().catch(() => ({ data: [] })),
            ])
            const myComms = Array.isArray(commRes.data?.communities) ? commRes.data.communities : []
            setUserCommunities(myComms)
            const deptCom = myComms.find(c => c.type === 'department' || c.type === 'class')
            setSelectedCommunityIds(deptCom ? [deptCom._id] : myComms.length > 0 ? [myComms[0]._id] : [])

            setMyPostCount(myPostsRes.data.length)
            setNotifications(notifRes.data)
            setUnreadCount(notifRes.data.filter(n => !n.read).length)
            prevUnreadRef.current = notifRes.data.filter(n => !n.read).length
            setLeaderboard(leaderRes.data.slice(0, 3))

            const savedIds = new Set((savedRes.data || []).map(s => s._id))

            const postsData = postsRes.data?.posts || postsRes.data || []
            setTotalPages(postsRes.data?.totalPages || 1)

            const realPosts = postsData.map(post => ({
                id: post._id,
                authorId: post.author?._id || '',
                author: post.author?.name || 'Student',
                avatar: post.author?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SH',
                school: post.author?.school || '',
                level: post.author?.level || '',
                community: post.community || '',
                category: post.category,
                title: post.title,
                content: post.content,
                image: post.image || '',
                likes: post.likesCount ?? post.likes?.length ?? 0,
                liked: post.liked || post.likes?.includes(userId) || false,
                commentCount: post.commentCount ?? post.commentsData?.length ?? 0,
                time: new Date(post.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
                trending: post.trending || false,
                saved: savedIds.has(post._id),
                isReal: true
            }))

            setPosts(prev => append ? [...prev, ...realPosts] : realPosts)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
            setRefreshing(false)
            setLoadingMore(false)
        }
    }, [searchQuery, activeTab, categoryTabs, activeCommunity])

    useEffect(() => {
        fetchPosts(1)
        const interval = setInterval(fetchNotificationsOnly, 3000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        setPage(1)
        fetchPosts(1)
    }, [activeTab, activeCommunity])

    useEffect(() => {
        setPage(1)
        fetchPosts(1)
    }, [searchQuery])

    useEffect(() => {
        if (searchQuery) return
        const interval = setInterval(() => {
            fetchPosts(1)
        }, 30000)
        return () => clearInterval(interval)
    }, [searchQuery, fetchPosts])

    const toggleLike = async (id, isReal) => {
        setPosts(prev => prev.map(p =>
            p.id === id ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p
        ))
        if (!isReal) return
        try {
            await likePost(id)
        } catch (err) {
            setPosts(prev => prev.map(p =>
                p.id === id ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p
            ))
        }
    }

    const toggleSave = async (id) => {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, saved: !p.saved } : p))
        try {
            await savePost(id)
        } catch (err) {
            setPosts(prev => prev.map(p => p.id === id ? { ...p, saved: !p.saved } : p))
        }
    }

    const handleShowComments = async (postId, isReal) => {
        if (showComments === postId) { setShowComments(null); return }
        setShowComments(postId)
        if (!isReal || commentsMap[postId]) return
        try {
            const res = await getComments(postId)
            setCommentsMap(prev => ({ ...prev, [postId]: res.data }))
        } catch (err) {
            setCommentsMap(prev => ({ ...prev, [postId]: [] }))
        }
    }

    const handleAddComment = async (postId) => {
        if (!commentText.trim()) return
        setCommentLoading(true)
        try {
            const res = await addComment(postId, commentText)
            setCommentsMap(prev => ({ ...prev, [postId]: [...(prev[postId] || []), res.data] }))
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p))
            setCommentText('')
        } catch (err) {
            console.error(err)
        } finally {
            setCommentLoading(false)
        }
    }

    const handleBellClick = async () => {
        ensureAudio()
        setShowNotifications(!showNotifications)
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }
        if (!showNotifications && unreadCount > 0) {
            try {
                await markNotificationsRead()
                setUnreadCount(0)
                setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            } catch (err) {
                console.error(err)
            }
        }
    }

    const handleShare = (post) => {
        if (navigator.share) {
            navigator.share({ title: post.title, text: post.content, url: window.location.href })
        } else {
            navigator.clipboard.writeText(window.location.href)
            alert('Link copied!')
        }
    }

    const handleCreatePost = async () => {
        if (!newPost.title.trim() || !newPost.content.trim()) {
            setPostError('Title and content are required')
            return
        }
        if (!selectedCommunityIds.length) {
            setPostError('Select at least one community to post to')
            return
        }
        setPostLoading(true)
        setPostError('')
        try {
            const postData = {
                title: newPost.title.trim(),
                content: newPost.content.trim(),
                category: newPost.category,
                communityIds: selectedCommunityIds,
                image: postImage || ''
            }
            await createPost(postData)
            setPostSuccess(true)
            setNewPost({ title: '', content: '', category: 'University', community: '' })
            setPostImage(null)
            setTimeout(() => { setShowCreatePost(false); setPostSuccess(false); fetchPosts(1) }, 2000)
        } catch (err) {
            setPostError(err.response?.data?.message || err.message || 'Something went wrong')
        } finally {
            setPostLoading(false)
        }
    }

    const handleNotifClick = async (notif) => {
        setShowNotifications(false)
        if (!notif.read) {
            try {
                await markNotificationsRead()
                setUnreadCount(0)
                setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            } catch (_) {}
        }
        const from = notif.fromUser || notif.sender
        if (notif.type === 'message') {
            router.push('/chat')
        } else if (notif.type === 'follow') {
            if (from?._id) router.push(`/profile/${from._id}`)
        } else if (notif.type === 'like' || notif.type === 'comment') {
            router.push('/profile')
        } else {
            if (from?._id) router.push(`/profile/${from._id}`)
        }
    }

    const handleFollowBack = async (e, userId) => {
        e.stopPropagation()
        try {
            await followUser(userId)
            setFollowedNotifs(prev => new Set([...prev, userId]))
        } catch (_) {}
    }

    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        setPage(1)
        await fetchPosts(1)
        setRefreshing(false)
    }, [fetchPosts])

    const loadMore = useCallback(async () => {
        if (loadingMore || page >= totalPages || searchQuery) return
        const nextPage = page + 1
        setPage(nextPage)
        await fetchPosts(nextPage, true)
    }, [page, totalPages, loadingMore, searchQuery, fetchPosts])

    useEffect(() => {
        if (!loaderRef.current) return
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) loadMore()
        }, { threshold: 0.5 })
        observer.observe(loaderRef.current)
        return () => observer.disconnect()
    }, [loadMore])

    useEffect(() => {
        if (!showTopics) return
        const handler = (e) => {
            const dd = document.querySelector('[data-topics-dropdown]')
            if (topicsBtnRef.current && !topicsBtnRef.current.contains(e.target) &&
                dd && !dd.contains(e.target)) {
                setShowTopics(false)
            }
        }
        setTimeout(() => document.addEventListener('mousedown', handler), 0)
        return () => document.removeEventListener('mousedown', handler)
    }, [showTopics])

    const filteredPosts = posts

    return (
       
        <div className="min-h-screen bg-light md:pl-56 pt-16 md:pt-0">
            
            <div className="sticky top-0 md:top-0 z-40 bg-light/95 backdrop-blur-md border-b border-gray-100 px-4 md:px-6 py-3 md:py-4">
                <div className="max-w-5xl mx-auto flex items-center gap-2">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-primary transition"
                        />
                    </div>

                    <button onClick={onRefresh} className="p-2 bg-white border border-gray-200 rounded-xl hover:border-primary transition flex-shrink-0">
                        <FiRefreshCw size={15} className={`text-dark ${refreshing ? 'animate-spin' : ''}`} />
                    </button>

                    <div className="relative flex-shrink-0" ref={notifRef}>
                        <button onClick={handleBellClick}
                            className="relative p-2 bg-white border border-gray-200 rounded-xl hover:border-primary transition">
                            <FiBell size={15} className="text-dark" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full text-white text-xs flex items-center justify-center font-bold">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-12 w-72 md:w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-50">
                                        <p className="font-bold text-dark text-sm">Notifications</p>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                                    {notifications.length === 0 ? (
                                            <div className="px-4 py-8 text-center text-gray-400 text-sm">No notifications yet</div>
                                        ) : (
                                            notifications.map((notif, i) => {
                                                const from = notif.fromUser || notif.sender
                                                return (
                                                <div key={i} onClick={() => handleNotifClick(notif)} className={`px-4 py-3 border-b border-gray-50 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition ${!notif.read ? 'bg-primary/5' : ''}`}>
                                                    <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                                                        {from?.name?.charAt(0) || 'S'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-dark">
                                                            <span className="font-semibold hover:text-primary cursor-pointer">{from?.name?.split(' ')[0] || 'Someone'}</span>
                                                            {notif.type === 'follow' ? ' started following you' : notif.type === 'message' ? ' sent you a message' : notif.type === 'like' ? ' liked your post' : notif.type === 'gift' ? ' sent you a gift' : ' commented on your post'}
                                                        </p>
                                                        <p className="text-xs text-gray-400 truncate mt-0.5">{notif.type === 'message' || notif.type === 'gift' ? notif.text : notif.post?.title}</p>
                                                        <p className="text-xs text-gray-300 mt-0.5">
                                                            {new Date(notif.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                                                        </p>
                                                        {notif.type === 'follow' && from?._id && (
                                                            <button onClick={(e) => handleFollowBack(e, from._id)}
                                                                className={`mt-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${followedNotifs.has(from._id) ? 'bg-gray-100 text-gray-500' : 'bg-primary text-white hover:opacity-90'}`}>
                                                                {followedNotifs.has(from._id) ? 'Following' : 'Follow Back'}
                                                            </button>
                                                        )}
                                                    </div>
                                                    {!notif.read && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />}
                                                </div>
                                                )
                                            })
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {user.status === 'Current Student' && (
                        <button onClick={() => setShowCreatePost(true)}
                            className="hidden md:flex items-center gap-1.5 bg-primary text-white px-3 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition flex-shrink-0">
                            <FiPlus size={14} /> Create Post
                        </button>
                    )}

                    <div
                        onClick={() => router.push('/profile')}
                        className="w-8 h-8 flex-shrink-0 bg-primary rounded-xl flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-90 transition">
                        {user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SH'}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-3 md:px-4 pb-24 flex gap-6">
                <div className="flex-1 min-w-0">

                    <div className="flex items-center gap-1 mb-4 border-b border-gray-100 pb-2 overflow-x-auto">
                        <button onClick={() => { setActiveTab('for_you'); setActiveCommunity(null); setPage(1) }}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap flex-shrink-0 ${activeTab === 'for_you' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                            For you
                        </button>
                        <button onClick={() => { setActiveTab('following'); setActiveCommunity(null); setPage(1) }}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap flex-shrink-0 ${activeTab === 'following' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                            Following
                        </button>
                        {userCommunities.filter(c => c.type !== 'general').map(c => (
                            <button key={c._id}
                                onClick={() => { setActiveCommunity(c); setActiveTab('community'); setPage(1) }}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap flex-shrink-0 ${activeTab === 'community' && activeCommunity?._id === c._id ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                                {c.name}
                            </button>
                        ))}
                        {categoryTabs.map(cat => (
                            <button key={cat} onClick={() => { setActiveTab('category'); setActiveCommunity(null); setPage(1) }}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap flex-shrink-0 items-center gap-1 ${activeTab === 'category' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                                {cat}
                                <span onClick={(e) => { e.stopPropagation(); const next = categoryTabs.filter(c => c !== cat); setCategoryTabs(next); if (activeTab === 'category') setActiveTab(next.length > 0 ? 'category' : 'for_you') }}
                                    className="ml-1 hover:text-red-400">×</span>
                            </button>
                        ))}
                        <button ref={topicsBtnRef}
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect()
                                const dropdownWidth = 176
                                let left = rect.left
                                if (left + dropdownWidth > window.innerWidth) left = Math.max(8, window.innerWidth - dropdownWidth - 8)
                                setTopicsPos({ left, top: rect.bottom + 4 })
                                setShowTopics(!showTopics)
                            }}
                            className="px-2 py-1.5 text-xs font-semibold rounded-lg text-gray-400 hover:bg-gray-100 transition whitespace-nowrap flex-shrink-0">
                            +
                        </button>
                    </div>

                    <AnimatePresence>
                        {showTopics && (
                        <motion.div data-topics-dropdown
                            initial={{ opacity: 0, y: -4, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.95 }}
                            transition={{ duration: 0.12 }}
                            className="fixed z-50 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden"
                            style={{ left: topicsPos.left, top: topicsPos.top, minWidth: 160 }}>
                            {categories.map(cat => (
                                <button key={cat} onClick={() => {
                                    if (!categoryTabs.includes(cat)) {
                                        setCategoryTabs([...categoryTabs, cat])
                                        setActiveTab('category')
                                    }
                                    setShowTopics(false)
                                }}
                                    className={`w-full text-left px-3 py-2 text-xs font-semibold transition ${categoryTabs.includes(cat) ? 'text-primary bg-primary/5' : 'text-gray-600 hover:bg-gray-50'}`}>
                                    {cat}
                                    {categoryTabs.includes(cat) && <FiCheck size={14} className="float-right text-primary" />}
                                </button>
                            ))}
                        </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex flex-col gap-3">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
                                    <div className="flex gap-3 mb-3">
                                        <div className="w-9 h-9 bg-gray-200 rounded-xl flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="h-3 bg-gray-200 rounded w-32 mb-2" />
                                            <div className="h-2 bg-gray-100 rounded w-20" />
                                        </div>
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-gray-100 rounded w-full mb-1" />
                                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                                </div>
                            ))
                        ) : filteredPosts.length === 0 && !loadingMore ? (
                            activeTab === 'following' ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="text-center py-12 text-gray-400">
                                    <FiUsers size={36} className="mb-3" />
                                    <p className="text-base font-semibold mb-1">Follow people to see their posts</p>
                                    <p className="text-sm mb-6">When you follow someone, their posts will show up here.</p>
                                    {leaderboard.length > 0 && (
                                        <>
                                            <p className="text-xs font-semibold text-dark mb-3">Suggested users to follow</p>
                                            <div className="flex flex-col gap-2 max-w-xs mx-auto">
                                                {leaderboard.slice(0, 5).map(s => (
                                                    <div key={s._id}
                                                        onClick={() => s._id && router.push(`/profile/${s._id}`)}
                                                        className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100 cursor-pointer hover:border-primary/30 transition text-left">
                                                        <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                                                            {s.name?.charAt(0) || 'S'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-semibold text-dark truncate">{s.name}</p>
                                                            {s.school && (
                                                                <span className="text-[10px] text-gray-400">{getSchoolAbbr(s.school)}</span>
                                                            )}
                                                        </div>
                                                        <button onClick={e => { e.stopPropagation(); handleFollowBack(e, s._id) }}
                                                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${followedNotifs.has(s._id) ? 'bg-gray-100 text-gray-500' : 'bg-primary text-white hover:opacity-90'}`}>
                                                            {followedNotifs.has(s._id) ? 'Following' : 'Follow'}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            ) : activeTab === 'community' && activeCommunity ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="text-center py-16 text-gray-400">
                                    <FiHome size={36} className="mb-3" />
                                    <p className="text-base font-semibold mb-1">No posts in {activeCommunity.name}</p>
                                    <p className="text-sm">Be the first to share something in this community!</p>
                                </motion.div>
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="text-center py-16 text-gray-400">
                                    <FiInbox size={36} className="mb-3" />
                                    <p className="text-base font-semibold mb-1">No posts found</p>
                                    <p className="text-sm">{searchQuery ? 'Try a different search term' : 'No posts yet, be the first to create one!'}</p>
                                </motion.div>
                            )
                        ) : (
                            <AnimatePresence>
                                {filteredPosts.map((post, i) => (
                                    <motion.div key={post.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="bg-white rounded-2xl p-3 md:p-5 border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all duration-300">

                                        <div className="flex items-start gap-2 mb-3">
                                            <div
                                                onClick={() => post.authorId && post.authorId !== user.id && router.push(`/profile/${post.authorId}`)}
                                                className={`w-8 h-8 md:w-9 md:h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 ${post.authorId && post.authorId !== user.id ? 'cursor-pointer hover:bg-primary/20 transition' : ''}`}>
                                                {post.avatar}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    onClick={() => post.authorId && post.authorId !== user.id && router.push(`/profile/${post.authorId}`)}
                                                    className={`font-semibold text-dark text-xs md:text-sm leading-tight truncate ${post.authorId && post.authorId !== user.id ? 'cursor-pointer hover:text-primary transition' : ''}`}>
                                                    {post.author.split(' ').slice(0, 2).join(' ')}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    {post.school && (
                                                        <span className="text-white font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                                                            style={{ backgroundColor: stringToColor(post.school), fontSize: '9px' }}>
                                                            {getSchoolAbbr(post.school)}
                                                        </span>
                                                    )}
                                                    <p className="text-xs text-gray-400">{post.time}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                {post.trending && (
                                                    <span className="bg-accent/10 text-accent font-semibold px-1.5 py-0.5 rounded-full hidden sm:block" style={{ fontSize: '10px' }}>Trending</span>
                                                )}
                                                <span className="bg-primary/10 text-primary font-medium px-1.5 py-0.5 rounded-full" style={{ fontSize: '10px' }}>
                                                    {post.category}
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-dark text-sm mb-1 leading-snug">{post.title}</h3>
                                        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">{post.content}</p>
                                        {post.image && (
                                            <img src={post.image} alt="" className="w-full h-44 object-cover rounded-xl mb-3 bg-gray-50"
                                                onError={e => { e.target.style.display = 'none' }} />
                                        )}

                                        <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
                                            <button onClick={() => toggleLike(post.id, post.isReal)}
                                                className={`flex items-center gap-1 transition-colors duration-200 ${post.liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
                                                <FiHeart size={14} className={post.liked ? 'fill-current' : ''} />
                                                <span className="text-xs">{post.likes}</span>
                                            </button>
                                            <button onClick={() => handleShowComments(post.id, post.isReal)}
                                                className={`flex items-center gap-1 transition-colors duration-200 ${showComments === post.id ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}>
                                                <FiMessageCircle size={14} />
                                                <span className="text-xs">{post.commentCount || 0}</span>
                                            </button>
                                            <button onClick={() => handleShare(post)}
                                                className="flex items-center gap-1 text-gray-400 hover:text-primary transition-colors duration-200">
                                                <FiShare2 size={14} />
                                            </button>
                                            <button onClick={() => toggleSave(post.id)}
                                                className={`ml-auto transition-colors duration-200 ${post.saved ? 'text-primary' : 'text-gray-300 hover:text-primary'}`}>
                                                <FiBookmark size={14} className={post.saved ? 'fill-current' : ''} />
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {showComments === post.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-3 pt-3 border-t border-gray-100">
                                                    <div className="flex flex-col gap-3 mb-3 max-h-48 overflow-y-auto">
                                                        {!commentsMap[post.id] ? (
                                                            <p className="text-xs text-gray-400 text-center py-2">Loading comments...</p>
                                                        ) : commentsMap[post.id].length === 0 ? (
                                                            <p className="text-xs text-gray-400 text-center py-2">No comments yet, be the first!</p>
                                                        ) : (
                                                            commentsMap[post.id].map((comment, ci) => (
                                                                <div key={ci} className="flex items-start gap-2">
                                                                    <div
                                                                        onClick={() => comment.author?._id && comment.author._id !== user.id && router.push(`/profile/${comment.author._id}`)}
                                                                        className={`w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 ${comment.author?._id && comment.author._id !== user.id ? 'cursor-pointer hover:bg-primary/20' : ''}`}>
                                                                        {comment.author?.name?.charAt(0) || 'S'}
                                                                    </div>
                                                                    <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                                                                        <p
                                                                            onClick={() => comment.author?._id && comment.author._id !== user.id && router.push(`/profile/${comment.author._id}`)}
                                                                            className={`text-xs font-semibold text-dark ${comment.author?._id && comment.author._id !== user.id ? 'cursor-pointer hover:text-primary' : ''}`}>
                                                                            {comment.author?.name || 'Student'}
                                                                            {comment.author?.badge && comment.author.badge !== 'Beginner' && (
                                                                                <span className="text-[10px] text-primary font-medium ml-1">• {comment.author.badge}</span>
                                                                            )}
                                                                        </p>
                                                                        <p className="text-xs text-gray-600 mt-0.5">{comment.text}</p>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                            {user.name?.charAt(0) || 'S'}
                                                        </div>
                                                        <div className="flex-1 flex gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Write a comment..."
                                                                value={commentText}
                                                                onChange={e => setCommentText(e.target.value)}
                                                                onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)}
                                                                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary transition"
                                                            />
                                                            <button
                                                                onClick={() => handleAddComment(post.id)}
                                                                disabled={commentLoading || !commentText.trim()}
                                                                className="p-2 bg-primary text-white rounded-xl hover:opacity-90 transition disabled:opacity-50">
                                                                <FiSend size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                <div className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0">

                    <div className="relative">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" size={14} />
                        <input type="text" placeholder="Search"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-100 border border-transparent rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition" />
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <h3 className="font-bold text-dark text-sm px-4 pt-4 pb-3">What's happening</h3>
                        <div className="divide-y divide-gray-50">
                            {feedCategories.slice(0, 6).map((cat, i) => (
                                <button key={cat}
                                    onClick={() => { setCategoryTabs([cat]); setActiveTab('category'); setPage(1) }}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition">
                                    <p className="text-xs text-gray-400">Trending in ScholarHub</p>
                                    <p className="text-sm font-semibold text-dark">{cat}</p>
                                    <p className="text-xs text-gray-400">Trending</p>
                                </button>
                            ))}
                            <button onClick={() => router.push('/search')}
                                className="w-full text-left px-4 py-3 text-sm text-primary font-medium hover:bg-gray-50 transition">
                                Show more
                            </button>
                        </div>
                    </div>

                    {leaderboard.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                            <h3 className="font-bold text-dark text-sm px-4 pt-4 pb-3">Who to follow</h3>
                            <div className="divide-y divide-gray-50">
                                {leaderboard.slice(0, 3).map(s => (
                                    <div key={s._id}
                                        onClick={() => s._id && router.push(`/profile/${s._id}`)}
                                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition">
                                        <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                                            {s.name?.charAt(0) || 'S'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-dark truncate">{s.name}</p>
                                            {s.school && (
                                                <span className="text-xs text-gray-400">{getSchoolAbbr(s.school)}</span>
                                            )}
                                        </div>
                                        <button onClick={e => { e.stopPropagation(); handleFollowBack(e, s._id) }}
                                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex-shrink-0 ${followedNotifs.has(s._id) ? 'bg-gray-100 text-gray-500' : 'bg-dark text-white hover:opacity-90'}`}>
                                            {followedNotifs.has(s._id) ? 'Following' : 'Follow'}
                                        </button>
                                    </div>
                                ))}
                                <button onClick={() => router.push('/search')}
                                    className="w-full text-left px-4 py-3 text-sm text-primary font-medium hover:bg-gray-50 transition">
                                    Show more
                                </button>
                            </div>
                        </div>
                    )}

                    {userCommunities.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                            <h3 className="font-bold text-dark text-sm px-4 pt-4 pb-3">My Communities</h3>
                            <div className="divide-y divide-gray-50">
                                {userCommunities.slice(0, 4).map(c => (
                                    <div key={c._id}
                                        onClick={() => router.push(`/community/${c.level || c.type}`)}
                                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition">
                                        <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                                            {c.name?.charAt(0) || 'C'}
                                        </div>
                                        <p className="text-sm font-medium text-dark truncate">{c.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-dark rounded-2xl p-4">
                        <p className="text-white font-bold text-sm mb-1">Share Knowledge</p>
                        <p className="text-gray-400 text-xs leading-relaxed">Help your fellow students by posting study resources, campus updates, and academic discussions.</p>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showCreatePost && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                        onClick={() => setShowCreatePost(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ duration: 0.2 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-2xl p-5 md:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-extrabold text-dark">Create Post</h2>
                                <button onClick={() => setShowCreatePost(false)} className="text-gray-400 hover:text-dark text-xl leading-none">&times;</button>
                            </div>
                            <div className="space-y-3">
                                <input type="text" placeholder="Post title"
                                    value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary transition text-dark" />
                                <textarea placeholder="Share your thoughts, study tips, campus updates..."
                                    value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary transition min-h-[120px] resize-none text-dark" />
                                <select value={newPost.category} onChange={e => setNewPost({ ...newPost, category: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary transition text-dark">
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                {userCommunities.length > 0 && (
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-semibold text-gray-500">Post to communities:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {userCommunities.filter(c => c.type !== 'general').map(c => (
                                                <label key={c._id} onClick={e => { e.stopPropagation(); }}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border transition ${selectedCommunityIds.includes(c._id) ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary/50'}`}>
                                                    <input type="checkbox" checked={selectedCommunityIds.includes(c._id)}
                                                        onChange={() => setSelectedCommunityIds(prev => prev.includes(c._id) ? prev.filter(id => id !== c._id) : [...prev, c._id])}
                                                        className="hidden" />
                                                    {c.name}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition text-xs text-gray-600 font-medium">
                                        <FiImage size={14} /> Add Image
                                        <input type="file" accept="image/*" hidden onChange={e => {
                                            const file = e.target.files[0]
                                            if (file) {
                                                const reader = new FileReader()
                                                reader.onloadend = () => setPostImage(reader.result)
                                                reader.readAsDataURL(file)
                                            }
                                        }} />
                                    </label>
                                    {postImage && (
                                        <div className="relative">
                                            <img src={postImage} alt="" className="h-10 w-10 object-cover rounded-lg" />
                                            <button onClick={() => setPostImage(null)}
                                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">&times;</button>
                                        </div>
                                    )}
                                </div>
                                {postError && <p className="text-red-500 text-xs">{postError}</p>}
                                {postSuccess && <p className="text-green-500 text-xs font-medium">Post created!</p>}
                                <button onClick={handleCreatePost} disabled={postLoading}
                                    className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition disabled:opacity-50">
                                    {postLoading ? 'Posting...' : 'Post'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <SOSButton />
        </div>
    )
}

export default Home
