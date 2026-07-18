'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getMe, getShopItems, buyShopItem, sendCoins, redeemAirtime, redeemData, buyCoins } from '../../src/api/auth'

const COLORS = {
  badge_basic: { bg: '#F1F5F9', border: '#94A3B8', text: '#475569', name: 'Basic' },
  badge_premium: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E', name: 'Premium' },
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

  useEffect(() => {
    Promise.all([getMe(), getShopItems()]).then(([u, s]) => {
      setUser(u.data)
      setItems(s.data)
    }).catch(() => router.push('/login')).finally(() => setLoading(false))
  }, [])

  const handleBuy = async (item) => {
    setBuying(item.id)
    setMsg(null)
    try {
      const res = await buyShopItem(item.id)
      const u = await getMe()
      setUser(u.data)
      setMsg({ type: 'success', text: res.data.message || `${item.name} badge purchased!` })
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Purchase failed' })
    } finally {
      setBuying(null)
    }
  }

  const handleBuyCoins = async () => {
    if (!selectedPackage) return
    if (!checkoutCardNumber || !checkoutExpiry || !checkoutCVV) {
      setMsg({ type: 'error', text: 'Please fill in all card details' })
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

  return (
    <div className="min-h-screen bg-light md:pl-56 pt-14 md:pt-0 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-dark dark:text-white">Coin Shop</h1>
          <div className="flex items-center gap-2 bg-white dark:bg-dark border border-gray-150 dark:border-slate-800 px-4 py-2 rounded-xl shadow-sm">
            <span className="text-lg">🪙</span>
            <span className="font-extrabold text-dark dark:text-white">{user?.coins ?? 0}</span>
          </div>
        </div>

        {msg && (
          <div className={`p-3 rounded-xl mb-4 text-sm font-medium ${msg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {msg.text}
            <button onClick={() => setMsg(null)} className="float-right font-bold">&times;</button>
          </div>
        )}

        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-slate-800">
          {['badges', 'buy_coins', 'send', 'cash', 'redeem'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 font-medium text-sm border-b-2 transition ${tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
              {t === 'badges' ? '🏆 Badges' : t === 'buy_coins' ? '💵 Buy Coins' : t === 'send' ? '📤 Send Coins' : t === 'cash' ? '💰 Convert to Cash' : '📱 Redeem'}
            </button>
          ))}
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
                    <div className="text-4xl mb-2">{item.icon}</div>
                    <h3 className="text-lg font-bold" style={{ color: c.text }}>{item.name}</h3>
                    <div className="mt-2">
                      <span className="text-2xl font-extrabold text-gray-900 dark:text-white bg-white/40 dark:bg-black/35 px-2.5 py-0.5 rounded-lg border border-black/5 dark:border-white/5">{item.price.toLocaleString()}</span>
                      <span className="text-gray-600 dark:text-gray-300 font-semibold text-sm"> coins</span>
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
                      onClick={() => handleBuy(item)}
                      disabled={buying === item.id || owned}
                      className={`w-full py-2.5 rounded-lg font-medium text-sm transition ${owned ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 cursor-not-allowed' : buying === item.id ? 'bg-gray-200 dark:bg-slate-700 text-gray-500' : 'text-white hover:opacity-90'}`}
                      style={!owned && buying !== item.id ? { backgroundColor: c.border } : {}}
                    >
                      {owned ? '✓ Active' : buying === item.id ? 'Buying...' : `Buy for ${item.price.toLocaleString()} coins`}
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
                Top up your coins to purchase badges or gift them to other students. Especially useful for Alumni to support others!
              </p>
              
              <div className="mb-4">
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
                { id: 'coins_5000', amount: 5000, priceNGN: 1000, desc: 'Starter pack for basic support' },
                { id: 'coins_10000', amount: 10000, priceNGN: 1800, desc: 'Recommended pack for Premium badge upgrade' },
                { id: 'coins_25000', amount: 25000, priceNGN: 4000, desc: 'Value pack to unlock more benefits' },
                { id: 'coins_50000', amount: 50000, priceNGN: 7500, desc: 'Ultimate pack for power users and top gifting' },
              ].map(pkg => (
                <div key={pkg.id} className="bg-white dark:bg-dark border border-gray-150 dark:border-slate-850 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl">🪙</span>
                      <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
                        +{pkg.amount.toLocaleString()} Coins
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-dark dark:text-white">{pkg.amount.toLocaleString()} Coins</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-505 mt-1">{pkg.desc}</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between gap-4">
                    <span className="text-xl font-black text-dark dark:text-white">₦{pkg.priceNGN.toLocaleString()}</span>
                    <button
                      onClick={() => setSelectedPackage(pkg)}
                      className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:opacity-90 transition"
                    >
                      Buy Package
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
          <div className="max-w-lg mx-auto bg-white dark:bg-dark border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm p-6 text-center">
            <div className="text-5xl mb-4">💰</div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Convert Coins to Cash</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Withdraw your coins as real money to your bank account or mobile money.</p>
            <span className="inline-block bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-xs px-3 py-1.5 rounded-full font-medium">Coming Soon</span>
            <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl text-left">
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-2">Planned features:</p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">• <span>Withdraw to bank accounts (NGN)</span></li>
                <li className="flex items-start gap-2">• <span>Mobile money transfer (MTN MoMo, Paga, Opay)</span></li>
                <li className="flex items-start gap-2">• <span>Minimum withdrawal: 1,000 coins</span></li>
                <li className="flex items-start gap-2">• <span>Processing time: 24-48 hours</span></li>
              </ul>
            </div>
          </div>
        )}

        {tab === 'redeem' && (
          <div className="max-w-lg mx-auto bg-white dark:bg-dark border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm p-6">
            <div className="flex gap-2 mb-4">
              {['airtime', 'data'].map(t => (
                <button key={t} onClick={() => { setRedeemTab(t); setMsg(null) }} className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${redeemTab === t ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300'}`}>
                  {t === 'airtime' ? '📞 Airtime' : '📶 Data'}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Network</label>
                <select value={network} onChange={e => setNetwork(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-dark/50 focus:outline-none focus:border-primary">
                  <option value="mtn">MTN</option>
                  <option value="glo">Glo</option>
                  <option value="airtel">Airtel</option>
                  <option value="9mobile">9mobile</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-dark/50 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none" />
              </div>
              {redeemTab === 'airtime' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                  <select value={airtimeItemId} onChange={e => setAirtimeItemId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-dark/50 focus:outline-none focus:border-primary">
                    {items?.airtime?.map(a => <option key={a.id} value={a.id}>{a.name} — {a.price} coins</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Plan</label>
                  <select value={dataPlanId} onChange={e => setDataPlanId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-dark/50 focus:outline-none focus:border-primary">
                    <option value="">Select a plan</option>
                    {items?.data?.map(d => <option key={d.id} value={d.id}>{d.name} — {d.price} coins ({d.validity})</option>)}
                  </select>
                </div>
              )}
              <button onClick={handleRedeem} disabled={redeeming} className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50 transition">
                {redeeming ? 'Processing...' : `Redeem for ${redeemTab === 'airtime'
                  ? (items?.airtime?.find(a => a.id === airtimeItemId)?.price || '?')
                  : (items?.data?.find(d => d.id === dataPlanId)?.price || '?')} coins`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark border border-gray-150 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 animate-scaleUp text-dark dark:text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-extrabold text-lg text-dark dark:text-white">Secure Payment Checkout</h3>
                <p className="text-xs text-gray-400 mt-0.5">Simulated Sandbox Checkout</p>
              </div>
              <button
                onClick={() => setSelectedPackage(null)}
                className="text-gray-400 hover:text-dark dark:hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800/40 p-4 rounded-xl mb-4 text-sm text-dark dark:text-white border border-gray-100 dark:border-slate-850">
              <div className="flex justify-between font-medium">
                <span>Product:</span>
                <span>{selectedPackage.amount.toLocaleString()} Scholar Coins</span>
              </div>
              <div className="flex justify-between font-medium mt-1">
                <span>Recipient:</span>
                <span>{checkoutRecipient.trim() ? `@${checkoutRecipient.trim()}` : 'Self (You)'}</span>
              </div>
              <div className="h-px bg-gray-250 dark:bg-slate-700 my-2" />
              <div className="flex justify-between font-black text-primary text-base">
                <span>Total Cost:</span>
                <span>₦{selectedPackage.priceNGN.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  maxLength="19"
                  value={checkoutCardNumber}
                  onChange={e => setCheckoutCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                  placeholder="4000 1234 5678 9010"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-dark/50 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    maxLength="5"
                    value={checkoutExpiry}
                    onChange={e => setCheckoutExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-dark/50 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    maxLength="3"
                    value={checkoutCVV}
                    onChange={e => setCheckoutCVV(e.target.value)}
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-dark/50 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleBuyCoins}
                disabled={processingPayment || !checkoutCardNumber || !checkoutExpiry || !checkoutCVV}
                className="w-full mt-4 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:opacity-90 disabled:opacity-50 transition"
              >
                {processingPayment ? 'Processing Secure Payment...' : `Pay ₦${selectedPackage.priceNGN.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
