'use client'
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiSearch, FiBell, FiHeart, FiMessageCircle, FiShare2, FiPlus, FiTrendingUp, FiBookmark, FiSend, FiCamera, FiRefreshCw, FiImage, FiVideo, FiUsers, FiInbox, FiHome, FiCheck, FiGift, FiThumbsUp, FiCompass, FiZap, FiStar, FiAward } from "react-icons/fi"
import { useRouter } from 'next/navigation'
import { createPost, getPosts, getUserPosts, likePost, getComments, addComment, getNotifications, markNotificationsRead, getLeaderboard, followUser, getMyCommunities, getCommunities, savePost, getSavedPosts, getMe } from '../api/auth'
import SOSButton from '../components/SOSButton'
import CommentDrawer from '../components/CommentDrawer'
import PostGiftModal from '../components/PostGiftModal'
import { getSchoolAbbr, stringToColor } from '../utils/school'
import SchoolLogo from '../components/SchoolLogo'
import SchoolBadge from '../components/SchoolBadge'
import CitationSourceInput from '../components/CitationSourceInput'
import { formatCitationSource } from '../data/citationSources'
import axios from 'axios'

const REACTION_GIFTS_MAP = {
  gift_helpful: { name: 'Helpful', icon: FiThumbsUp, color: 'text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20' },
  gift_insightful: { name: 'Insightful', icon: FiCompass, color: 'text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20' },
  gift_creative: { name: 'Creative', icon: FiImage, color: 'text-purple-500 bg-purple-50 border-purple-200 dark:bg-purple-500/10 dark:border-purple-500/20' },
  gift_brilliant: { name: 'Brilliant', icon: FiZap, color: 'text-amber-400 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20' },
  gift_intelligent: { name: 'Super Intelligent', icon: FiStar, color: 'text-yellow-500 bg-yellow-50 border-yellow-200 dark:bg-yellow-500/10 dark:border-yellow-500/20' },
  gift_masterclass: { name: 'Masterclass', icon: FiAward, color: 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20' },
}

const renderPostGifts = (gifts = []) => {
  if (!gifts || !Array.isArray(gifts) || gifts.length === 0) return null
  const counts = {}
  gifts.forEach(g => { if (g) counts[g] = (counts[g] || 0) + 1 })

  return (
    <div className="flex flex-wrap gap-1.5 mb-2 mt-1">
      {Object.entries(counts).map(([giftId, count]) => {
        const giftObj = REACTION_GIFTS_MAP[giftId] || { name: 'Gift', icon: FiGift, color: 'text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-500/10' }
        const GiftIcon = giftObj.icon || FiGift
        return (
          <div key={giftId} className={`flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${giftObj.color} shadow-2xs`} title={`${giftObj.name} reaction gift`}>
            <GiftIcon size={12} className="flex-shrink-0 animate-pulse" />
            <span>{giftObj.name}</span>
            {count > 1 && <span className="ml-1 opacity-80 font-bold">x{count}</span>}
          </div>
        )
      })}
    </div>
  )
}

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
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Sciences', citationSource: '', community: '' })
    const [postImage, setPostImage] = useState(null)
    const [postVideo, setPostVideo] = useState(null)
    const [postImageFile, setPostImageFile] = useState(null)

    const getUserTier = (u) => {
        const subs = u?.badgeSubscriptions || []
        const now = new Date()
        const active = subs.filter(s => new Date(s.expiresAt) > now)
        if (active.some(s => s.badgeId === 'badge_extra_premium' || s.id === 'badge_extra_premium')) return 'extra_premium'
        if (active.some(s => s.badgeId === 'badge_premium' || s.id === 'badge_premium')) return 'premium'
        if (active.some(s => s.badgeId === 'badge_basic' || s.id === 'badge_basic')) return 'basic'
        return 'free'
    }

    const getVideoDuration = (file) => {
        return new Promise((resolve) => {
            const video = document.createElement('video')
            video.preload = 'metadata'
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src)
                resolve(video.duration)
            }
            video.onerror = () => resolve(0)
            video.src = URL.createObjectURL(file)
        })
    }

    const renderAuthorBadge = (author) => {
        if (author?.isVerified) {
            return (
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#008751] text-white text-[9px] font-extrabold ml-1 flex-shrink-0" title="Scholar Verified">
                    ✓
                </span>
            )
        }
        return null
    }
    const [userCommunities, setUserCommunities] = useState([])
    const [selectedCommunityIds, setSelectedCommunityIds] = useState([])
    const [activeCommentPost, setActiveCommentPost] = useState(null)
    const [giftPost, setGiftPost] = useState(null)
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

    const [user, setUser] = useState(() => (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {}))
    const [activeTab, setActiveTab] = useState('for_you')
    const [categoryTabs, setCategoryTabs] = useState([])
    const [activeCommunity, setActiveCommunity] = useState(null)
    const [showTopics, setShowTopics] = useState(false)
    const topicsBtnRef = useRef(null)
    const [topicsPos, setTopicsPos] = useState({ left: 0, top: 0 })
    const feedCategories = ['Sciences', 'Mathematics', 'Technology', 'Law', 'Medicine', 'Arts & Lit', 'Commerce', 'Campus Gist', 'Entertainment', 'Talent']
    const categories = feedCategories
    const [expandedPosts, setExpandedPosts] = useState(new Set())

    const toggleExpandPost = (postId) => {
        setExpandedPosts(prev => {
            const next = new Set(prev)
            if (next.has(postId)) next.delete(postId)
            else next.add(postId)
            return next
        })
    }

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

    useEffect(() => {
        const unlockAudio = () => {
            ensureAudio()
            window.removeEventListener('click', unlockAudio)
            window.removeEventListener('touchstart', unlockAudio)
            window.removeEventListener('keydown', unlockAudio)
        }
        window.addEventListener('click', unlockAudio)
        window.addEventListener('touchstart', unlockAudio)
        window.addEventListener('keydown', unlockAudio)
        return () => {
            window.removeEventListener('click', unlockAudio)
            window.removeEventListener('touchstart', unlockAudio)
            window.removeEventListener('keydown', unlockAudio)
        }
    }, [])

    const ensureAudio = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume().catch(() => {})
        }
    }

    const playNotifSound = () => {
        try {
            ensureAudio()
            const ctx = audioCtxRef.current
            if (ctx) {
                if (ctx.state === 'suspended') {
                    ctx.resume().catch(() => {})
                }
                const playTone = (freq, start, duration) => {
                    const osc = ctx.createOscillator()
                    const gain = ctx.createGain()
                    osc.connect(gain)
                    gain.connect(ctx.destination)
                    osc.frequency.value = freq
                    osc.type = 'sine'
                    gain.gain.setValueAtTime(0.3, start)
                    gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
                    osc.start(start)
                    osc.stop(start + duration)
                }
                const now = ctx.currentTime
                playTone(523.25, now, 0.15) // C5
                playTone(659.25, now + 0.12, 0.2) // E5
                playTone(783.99, now + 0.24, 0.25) // G5 chime!
            }
        } catch (e) {
            console.error('Audio play error', e)
        }
    }

    const showDesktopNotif = (title, body) => {
        if (!('Notification' in window)) return
        if (Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/favicon.ico' })
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission()
        }
    }

    useEffect(() => {
        const handlePostGifted = (e) => {
            const { postId, giftId } = e.detail || {}
            if (postId && giftId) {
                setPosts(prev => prev.map(p => {
                    if (p.id === postId || p._id === postId) {
                        const currentGifts = Array.isArray(p.gifts) ? p.gifts : []
                        return { ...p, gifts: [...currentGifts, giftId] }
                    }
                    return p
                }))
            }
        }
        window.addEventListener('postGifted', handlePostGifted)
        return () => window.removeEventListener('postGifted', handlePostGifted)
    }, [])

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
            if (activeTab === 'community' && activeCommunity) { comId = activeCommunity.id || activeCommunity._id || '' }
            const [postsRes, myPostsRes, notifRes, leaderRes, commRes, savedRes] = await Promise.all([
                getPosts(pageNum, searchQuery, tabParam, catParam, comId).catch(() => ({ data: { posts: [], totalPages: 1 } })),
                getUserPosts().catch(() => ({ data: [] })),
                getNotifications().catch(() => ({ data: [] })),
                getLeaderboard().catch(() => ({ data: [] })),
                getMyCommunities().catch(() => ({ data: [] })),
                getSavedPosts().catch(() => ({ data: [] })),
            ])
            let myComms = Array.isArray(commRes.data?.communities) ? commRes.data.communities : (Array.isArray(commRes.data) ? commRes.data : [])
            if (myComms.length === 0) {
                try {
                    const allComRes = await getCommunities()
                    const allList = Array.isArray(allComRes.data?.communities) ? allComRes.data.communities : (Array.isArray(allComRes.data) ? allComRes.data : [])
                    if (allList.length > 0) myComms = allList
                } catch (_) {}
            }
            setUserCommunities(myComms)
            const deptCom = myComms.find(c => c.type === 'department' || c.type === 'class')
            const defaultIds = deptCom ? [(deptCom.id || deptCom._id)] : myComms.length > 0 ? [(myComms[0].id || myComms[0]._id)] : []
            setSelectedCommunityIds(prev => prev.length > 0 ? prev : defaultIds.filter(Boolean))

            setMyPostCount(myPostsRes.data.length)
            setNotifications(notifRes.data)
            setUnreadCount(notifRes.data.filter(n => !n.read).length)
            prevUnreadRef.current = notifRes.data.filter(n => !n.read).length
            setLeaderboard(leaderRes.data.slice(0, 3))

            const savedIds = new Set((savedRes.data || []).map(s => s._id))

            const postsData = postsRes.data?.posts || postsRes.data || []
            setTotalPages(postsRes.data?.totalPages || 1)

            const realPosts = postsData.map(post => ({
                id: post.id || post._id,
                authorId: post.author?.id || post.author?._id || '',
                author: post.author?.name || 'Student',
                authorAvatar: post.author?.avatar || '',
                authorData: post.author,
                badgeSubscriptions: post.author?.badgeSubscriptions || [],
                isVerified: post.author?.isVerified || false,
                avatar: post.author?.avatar ? post.author.avatar : (post.author?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SH'),
                school: post.author?.school || '',
                level: post.author?.level || '',
                community: post.community || '',
                category: post.category,
                title: post.title,
                content: post.content,
                image: post.image || '',
                video: post.video || '',
                likes: post.likesCount ?? post.likes?.length ?? 0,
                liked: post.liked || post.likes?.includes(userId) || false,
                commentCount: post.commentCount ?? post.commentsData?.length ?? 0,
                time: new Date(post.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
                trending: post.trending || false,
                citationSource: post.citationSource || '',
                citationStatus: post.citationStatus || 'unverified',
                citationSummary: post.citationSummary || '',
                saved: savedIds.has(post.id || post._id),
                isReal: true
            }))

            realPosts.sort((a, b) => {
              const aGifts = Array.isArray(a.gifts) ? a.gifts.length : 0
              const bGifts = Array.isArray(b.gifts) ? b.gifts.length : 0
              if (bGifts !== aGifts) return bGifts - aGifts
              return 0
            })

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
        getMe().then(res => {
            if (res.data) {
                setUser(res.data)
                localStorage.setItem('user', JSON.stringify(res.data))
            }
        }).catch(() => {})
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

    const handleShowComments = async (post) => {
        const pId = post.id || post._id
        if (activeCommentPost?.id === pId || activeCommentPost?._id === pId) {
            setActiveCommentPost(null)
            return
        }
        setActiveCommentPost(post)
        if (!commentsMap[pId]) {
            try {
                const res = await getComments(pId)
                setCommentsMap(prev => ({ ...prev, [pId]: res.data }))
            } catch (err) {
                setCommentsMap(prev => ({ ...prev, [pId]: [] }))
            }
        }
    }

    const handleAddComment = async (postId, text, parentId) => {
        if (!text || !text.trim()) return
        const res = await addComment(postId, text, parentId)
        setCommentsMap(prev => ({ ...prev, [postId]: [...(prev[postId] || []), res.data] }))
        setPosts(prev => prev.map(p => (p.id === postId || p._id === postId) ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p))
        return res.data
    }

    const handleRefreshComments = async (postId) => {
        try {
            const res = await getComments(postId)
            setCommentsMap(prev => ({ ...prev, [postId]: res.data }))
        } catch (_) {}
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
        const postUrl = `${window.location.origin}/post/${post.id || post._id}`
        if (navigator.share) {
            navigator.share({ title: post.title || 'ScholarHub Post', url: postUrl })
        } else {
            navigator.clipboard.writeText(postUrl)
            alert('Post link copied to clipboard!')
        }
    }

    const handleVideoSelect = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setPostError('')
        const tier = getUserTier(user)
        if (tier === 'free') {
            setPostError('Free accounts can only post pictures. Upgrade to Basic (₦2,000/mo) to post up to 30s video.')
            return
        }

        // Check file size (max ~4.2MB to fit Vercel payload limit)
        if (file.size > 4.2 * 1024 * 1024) {
            setPostError(`Video file size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 4MB upload limit. Please select a compressed video clip.`)
            return
        }

        const duration = await getVideoDuration(file)
        const maxSec = tier === 'basic' ? 30 : tier === 'premium' ? 180 : 1800
        if (duration > maxSec) {
            const maxText = tier === 'basic' ? '30 seconds' : tier === 'premium' ? '3 minutes' : '30 minutes'
            setPostError(`Selected video is ${Math.round(duration)}s long. Your ${tier === 'basic' ? 'Basic' : 'Premium'} tier allows up to ${maxText}. Upgrade to post longer videos.`)
            return
        }
        const reader = new FileReader()
        reader.onloadend = () => setPostVideo(reader.result)
        reader.readAsDataURL(file)
    }

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setPostError('')
        if (file.size > 4.2 * 1024 * 1024) {
            setPostError(`Image file size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 4MB upload limit. Please select a smaller photo.`)
            return
        }
        const reader = new FileReader()
        reader.onloadend = () => setPostImage(reader.result)
        reader.readAsDataURL(file)
    }

    const handleCreatePost = async () => {
        if (!newPost.title.trim() || !newPost.content.trim()) {
            setPostError('Title and content are required')
            return
        }
        const tier = getUserTier(user)
        const wordCount = newPost.content.trim().split(/\s+/).length
        const charCount = newPost.content.length

        if (tier === 'free') {
            if (wordCount > 80) {
                setPostError('Free accounts can write up to 80 words. Upgrade to Premium for 1,000 words or Extra Premium for unlimited writing.')
                return
            }
            if (postVideo) {
                setPostError('Free accounts can only post pictures. Upgrade to Basic to post videos.')
                return
            }
        } else if (tier === 'basic') {
            if (wordCount > 500) {
                setPostError('Basic tier limit is 500 words. Upgrade to Premium for 1,000 words or Extra Premium for unlimited writing.')
                return
            }
        } else if (tier === 'premium') {
            if (wordCount > 1000 && charCount > 5000) {
                setPostError('Premium tier limit is 1,000 words. Upgrade to Extra Premium for unlimited writing.')
                return
            }
        }

        const validComIds = selectedCommunityIds.filter(id => id && typeof id === 'string' && id !== 'undefined')
        const finalCommunityIds = validComIds.length > 0 ? validComIds : userCommunities.map(c => c.id || c._id).filter(Boolean)

        setPostLoading(true)
        setPostError('')
        try {
            const postData = {
                title: newPost.title.trim(),
                content: newPost.content.trim(),
                category: newPost.category || 'Sciences',
                citationSource: formatCitationSource(newPost.citationSource),
                communityIds: finalCommunityIds,
                image: postImage || '',
                video: postVideo || ''
            }
            const res = await createPost(postData)
            setPostSuccess(true)
            const created = res.data?.post || res.data
            if (created && (created.id || created._id)) {
                const formattedPost = {
                    id: created.id || created._id,
                    title: created.title || postData.title,
                    content: created.content || postData.content,
                    category: created.category || postData.category,
                    image: created.image || postImage,
                    video: created.video || postVideo,
                    author: typeof created.author === 'string' ? created.author : (created.author?.name || user.name || 'Scholar'),
                    authorId: created.authorId || (typeof created.author === 'object' ? (created.author?.id || created.author?._id) : null) || user.id || user._id || '',
                    authorAvatar: (typeof created.author === 'object' ? created.author?.avatar : null) || user.avatar || '',
                    avatar: (user.name || 'Scholar').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SH',
                    likesCount: 0,
                    commentCount: 0,
                    liked: false,
                    time: 'Just now',
                    trending: false,
                    citationSource: created.citationSource || postData.citationSource,
                    citationStatus: created.citationStatus || 'unverified',
                    citationSummary: created.citationSummary || '',
                    saved: false,
                    isReal: true
                }
                setPosts(prev => [formattedPost, ...prev.filter(p => p.id !== formattedPost.id)])
            }
            setNewPost({ title: '', content: '', category: 'Sciences', citationSource: '', community: '' })
            setPostImage(null)
            setPostVideo(null)
            setTimeout(() => { setShowCreatePost(false); setPostSuccess(false); fetchPosts(1) }, 1500)
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
        const fromId = from?.id || from?._id
        const rawPostId = notif.postId || notif.post?.id || notif.post?._id || (typeof notif.post === 'string' ? notif.post : null)
        const postId = rawPostId && !rawPostId.startsWith('cmt') ? rawPostId : (notif.post?.id || notif.post?._id || null)

        if (notif.type === 'message') {
            router.push(fromId ? `/chat?user=${fromId}` : '/chat')
        } else if (notif.type === 'follow') {
            if (fromId) router.push(`/profile/${fromId}`)
        } else {
            if (postId) router.push(`/post/${postId}`)
            else router.push('/feed')
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
       
        <div className="min-h-screen bg-light md:pl-56 pt-16 md:pt-0 pb-24 md:pb-8">
            
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
                        className="w-8 h-8 flex-shrink-0 bg-primary rounded-xl flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-90 transition overflow-hidden">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                            user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SH'
                        )}
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
                        {userCommunities.filter(c => c.type !== 'general').map(c => {
                            const cId = c.id || c._id
                            const isActive = activeTab === 'community' && (activeCommunity?.id === cId || activeCommunity?._id === cId)
                            return (
                                <button key={cId}
                                    onClick={() => { setActiveCommunity(c); setActiveTab('community'); setPage(1) }}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap flex-shrink-0 ${isActive ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                                    {c.name}
                                </button>
                            )
                        })}
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
                                                className={`w-8 h-8 md:w-9 md:h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 overflow-hidden ${post.authorId && post.authorId !== user.id ? 'cursor-pointer hover:bg-primary/20 transition' : ''}`}>
                                                {post.authorAvatar || (post.avatar && post.avatar.startsWith('data:image')) ? (
                                                    <img src={post.authorAvatar || post.avatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    post.avatar
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    onClick={() => post.authorId && post.authorId !== user.id && router.push(`/profile/${post.authorId}`)}
                                                    className={`font-semibold text-dark text-xs md:text-sm leading-tight truncate flex items-center ${post.authorId && post.authorId !== user.id ? 'cursor-pointer hover:text-primary transition' : ''}`}>
                                                    <span>{(typeof post.author === 'string' ? post.author : (post.author?.name || 'Scholar')).split(' ').slice(0, 2).join(' ')}</span>
                                                    {renderAuthorBadge(post)}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    {post.school && (
                                                        <SchoolLogo school={post.school} size={16} className="shadow-xs" />
                                                    )}
                                                    <p className="text-xs text-gray-400">{post.time}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                                                {post.gifts && post.gifts.length > 0 && (
                                                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-extrabold px-2 py-0.5 rounded-full text-[10px] shadow-xs">
                                                        🔥 Top Ranking Post
                                                    </span>
                                                )}
                                                {post.citationStatus === 'verified' ? (
                                                    <span
                                                        title={post.citationSummary || (post.citationSource ? `Verified from: ${post.citationSource}` : 'Verified Academic Source')}
                                                        className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-bold px-2 py-0.5 rounded-full text-[10px] cursor-help shadow-xs"
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        🟢 Verified Source
                                                    </span>
                                                ) : (
                                                    <span
                                                        title={post.citationSummary || 'No verified source found in database (Unverified)'}
                                                        className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-medium px-2 py-0.5 rounded-full text-[10px] cursor-help"
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                        🟡 Unverified Source
                                                    </span>
                                                )}
                                                {post.trending && (
                                                    <span className="bg-accent/10 text-accent font-semibold px-1.5 py-0.5 rounded-full hidden sm:block text-[10px]">Trending</span>
                                                )}
                                                <span className="bg-primary/10 text-primary font-medium px-1.5 py-0.5 rounded-full text-[10px]">
                                                    {post.category}
                                                </span>
                                            </div>
                                        </div>

                                        <h3 onClick={() => router.push(`/post/${post.id}`)}
                                            className="font-bold text-dark text-sm md:text-base mb-1 leading-snug cursor-pointer hover:text-primary transition">
                                            {post.title}
                                        </h3>
                                        {post.citationSource && (
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 italic mb-1.5 flex items-center gap-1">
                                                <span className="font-semibold not-italic text-gray-700 dark:text-gray-300">📖 Citation:</span>
                                                <span>{post.citationSource}</span>
                                            </p>
                                        )}
                                        {post.content && (
                                            <div className="mb-3">
                                                <p className={`text-gray-600 dark:text-gray-300 text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${expandedPosts.has(post.id) ? '' : 'line-clamp-2'}`}>
                                                    {post.content}
                                                </p>
                                                {post.content.length > 90 && (
                                                    <button
                                                        onClick={(e) => {
                                                             e.stopPropagation()
                                                             toggleExpandPost(post.id)
                                                         }}
                                                         className="text-primary text-xs font-semibold hover:underline cursor-pointer mt-1 inline-block"
                                                     >
                                                         {expandedPosts.has(post.id) ? 'Show less' : 'Read more...'}
                                                     </button>
                                                 )}
                                             </div>
                                         )}
                                         {post.image && (
                                             <img src={post.image} alt="" className="w-full max-h-[520px] object-contain rounded-xl mb-3 bg-black/5 dark:bg-white/5 border border-gray-100 dark:border-slate-800/50"
                                                 onError={e => { e.target.style.display = 'none' }} />
                                         )}
                                         {post.video && (
                                             <video src={post.video} controls onClick={e => e.stopPropagation()} className="w-full rounded-xl mb-3 max-h-72" />
                                         )}

                                         {renderPostGifts(post.gifts)}

                                        <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
                                            <button onClick={() => toggleLike(post.id, post.isReal)}
                                                className={`flex items-center gap-1 transition-colors duration-200 ${post.liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
                                                <FiHeart size={14} className={post.liked ? 'fill-current' : ''} />
                                                <span className="text-xs">{post.likes}</span>
                                            </button>
                                            <button onClick={() => handleShowComments(post)}
                                                className={`flex items-center gap-1 transition-colors duration-200 ${activeCommentPost?.id === post.id ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}>
                                                <FiMessageCircle size={14} />
                                                <span className="text-xs">{post.commentCount || 0}</span>
                                            </button>
                                            <button onClick={() => handleShare(post)}
                                                className="flex items-center gap-1 text-gray-400 hover:text-primary transition-colors duration-200">
                                                <FiShare2 size={14} />
                                            </button>
                                            <button onClick={() => setGiftPost(post)}
                                                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors duration-200 cursor-pointer text-xs font-bold"
                                                title="Gift post author">
                                                <FiGift size={13} />
                                                <span>Gift</span>
                                            </button>
                                            <button onClick={() => toggleSave(post.id)}
                                                className={`ml-auto transition-colors duration-200 ${post.saved ? 'text-primary' : 'text-gray-300 hover:text-primary'}`}>
                                                <FiBookmark size={14} className={post.saved ? 'fill-current' : ''} />
                                            </button>
                                        </div>
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
                                <div className="flex justify-end items-center text-[11px] text-gray-400 px-1">
                                    <span className={
                                        (getUserTier(user) === 'free' && (newPost.content.trim() ? newPost.content.trim().split(/\s+/).length : 0) > 80) ||
                                        (getUserTier(user) === 'basic' && (newPost.content.trim() ? newPost.content.trim().split(/\s+/).length : 0) > 500) ||
                                        (getUserTier(user) === 'premium' && newPost.content.trim().split(/\s+/).length > 1000 && newPost.content.length > 5000)
                                            ? 'text-red-500 font-bold'
                                            : ''
                                    }>
                                        {getUserTier(user) === 'free'
                                            ? `${newPost.content.trim() ? newPost.content.trim().split(/\s+/).length : 0}/80 words (Free)`
                                            : getUserTier(user) === 'basic'
                                            ? `${newPost.content.trim() ? newPost.content.trim().split(/\s+/).length : 0}/500 words (Basic)`
                                            : getUserTier(user) === 'premium'
                                            ? `${newPost.content.trim() ? newPost.content.trim().split(/\s+/).length : 0}/1,000 words (Premium)`
                                            : 'Unlimited words (VIP)'}
                                    </span>
                                </div>
                                <CitationSourceInput
                                    value={newPost.citationSource || ''}
                                    onChange={val => setNewPost(prev => ({ ...prev, citationSource: val }))}
                                />
                                <select value={newPost.category} onChange={e => setNewPost({ ...newPost, category: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary transition text-dark">
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                {userCommunities.length > 0 && (
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-semibold text-gray-500">Post to communities:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {Array.from(new Map(userCommunities.map(c => [c.name?.trim(), c])).values()).map(c => {
                                                const cid = c.id || c._id
                                                if (!cid) return null
                                                const isSelected = selectedCommunityIds.includes(cid)
                                                return (
                                                    <label key={cid} onClick={e => { e.stopPropagation(); }}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border transition ${isSelected ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary/50'}`}>
                                                        <input type="checkbox" checked={isSelected}
                                                            onChange={() => setSelectedCommunityIds(prev => prev.includes(cid) ? prev.filter(id => id !== cid) : [...prev, cid])}
                                                            className="hidden" />
                                                        {c.name}
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 flex-wrap">
                                    {!postImage && !postVideo && (
                                        <>
                                            <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-zinc-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 transition text-xs text-gray-600 dark:text-gray-300 font-medium">
                                                <FiImage size={14} /> Add Image
                                                <input type="file" accept="image/*" hidden onChange={handleImageSelect} />
                                            </label>
                                            <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-zinc-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 transition text-xs text-gray-600 dark:text-gray-300 font-medium">
                                                <FiVideo size={14} /> Add Video
                                                <input type="file" accept="video/*" hidden onChange={handleVideoSelect} />
                                            </label>
                                        </>
                                    )}
                                    {postImage && (
                                        <div className="relative inline-flex items-center">
                                            <img src={postImage} alt="" className="h-12 w-12 object-cover rounded-xl border border-gray-200 dark:border-zinc-700 shadow-xs" />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    setPostImage(null)
                                                    setPostError('')
                                                }}
                                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 active:scale-90 text-white rounded-full text-xs flex items-center justify-center cursor-pointer shadow-md font-bold transition"
                                                title="Remove image"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                    {postVideo && (
                                        <div className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 rounded-xl text-xs font-bold shadow-xs">
                                            <FiVideo size={15} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                            <span>Video attached</span>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    setPostVideo(null)
                                                    setPostError('')
                                                }}
                                                className="w-5 h-5 ml-1 bg-red-500 hover:bg-red-600 active:scale-90 text-white rounded-full text-xs flex items-center justify-center cursor-pointer shadow-xs font-bold transition flex-shrink-0"
                                                title="Remove video"
                                            >
                                                ✕
                                            </button>
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

            <CommentDrawer
                isOpen={!!activeCommentPost}
                post={activeCommentPost}
                user={user}
                setUser={setUser}
                onClose={() => setActiveCommentPost(null)}
                comments={activeCommentPost ? (commentsMap[activeCommentPost.id || activeCommentPost._id] || []) : []}
                onAddComment={handleAddComment}
                onRefreshComments={handleRefreshComments}
            />

            <PostGiftModal
                isOpen={Boolean(giftPost)}
                post={giftPost}
                onClose={() => setGiftPost(null)}
            />

            <SOSButton />
        </div>
    )
}

export default Home
