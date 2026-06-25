'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getMe, getShopItems, buyShopItem, sendCoins, redeemAirtime, redeemData } from '../../src/api/auth'

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

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>

  const activeSubs = user?.badgeSubscriptions?.filter(s => new Date(s.expiresAt) > new Date()) || []
  const isExtraPremium = activeSubs.some(s => s.id === 'badge_extra_premium')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Coin Shop</h1>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
            <span className="text-lg">🪙</span>
            <span className="font-bold text-gray-900">{user?.coins ?? 0}</span>
          </div>
        </div>

        {msg && (
          <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {msg.text}
            <button onClick={() => setMsg(null)} className="float-right font-bold">&times;</button>
          </div>
        )}

        <div className="flex gap-2 mb-6 border-b">
          {['badges', 'send', 'redeem'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 font-medium text-sm border-b-2 transition ${tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t === 'badges' ? '🏆 Badges' : t === 'send' ? '📤 Send Coins' : '📱 Redeem'}
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
                <div key={item.id} className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: c.border }}>
                  <div className="p-6 text-center" style={{ backgroundColor: c.bg }}>
                    <div className="text-4xl mb-2">{item.icon}</div>
                    <h3 className="text-lg font-bold" style={{ color: c.text }}>{item.name}</h3>
                    <div className="mt-2">
                      <span className="text-2xl font-bold text-gray-900">{item.price.toLocaleString()}</span>
                      <span className="text-gray-500 text-sm"> coins</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                    {owned && sub && (
                      <p className="text-xs text-green-600 font-medium mt-1">
                        Active until {new Date(sub.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    {item.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={buying === item.id || owned}
                      className={`w-full py-2.5 rounded-lg font-medium text-sm transition ${owned ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : buying === item.id ? 'bg-gray-200 text-gray-500' : 'text-white hover:opacity-90'}`}
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

        {tab === 'send' && (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Send Coins</h2>
            <p className="text-sm text-gray-500 mb-4">Transfer coins to another user by their username.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Username</label>
                <input type="text" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="Enter username" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input type="number" value={sendAmount} onChange={e => setSendAmount(e.target.value)} placeholder="Enter amount" min="1" max={user?.coins || 0} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div className="text-xs text-gray-400">Your balance: {user?.coins ?? 0} coins</div>
              <button onClick={handleSendCoins} disabled={sending || !recipient.trim() || !sendAmount} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:opacity-50">
                {sending ? 'Sending...' : 'Send Coins'}
              </button>
            </div>
          </div>
        )}

        {tab === 'redeem' && (
          <div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm p-6">
            <div className="flex gap-2 mb-4">
              {['airtime', 'data'].map(t => (
                <button key={t} onClick={() => { setRedeemTab(t); setMsg(null) }} className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${redeemTab === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {t === 'airtime' ? '📞 Airtime' : '📶 Data'}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Network</label>
                <select value={network} onChange={e => setNetwork(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="mtn">MTN</option>
                  <option value="glo">Glo</option>
                  <option value="airtel">Airtel</option>
                  <option value="9mobile">9mobile</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              {redeemTab === 'airtime' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <select value={airtimeItemId} onChange={e => setAirtimeItemId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    {items?.airtime?.map(a => <option key={a.id} value={a.id}>{a.name} — {a.price} coins</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Plan</label>
                  <select value={dataPlanId} onChange={e => setDataPlanId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Select a plan</option>
                    {items?.data?.map(d => <option key={d.id} value={d.id}>{d.name} — {d.price} coins ({d.validity})</option>)}
                  </select>
                </div>
              )}
              <button onClick={handleRedeem} disabled={redeeming} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:opacity-50">
                {redeeming ? 'Processing...' : `Redeem for ${redeemTab === 'airtime'
                  ? (items?.airtime?.find(a => a.id === airtimeItemId)?.price || '?')
                  : (items?.data?.find(d => d.id === dataPlanId)?.price || '?')} coins`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

