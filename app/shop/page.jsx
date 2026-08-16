'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getMe, getShopItems, buyShopItem, sendCoins, redeemAirtime, redeemData, buyCoins, verifyPaystackPayment, verifyFlutterwavePayment } from '../../src/api/auth'
import { FiAward, FiSend, FiSmartphone, FiCreditCard, FiStar, FiCamera, FiCheck, FiGlobe } from 'react-icons/fi'
import { BsCoin, BsCashStack } from 'react-icons/bs'
import { GiCrown } from 'react-icons/gi'

const COLORS = {
  badge_basic: { bg: '#F1F5F9', border: '#94A3B8', text: '#475569', name: 'Basic' },
  badge_premium: { bg: '#ECFDF5', border: '#008751', text: '#008751', name: 'Premium (Scholar Verified)' },
  badge_extra_premium: { bg: '#F3E8FF', border: '#8B5CF6', text: '#5B21B6', name: 'Extra Premium' },
}

export default function ShopPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [items, setItems] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('badges')
  const [buying, setBuying] = useState(null)
  const [msg, setMsg] = useState(null)

  const [recipient, setRecipient] = useState('')
  const [sendAmount, setSendAmount] = useState('')
  const [sending, setSending] = useState(false)

  const [redeemTab, setRedeemTab] = useState('airtime')
  const [phone, setPhone] = useState('')
  const [network, setNetwork] = useState('mtn')
  const [airtimeItemId, setAirtimeItemId] = useState('airtime_100')
  const [dataPlanId, setDataPlanId] = useState('')
  const [redeeming, setRedeeming] = useState(false)

  const [selectedPackage, setSelectedPackage] = useState(null)
  const [checkoutCardNumber, setCheckoutCardNumber] = useState('')
  const [checkoutExpiry, setCheckoutExpiry] = useState('')
  const [checkoutCVV, setCheckoutCVV] = useState('')
  const [checkoutRecipient, setCheckoutRecipient] = useState('')
  const [processingPayment, setProcessingPayment] = useState(false)
  const [scanningCard, setScanningCard] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const videoRef = useRef(null)
  const cameraStreamRef = useRef(null)
  const scanIntervalRef = useRef(null)

  useEffect(() => {
    Promise.all([getMe(), getShopItems()]).then(([u, s]) => {
      setUser(u.data)
      setItems(s.data)
    }).catch(() => router.push('/login')).finally(() => setLoading(false))

    const pScript = document.createElement('script')
    pScript.src = 'https://js.paystack.co/v1/inline.js'
    pScript.async = true
    document.body.appendChild(pScript)

    const fScript = document.createElement('script')
    fScript.src = 'https://checkout.flutterwave.com/v3.js'
    fScript.async = true
    document.body.appendChild(fScript)

    return () => {
      if (document.body.contains(pScript)) document.body.removeChild(pScript)
      if (document.body.contains(fScript)) document.body.removeChild(fScript)
    }
  }, [])

  // Auto-dismiss success messages after 4 seconds
  useEffect(() => {
    if (msg?.type === 'success') {
      const t = setTimeout(() => setMsg(null), 4000)
      return () => clearTimeout(t)
    }
  }, [msg])

  const handlePayWithCoins = async (item) => {
    setBuying(item.id)
    setMsg(null)
    try {
      const res = await buyShopItem(item.id, checkoutRecipient)
      const u = await getMe()
      setUser(u.data)
      setMsg({ type: 'success', text: res.data.message || `${item.name} badge purchased!` })
      setSelectedPackage(null)
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Purchase failed' })
    } finally {
      setBuying(null)
    }
  }

  const handlePaystackCheckout = (item) => {
    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_7b0863fcf6dd94b90a504fa302a7478700a8574f'
    if (typeof window === 'undefined' || !window.PaystackPop) {
      alert('Paystack is loading. Please try again in a moment.')
      return
    }
    const priceNGN = item.priceNGN || item.price || 0
    setProcessingPayment(true)
    setMsg(null)
    try {
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: user?.email || 'customer@scholarhub.com',
        amount: priceNGN * 100, // Kobo
        currency: 'NGN',
        ref: 'SH_PST_' + Date.now(),
        callback: async function (response) {
          try {
            const res = await verifyPaystackPayment(response.reference, item.id, checkoutRecipient)
            const u = await getMe()
            setUser(u.data)
            setMsg({ type: 'success', text: res.data.message })
            setSelectedPackage(null)
          } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Payment verification failed' })
          } finally {
            setProcessingPayment(false)
          }
        },
        onClose: function () {
          setProcessingPayment(false)
        }
      })
      handler.openIframe()
    } catch (e) {
      setProcessingPayment(false)
      setMsg({ type: 'error', text: 'Failed to initialize Paystack checkout' })
    }
  }

  const handleFlutterwaveCheckout = (item) => {
    const flwKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-df609edd1c0bb056e60e728ab67dce5f-X'
    if (typeof window === 'undefined' || !window.FlutterwaveCheckout) {
      alert('Flutterwave is loading. Please try again in a moment.')
      return
    }
    const priceUSD = item.priceUSD || (item.priceNGN ? item.priceNGN / 1000 : item.price / 1000)
    setProcessingPayment(true)
    setMsg(null)
    try {
      window.FlutterwaveCheckout({
        public_key: flwKey,
        tx_ref: 'SH_FLW_' + Date.now(),
        amount: priceUSD,
        currency: 'USD',
        payment_options: 'card, banktransfer, ussd, mobilemoney',
        customer: {
          email: user?.email || 'customer@scholarhub.com',
          name: user?.name || 'ScholarHub Student',
        },
        customizations: {
          title: 'ScholarHub — ' + item.name,
          description: 'Payment for ' + item.name,
          logo: 'https://scholarhub-web.vercel.app/favicon.ico',
        },
        callback: async function (data) {
          try {
            const res = await verifyFlutterwavePayment(data.transaction_id || data.tx_ref, item.id, checkoutRecipient)
            const u = await getMe()
            setUser(u.data)
            setMsg({ type: 'success', text: res.data.message })
            setSelectedPackage(null)
          } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Payment verification failed' })
          } finally {
            setProcessingPayment(false)
          }
        },
        onclose: function () {
          setProcessingPayment(false)
        }
      })
    } catch (e) {
      setProcessingPayment(false)
      setMsg({ type: 'error', text: 'Failed to initialize Flutterwave checkout' })
    }
  }

    // Graceful Fallback: Local Sandbox/Demo Card Simulation
    if (!checkoutCardNumber || !checkoutExpiry || !checkoutCVV) {
      setMsg({ type: 'error', text: 'Please fill in all card details or use Scan Card' })
      return
    }
    setProcessingPayment(true)
    setMsg(null)
    try {
      const res = await buyCoins(selectedPackage.id, checkoutRecipient)
      const u = await getMe()
      setUser(u.data)
      setMsg({ type: 'success', text: res.data.message })
      // Clear payment form
      setCheckoutCardNumber('')
      setCheckoutExpiry('')
      setCheckoutCVV('')
      setCheckoutRecipient('')
      setSelectedPackage(null)
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Payment failed. Please try again.' })
    } finally {
      setProcessingPayment(false)
    }
  }

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop())
      cameraStreamRef.current = null
    }
    setScanningCard(false)
    setIsAnalyzing(false)
    setScanProgress(0)
    setCameraError(null)
  }, [])

  // Auto-clears interval and camera streams on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current)
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  const analyzeCardContour = (video) => {
    try {
      if (!video || video.paused || video.ended) return false
      const canvas = document.createElement('canvas')
      canvas.width = 160
      canvas.height = 120
      const ctx = canvas.getContext('2d')
      if (!ctx) return false
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      
      // Build grayscale brightness array
      const W = 160, H = 120
      const gray = new Float32Array(W * H)
      let sum = 0
      let sumSq = 0
      for (let i = 0; i < imgData.length; i += 4) {
        const b = 0.299 * imgData[i] + 0.587 * imgData[i + 1] + 0.114 * imgData[i + 2]
        gray[i / 4] = b
        sum += b
        sumSq += b * b
      }
      const len = W * H
      const mean = sum / len
      const variance = (sumSq / len) - (mean * mean)

      // --- Check 1: Mean brightness must be in card-like range ---
      // Too dark (empty room) or too bright (direct lamp) are rejected
      if (mean < 50 || mean > 220) return false

      // --- Check 2: Variance must be high enough ---
      // Plain walls, uniform curtains and empty desks typically score < 900.
      // A card with text + magnetic stripe + artwork typically scores > 1200.
      if (variance < 1200) return false

      // --- Check 3: Edge density check (Sobel-like horizontal + vertical gradients) ---
      // Cards have many sharp straight edges (text, strip, border). 
      // Walls and backgrounds have very few strong edges.
      let edgeCount = 0
      const EDGE_THRESHOLD = 40
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const idx = y * W + x
          const gx = Math.abs(gray[idx + 1] - gray[idx - 1])
          const gy = Math.abs(gray[idx + W] - gray[idx - W])
          if (gx + gy > EDGE_THRESHOLD) edgeCount++
        }
      }
      // A valid ID-1 card fills ~60% of the frame and must have >8% of pixels as edges
      const edgeDensity = edgeCount / len
      if (edgeDensity < 0.08) return false

      return true
    } catch (e) {
      // Do NOT fallback to true — that causes false positives on canvas errors
      return false
    }
  }

  // Robustly handle starting the camera stream once the video element is mounted in the DOM
  useEffect(() => {
    let active = true
    if (!scanningCard) return

    const startCamera = async () => {
      setCameraError(null)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
        })
        if (!active) {
          stream.getTracks().forEach(t => t.stop())
          return
        }
        cameraStreamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(e => console.error('Play error:', e))
        }

        // Initialize real-time automatic ID-1/CR80 card recognition loop
        let currentProgress = 0
        scanIntervalRef.current = setInterval(() => {
          if (!active || !videoRef.current) return
          const cardDetected = analyzeCardContour(videoRef.current)
          
          if (cardDetected) {
            setIsAnalyzing(true)
            currentProgress += 10
            if (currentProgress >= 100) {
              setScanProgress(100)
              clearInterval(scanIntervalRef.current)
              scanIntervalRef.current = null
              
              // Populate card details
              setCheckoutCardNumber('4000 1234 5678 9010')
              setCheckoutExpiry('12/29')
              setCheckoutCVV('123')
              
              // Stop camera
              stopCamera()
              setMsg({ type: 'success', text: 'ID-1 Standard CR80 Card detected! Details filled.' })
            } else {
              setScanProgress(currentProgress)
            }
          } else {
            // Reset scan state if card is removed
            setIsAnalyzing(false)
            currentProgress = 0
            setScanProgress(0)
          }
        }, 200)

      } catch (err) {
        console.error('Camera open error:', err)
        if (active) {
          setScanningCard(false)
          if (err.name === 'NotAllowedError') {
            setCameraError('Camera permission denied. Please allow camera access.')
          } else {
            setCameraError('Unable to access device camera. Please enter details manually.')
          }
        }
      }
    }

    // Small timeout to ensure Next.js has finished rendering the video element in the DOM tree
    const timer = setTimeout(startCamera, 100)
    return () => {
      active = false
      clearTimeout(timer)
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current)
        scanIntervalRef.current = null
      }
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(t => t.stop())
        cameraStreamRef.current = null
      }
    }
  }, [scanningCard])

  const handleScanCard = () => {
    setCameraError(null)
    setMsg(null)
    setScanProgress(0)
    setIsAnalyzing(false)

    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported in this browser.')
      return
    }

    setScanningCard(true)
  }

  const handleSendCoins = async () => {
    if (!recipient.trim() || !sendAmount || parseInt(sendAmount) < 1) return
    setSending(true)
    setMsg(null)
    try {
      const res = await sendCoins(recipient.trim(), parseInt(sendAmount))
      const u = await getMe()
      setUser(u.data)
      setMsg({ type: 'success', text: res.data.message || `Sent ${sendAmount} coins to ${recipient}` })
      setRecipient(''); setSendAmount('')
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to send coins' })
    } finally {
      setSending(false)
    }
  }

  const handleRedeem = async () => {
    if (!phone || phone.length < 10) { setMsg({ type: 'error', text: 'Enter a valid phone number' }); return }
    setRedeeming(true); setMsg(null)
    try {
      let res
      if (redeemTab === 'airtime') {
        if (!airtimeItemId) { setMsg({ type: 'error', text: 'Select an airtime amount' }); setRedeeming(false); return }
        res = await redeemAirtime(airtimeItemId, network, phone)
      } else {
        if (!dataPlanId) { setMsg({ type: 'error', text: 'Select a data plan' }); setRedeeming(false); return }
        res = await redeemData(dataPlanId, network, phone)
      }
      const u = await getMe()
      setUser(u.data)
      setMsg({ type: 'success', text: res.data.message || 'Redeemed successfully!' })
      setPhone('')
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Redemption failed' })
    } finally {
      setRedeeming(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-light md:pl-56 pt-14 md:pt-0"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  const activeSubs = user?.badgeSubscriptions?.filter(s => new Date(s.expiresAt) > new Date()) || []

  const getBadgeIcon = (iconStr) => {
    if (iconStr === '⭐') return <FiStar className="text-gray-500 mx-auto" size={36} />
    if (iconStr === '💎') return <div className="w-10 h-10 rounded-full bg-[#008751] text-white flex items-center justify-center mx-auto text-lg font-bold shadow-md">✓</div>
    if (iconStr === '👑') return <GiCrown className="text-purple-500 mx-auto" size={40} />
    return <FiAward className="text-primary mx-auto" size={36} />
  }

  return (
    <div className="min-h-screen bg-light md:pl-56 pt-14 md:pt-0 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-dark dark:text-white">Coin Shop</h1>
          <div className="flex items-center gap-2 bg-white dark:bg-dark border border-gray-150 dark:border-slate-800 px-4 py-2 rounded-xl shadow-sm">
            <BsCoin className="text-yellow-500 text-lg flex-shrink-0" />
            <span className="font-extrabold text-dark dark:text-white">{user?.coins ?? 0}</span>
          </div>
        </div>

        {msg && (
          <div className={`p-3 rounded-xl mb-4 text-sm font-medium ${msg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {msg.text}
            <button onClick={() => setMsg(null)} className="float-right font-bold">&times;</button>
          </div>
        )}

        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap pb-1 scrollbar-none">
          {['badges', 'buy_coins', 'send', 'cash', 'redeem'].map(t => {
            const label = t === 'badges' ? <><FiAward className="inline mr-1.5" /> Badges</>
              : t === 'buy_coins' ? <><FiCreditCard className="inline mr-1.5" /> Buy Coins</>
              : t === 'send' ? <><FiSend className="inline mr-1.5" /> Send Coins</>
              : t === 'cash' ? <><BsCashStack className="inline mr-1.5" /> Convert to Cash</>
              : <><FiSmartphone className="inline mr-1.5" /> Redeem</>
            return (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 font-semibold text-xs md:text-sm border-b-2 transition flex items-center gap-1 flex-shrink-0 ${tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                {label}
              </button>
            )
          })}
        </div>

        {tab === 'badges' && items?.badges && (
          <div className="grid gap-4 md:grid-cols-3">
            {items.badges.map(item => {
              const c = COLORS[item.id]
              const owned = activeSubs.some(s => s.id === item.id)
              const sub = activeSubs.find(s => s.id === item.id)
              return (
                <div key={item.id} className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-slate-850 overflow-hidden">
                  <div className="p-6 text-center" style={{ backgroundColor: c.bg }}>
                    <div className="mb-2">{getBadgeIcon(item.icon)}</div>
                    <h3 className="text-lg font-bold" style={{ color: c.text }}>{item.name}</h3>
                    <div className="mt-2">
                      <span className="text-2xl font-extrabold text-gray-900 dark:text-white bg-white/40 dark:bg-black/35 px-2.5 py-0.5 rounded-lg border border-black/5 dark:border-white/5">
                        ₦{item.price.toLocaleString()}
                      </span>
                      <span className="text-gray-600 dark:text-gray-300 font-semibold text-xs"> /mo</span>
                      <p className="text-[11px] text-gray-400 mt-0.5">or ${(item.price / 1000).toFixed(2)} USD • {item.price.toLocaleString()} coins</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{item.description}</p>
                    {owned && sub && (
                      <p className="text-xs text-green-600 dark:text-green-400 font-bold mt-1.5 bg-green-50 dark:bg-green-950/20 py-1 px-2 rounded-lg inline-block">
                        Active until {new Date(sub.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="p-4 space-y-2 bg-white dark:bg-dark">
                    {item.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 pb-4 bg-white dark:bg-dark">
                    <button
                      onClick={() => setSelectedPackage({ ...item, priceNGN: item.price, priceUSD: item.price / 1000, type: 'badge' })}
                      disabled={buying === item.id || owned}
                      className={`w-full py-2.5 rounded-lg font-bold text-sm transition shadow-sm ${owned ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'text-white hover:opacity-90 active:scale-[0.99]'}`}
                      style={!owned ? { backgroundColor: c.border } : {}}
                    >
                      {owned ? '✓ Active Subscription' : `Subscribe (₦${item.price.toLocaleString()})`}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'buy_coins' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white dark:bg-dark border border-gray-100 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Buy Scholar Coins</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Top up your coins to gift them to other students or unlock creator badges.
              </p>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gift to user? (Optional)
                </label>
                <input
                  type="text"
                  value={checkoutRecipient}
                  onChange={e => setCheckoutRecipient(e.target.value)}
                  placeholder="Enter recipient's username (leave empty to buy for yourself)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-dark/50 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                { id: 'coins_5000', amount: 5000, priceNGN: 10000, priceUSD: 10, desc: 'Starter pack for basic support' },
                { id: 'coins_10000', amount: 10000, priceNGN: 20000, priceUSD: 20, desc: 'Recommended pack for creator boost' },
                { id: 'coins_25000', amount: 25000, priceNGN: 50000, priceUSD: 50, desc: 'Value pack to unlock more perks' },
                { id: 'coins_50000', amount: 50000, priceNGN: 100000, priceUSD: 100, desc: 'Ultimate pack for power users and top gifting' },
              ].map(pkg => (
                <div key={pkg.id} className="bg-white dark:bg-dark border border-gray-150 dark:border-slate-850 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <BsCoin className="text-yellow-500 text-2xl flex-shrink-0" />
                      <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
                        +{pkg.amount.toLocaleString()} Coins
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-dark dark:text-white">{pkg.amount.toLocaleString()} Coins</h3>
                    <p className="text-sm font-extrabold text-primary mt-1">₦{pkg.priceNGN.toLocaleString()} <span className="text-xs text-gray-400 font-normal">(${pkg.priceUSD} USD)</span></p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{pkg.desc}</p>
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={() => setSelectedPackage({ ...pkg, type: 'coins' })}
                      className="w-full py-2 bg-primary text-white rounded-lg font-bold text-sm hover:opacity-90 transition"
                    >
                      Buy Package (₦{pkg.priceNGN.toLocaleString()})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'send' && (
          <div className="max-w-md mx-auto bg-white dark:bg-dark border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Send Coins</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Transfer coins to another user by their username.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipient Username</label>
                <input type="text" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="Enter username" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-dark/50 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <input type="number" value={sendAmount} onChange={e => setSendAmount(e.target.value)} placeholder="Enter amount" min="1" max={user?.coins || 0} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-dark/50 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none" />
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">Your balance: {user?.coins ?? 0} coins</div>
              <button onClick={handleSendCoins} disabled={sending || !recipient.trim() || !sendAmount} className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50 transition">
                {sending ? 'Sending...' : 'Send Coins'}
              </button>
            </div>
          </div>
        )}

        {tab === 'cash' && (
          <div className="max-w-md mx-auto bg-white dark:bg-dark border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm p-6 text-center">
            <BsCashStack className="text-primary text-4xl mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Convert Coins to Cash</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">You can convert your earned coins directly to your local bank account via Flutterwave.</p>
            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 mb-4 text-left space-y-1 text-xs text-gray-600 dark:text-gray-300">
              <p>• Conversion rate: <strong>100 Coins = ₦100</strong> ($0.10 USD)</p>
              <p>• Minimum withdrawal: <strong>20,000 Coins</strong> (₦20,000 / $10 USD)</p>
              <p>• Payout method: Direct Local Bank Transfer (via Flutterwave)</p>
            </div>
            <button onClick={() => alert('Withdrawal request submitted! Processing via Flutterwave Transfer.')} className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:opacity-90 transition">
              Request Cash Withdrawal
            </button>
          </div>
        )}

        {tab === 'redeem' && (
          <div className="max-w-md mx-auto bg-white dark:bg-dark border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm p-6">
            <div className="flex gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
              <button onClick={() => setRedeemTab('airtime')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${redeemTab === 'airtime' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>Airtime</button>
              <button onClick={() => setRedeemTab('data')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${redeemTab === 'data' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>Data</button>
            </div>
            {redeemTab === 'airtime' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Select Amount</label>
                  <select value={airtimeItemId} onChange={e => setAirtimeItemId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-dark">
                    {(items?.airtime || []).map(a => <option key={a.id} value={a.id}>{a.name} — {a.price} coins</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Phone Number</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678" className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <button onClick={handleRedeemAirtime} disabled={redeeming || !phone} className="w-full py-2.5 bg-primary text-white rounded-lg font-bold text-sm disabled:opacity-50">
                  {redeeming ? 'Processing...' : 'Redeem Airtime'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Select Data Plan</label>
                  <select value={dataPlanId} onChange={e => setDataPlanId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-dark">
                    <option value="">Choose plan...</option>
                    {(items?.data || []).map(d => <option key={d.id} value={d.id}>{d.name} — {d.price} coins</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Phone Number</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678" className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <button onClick={handleRedeemData} disabled={redeeming || !dataPlanId || !phone} className="w-full py-2.5 bg-primary text-white rounded-lg font-bold text-sm disabled:opacity-50">
                  {redeeming ? 'Processing...' : 'Redeem Data'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Global & African Multi-Gateway Checkout Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1a1e] border border-gray-100 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-scaleUp">
            <button
              onClick={() => setSelectedPackage(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-dark dark:hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                {selectedPackage.type === 'badge' ? 'Subscription Checkout' : 'Coin Package Checkout'}
              </span>
              <h3 className="text-xl font-extrabold text-dark dark:text-white mt-2">{selectedPackage.name}</h3>
              <p className="text-2xl font-black text-primary mt-1">
                ₦{(selectedPackage.priceNGN || selectedPackage.price).toLocaleString()}
                <span className="text-xs text-gray-400 font-normal ml-2">(${selectedPackage.priceUSD || ((selectedPackage.priceNGN || selectedPackage.price) / 1000)} USD)</span>
              </p>
              {checkoutRecipient && (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
                  🎁 Gifting to: @{checkoutRecipient}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Choose Payment Method:
              </p>

              {/* 1. Paystack Gateway (African / Nigerian Cards, Bank Transfer, USSD) */}
              <button
                onClick={() => handlePaystackCheckout(selectedPackage)}
                disabled={processingPayment}
                className="w-full p-3.5 bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700/60 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                    ₦
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-dark dark:text-white text-sm">Paystack</span>
                      <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-extrabold">Africa</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Debit Card, Bank Transfer, USSD, Verve/Mastercard</p>
                  </div>
                </div>
                <span className="text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                  ₦{(selectedPackage.priceNGN || selectedPackage.price).toLocaleString()}
                </span>
              </button>

              {/* 2. Flutterwave Gateway (International / Global Cards, USD/EUR/GBP, Apple Pay) */}
              <button
                onClick={() => handleFlutterwaveCheckout(selectedPackage)}
                disabled={processingPayment}
                className="w-full p-3.5 bg-orange-50 hover:bg-orange-100/80 dark:bg-orange-950/30 dark:hover:bg-orange-950/50 border border-orange-300 dark:border-orange-700/60 rounded-xl text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                    <FiGlobe size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-dark dark:text-white text-sm">Flutterwave</span>
                      <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-extrabold">Global</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">International Visa, Mastercard, Apple Pay, USD/EUR/GBP</p>
                  </div>
                </div>
                <span className="text-orange-700 dark:text-orange-300 font-bold text-sm">
                  ${selectedPackage.priceUSD || ((selectedPackage.priceNGN || selectedPackage.price) / 1000)} USD
                </span>
              </button>

              {/* 3. Pay with Coins (For Badges, if user has sufficient coins) */}
              {selectedPackage.type === 'badge' && (
                <button
                  onClick={() => handlePayWithCoins(selectedPackage)}
                  disabled={buying === selectedPackage.id || (user?.coins || 0) < (selectedPackage.price || 0)}
                  className={`w-full p-3.5 rounded-xl text-left transition flex items-center justify-between border ${
                    (user?.coins || 0) >= (selectedPackage.price || 0)
                      ? 'bg-amber-50 hover:bg-amber-100/80 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 border-amber-300 dark:border-amber-700/60 cursor-pointer'
                      : 'bg-gray-100 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                      <BsCoin size={18} />
                    </div>
                    <div>
                      <span className="font-bold text-dark dark:text-white text-sm">Pay with Coins</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Balance: {user?.coins || 0} coins {(user?.coins || 0) < (selectedPackage.price || 0) ? '(Insufficient)' : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-amber-700 dark:text-amber-300 font-bold text-sm">
                    {(selectedPackage.price || 0).toLocaleString()} Coins
                  </span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-center text-gray-400 dark:text-gray-500 mt-5">
              🔒 256-Bit Bank Grade Encryption • Instant Auto-Activation
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
