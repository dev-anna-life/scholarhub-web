'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiGift, FiThumbsUp, FiLightbulb, FiImage, FiZap, FiStar, FiAward, FiCheck } from 'react-icons/fi'
import { BsCoin } from 'react-icons/bs'
import { giftReaction, sendCoins } from '../api/auth'

const reactionGifts = [
  { id: 'gift_helpful', name: 'Helpful', price: 10, icon: FiThumbsUp, color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10' },
  { id: 'gift_insightful', name: 'Insightful', price: 25, icon: FiLightbulb, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' },
  { id: 'gift_creative', name: 'Creative', price: 50, icon: FiImage, color: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10' },
  { id: 'gift_brilliant', name: 'Brilliant', price: 100, icon: FiZap, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10' },
  { id: 'gift_intelligent', name: 'Super Intelligent', price: 250, icon: FiStar, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' },
  { id: 'gift_masterclass', name: 'Masterclass', price: 500, icon: FiAward, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
]

export default function PostGiftModal({ post, isOpen, onClose }) {
  const [tab, setTab] = useState('reactions') // 'reactions' | 'custom'
  const [customCoins, setCustomCoins] = useState('')
  const [loadingId, setLoadingId] = useState(null)
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' })

  if (!isOpen || !post) return null

  const getSafeName = (val) => {
    if (!val) return 'Author'
    if (typeof val === 'string') return val
    if (typeof val === 'object') return val.name || val.username || 'Author'
    return 'Author'
  }

  const getSafeUsername = (val, postObj) => {
    if (postObj?.authorUsername && typeof postObj.authorUsername === 'string') return postObj.authorUsername
    if (typeof val === 'string') return val
    if (typeof val === 'object' && val) return val.username || val.name || ''
    return ''
  }

  const authorName = getSafeName(post.author)
  const recipientId = post.authorId || (typeof post.author === 'object' ? (post.author?._id || post.author?.id) : null)

  const handleSendReaction = async (gift) => {
    setLoadingId(gift.id)
    setStatusMsg({ text: '', type: '' })
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      const currentCoins = storedUser.coins ?? 0

      if (currentCoins < gift.price) {
        setStatusMsg({ text: `Not enough coins. You need ${gift.price} coins.`, type: 'error' })
        setLoadingId(null)
        return
      }

      const newCoins = Math.max(0, currentCoins - gift.price)
      storedUser.coins = newCoins
      localStorage.setItem('user', JSON.stringify(storedUser))
      window.dispatchEvent(new Event('userStateChange'))

      if (recipientId) {
        await giftReaction({
          itemId: gift.id,
          recipientId,
          postId: post.id || post._id,
        })
      }

      setStatusMsg({ text: `🎁 Awarded ${gift.name} reaction to ${authorName}! (+${gift.price} coins)`, type: 'success' })
      setTimeout(() => {
        setStatusMsg({ text: '', type: '' })
        onClose()
      }, 1500)
    } catch (err) {
      setStatusMsg({ text: err.response?.data?.message || 'Failed to send gift', type: 'error' })
    } finally {
      setLoadingId(null)
    }
  }

  const handleSendCustomCoins = async () => {
    const amount = parseInt(customCoins)
    if (!amount || amount < 1) {
      setStatusMsg({ text: 'Please enter a valid coin amount', type: 'error' })
      return
    }
    setLoadingId('custom')
    setStatusMsg({ text: '', type: '' })
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      const currentCoins = storedUser.coins ?? 0

      if (currentCoins < amount) {
        setStatusMsg({ text: `Not enough coins. You have ${currentCoins} coins.`, type: 'error' })
        setLoadingId(null)
        return
      }

      const newCoins = Math.max(0, currentCoins - amount)
      storedUser.coins = newCoins
      localStorage.setItem('user', JSON.stringify(storedUser))
      window.dispatchEvent(new Event('userStateChange'))

      const username = getSafeUsername(post.author, post)
      if (username) {
        await sendCoins(username, amount)
      }

      setStatusMsg({ text: `💰 Sent ${amount} coins to ${authorName}!`, type: 'success' })
      setTimeout(() => {
        setStatusMsg({ text: '', type: '' })
        setCustomCoins('')
        onClose()
      }, 1500)
    } catch (err) {
      setStatusMsg({ text: err.response?.data?.message || 'Failed to send coins', type: 'error' })
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-[#1e1e22] text-dark dark:text-white rounded-3xl p-5 md:p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10 z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <FiGift size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base md:text-lg">Gift {authorName}</h3>
                <p className="text-xs text-gray-400">Award coins or reactions for this post</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-dark dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition">
              <FiX size={20} />
            </button>
          </div>

          {/* Status Alert */}
          {statusMsg.text && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-2xl text-xs font-semibold mb-4 text-center ${statusMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {statusMsg.text}
            </motion.div>
          )}

          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl mb-4">
            <button
              onClick={() => setTab('reactions')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${tab === 'reactions' ? 'bg-white dark:bg-[#27272a] text-primary shadow-xs' : 'text-gray-400 hover:text-dark dark:hover:text-white'}`}
            >
              Reaction Gifts
            </button>
            <button
              onClick={() => setTab('custom')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${tab === 'custom' ? 'bg-white dark:bg-[#27272a] text-primary shadow-xs' : 'text-gray-400 hover:text-dark dark:hover:text-white'}`}
            >
              Custom Coins
            </button>
          </div>

          {/* Reaction Gifts Grid */}
          {tab === 'reactions' && (
            <div className="grid grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {reactionGifts.map((gift) => {
                const Icon = gift.icon
                const isSending = loadingId === gift.id
                return (
                  <button
                    key={gift.id}
                    onClick={() => handleSendReaction(gift)}
                    disabled={Boolean(loadingId)}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl border border-gray-100 dark:border-white/10 hover:border-primary/40 dark:hover:border-white/30 hover:shadow-md transition active:scale-95 text-center group cursor-pointer disabled:opacity-50"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 transition ${gift.color}`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-xs font-bold truncate max-w-full">{gift.name}</span>
                    <span className="text-[11px] font-semibold text-amber-500 flex items-center gap-1 mt-0.5">
                      <BsCoin size={12} /> {gift.price}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Custom Coins Tab */}
          {tab === 'custom' && (
            <div className="space-y-4 py-2">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Coin Amount</label>
                <div className="relative">
                  <BsCoin className="absolute left-3.5 top-3 text-amber-500" size={18} />
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 50"
                    value={customCoins}
                    onChange={(e) => setCustomCoins(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm font-bold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <button
                onClick={handleSendCustomCoins}
                disabled={loadingId === 'custom' || !customCoins}
                className="w-full py-3 bg-primary text-white rounded-2xl text-sm font-bold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md"
              >
                {loadingId === 'custom' ? 'Sending...' : 'Send Coins 🎁'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
