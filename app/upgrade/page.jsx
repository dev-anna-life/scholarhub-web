'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getMe, getShopItems, verifyPaystackPayment, verifyFlutterwavePayment } from '../../src/api/auth'
import { FiCheck, FiShield, FiZap, FiAward, FiStar, FiGlobe, FiVideo, FiFileText, FiCpu, FiTrendingUp } from 'react-icons/fi'
import { GiCrown } from 'react-icons/gi'
import { BsCheckCircleFill } from 'react-icons/bs'
import { getClientGeo } from '../../src/utils/geo'

const TIERS = [
  {
    id: 'badge_basic',
    name: 'Basic',
    tagline: 'Essential tools for every active student',
    priceNGN: 2000,
    priceUSD: 2.0,
    icon: FiAward,
    accentColor: '#3B82F6',
    borderClass: 'border-blue-200 dark:border-blue-900/50',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    features: [
      'Write 0 - 80 words per post',
      'Upload up to 30s video clips',
      'Basic Badge on profile and posts',
      '20 AI Study Bot questions daily',
      'Standard community posting',
    ],
  },
  {
    id: 'badge_premium',
    name: 'Premium',
    subtitle: 'Scholar Verified',
    isPopular: true,
    tagline: 'Our most popular tier for high-achieving scholars',
    priceNGN: 4500,
    priceUSD: 4.5,
    icon: FiStar,
    accentColor: '#008751',
    borderClass: 'border-emerald-500 dark:border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    buttonClass: 'bg-[#008751] hover:bg-[#007043] text-white shadow-md shadow-emerald-600/20',
    features: [
      'Scholar Verified Checkmark Badge',
      'Write up to 1,000 words per post',
      'Upload up to 3-minute video lessons',
      '50 AI Study Bot questions daily',
      'Higher visibility in campus feeds',
      'Priority academic study groups',
    ],
  },
  {
    id: 'badge_extra_premium',
    name: 'Extra Premium',
    subtitle: 'Academic VIP',
    tagline: 'Maximum power, unlimited content & VIP distinction',
    priceNGN: 10000,
    priceUSD: 10.0,
    icon: GiCrown,
    accentColor: '#8B5CF6',
    borderClass: 'border-purple-200 dark:border-purple-900/50',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
    buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white',
    features: [
      'Purple VIP Crown Badge across platform',
      'Unlimited words per post & article',
      'Upload up to 30-minute HD educational videos',
      'Unlimited AI Study Bot assistance',
      'AI Citation & Scholar Score priority boost',
      '1,000 free bonus coins every month',
    ],
  },
]

export default function UpgradePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [geo, setGeo] = useState(null)
  const [billingCycle, setBillingCycle] = useState('monthly') // 'monthly' | 'annual'
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    getClientGeo().then(setGeo)

    getMe()
      .then(res => setUser(res.data))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false))

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
  }, [router])

  const activeSubs = user?.badgeSubscriptions || []
  const now = new Date()
  const activePlan = activeSubs.find(s => new Date(s.expiresAt) > now)

  const handlePaystackCheckout = (plan) => {
    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_7b0863fcf6dd94b90a504fa302a7478700a8574f'
    if (typeof window === 'undefined' || !window.PaystackPop) {
      alert('Paystack is loading. Please try again in a moment.')
      return
    }

    const price = billingCycle === 'annual' ? plan.priceNGN * 10 : plan.priceNGN
    const email = (user?.email && user.email.includes('@')) ? user.email.trim() : 'student@scholarhub.com'
    setProcessingPayment(true)
    setMsg(null)

    const onPaymentSuccess = function (response) {
      const ref = response.reference || response.trxref
      verifyPaystackPayment(ref, plan.id, null)
        .then(function (res) {
          return getMe().then(function (u) {
            setUser(u.data)
            localStorage.setItem('user', JSON.stringify(u.data))
            setMsg({ type: 'success', text: res.data?.message || 'Subscription activated successfully!' })
            setSelectedPlan(null)
          })
        })
        .catch(function (err) {
          setMsg({ type: 'error', text: err.response?.data?.message || 'Payment verification failed' })
        })
        .finally(function () {
          setProcessingPayment(false)
        })
    }

    const onPaymentClose = function () {
      setProcessingPayment(false)
    }

    try {
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: email,
        amount: Math.round(price * 100),
        currency: 'NGN',
        ref: 'SH_SUB_' + Date.now(),
        metadata: {
          custom_fields: [
            { display_name: 'Plan', variable_name: 'plan_id', value: plan.id },
            { display_name: 'User ID', variable_name: 'user_id', value: user?.id || '' },
          ],
        },
        callback: onPaymentSuccess,
        onClose: onPaymentClose,
      })
      handler.openIframe()
    } catch (e) {
      setProcessingPayment(false)
      setMsg({ type: 'error', text: e.message || 'Failed to initialize Paystack checkout' })
    }
  }

  const handleFlutterwaveCheckout = (plan) => {
    const flwKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-df609edd1c0bb056e60e728ab67dce5f-X'
    if (typeof window === 'undefined' || !window.FlutterwaveCheckout) {
      alert('Flutterwave is loading. Please try again in a moment.')
      return
    }

    const price = billingCycle === 'annual' ? plan.priceUSD * 10 : plan.priceUSD
    const email = (user?.email && user.email.includes('@')) ? user.email.trim() : 'student@scholarhub.com'
    setProcessingPayment(true)
    setMsg(null)

    const onFlwSuccess = function (data) {
      const txId = data?.transaction_id || data?.tx_ref
      verifyFlutterwavePayment(txId, plan.id, null)
        .then(function (res) {
          return getMe().then(function (u) {
            setUser(u.data)
            localStorage.setItem('user', JSON.stringify(u.data))
            setMsg({ type: 'success', text: res.data?.message || 'Subscription activated successfully!' })
            setSelectedPlan(null)
          })
        })
        .catch(function (err) {
          setMsg({ type: 'error', text: err.response?.data?.message || 'Payment verification failed' })
        })
        .finally(function () {
          setProcessingPayment(false)
        })
    }

    const onFlwClose = function () {
      setProcessingPayment(false)
    }

    try {
      window.FlutterwaveCheckout({
        public_key: flwKey,
        tx_ref: 'SH_FLW_' + Date.now(),
        amount: price,
        currency: 'USD',
        payment_options: 'card, banktransfer, ussd, mobilemoney',
        customer: {
          email: email,
          name: user?.name || 'ScholarHub Student',
          phone_number: user?.phone || '',
        },
        customizations: {
          title: 'ScholarHub Subscription',
          description: 'Payment for ' + plan.name + ' Plan',
        },
        callback: onFlwSuccess,
        onclose: onFlwClose,
      })
    } catch (e) {
      setProcessingPayment(false)
      setMsg({ type: 'error', text: e.message || 'Failed to initialize Flutterwave checkout' })
    }
  }

  const isLocalUser = geo ? geo.isNigeria : true

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#101012] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs mb-3">
            <FiZap size={14} /> ScholarHub Membership
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-dark dark:text-white tracking-tight">
            Elevate Your Academic Presence
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Unlock scholar verification, extended video lesson uploads, higher publishing limits, and advanced AI assistance.
          </p>

          {/* Active Plan Status */}
          {activePlan && (
            <div className="mt-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-left sm:text-center max-w-lg mx-auto">
              <div className="flex items-center justify-between sm:justify-center gap-3">
                <span className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                  <BsCheckCircleFill className="text-emerald-600 dark:text-emerald-400" />
                  Active Plan: {activePlan.name || activePlan.badgeId?.replace('badge_', '').toUpperCase()}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-0.5 rounded-full font-medium">
                  Renews {new Date(activePlan.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          {/* Monthly / Annual Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                billingCycle === 'monthly'
                  ? 'bg-dark dark:bg-white text-white dark:text-dark shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-dark dark:bg-white text-white dark:text-dark shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
              }`}
            >
              Annual Billing
              <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {msg && (
          <div
            className={`max-w-2xl mx-auto mb-6 p-4 rounded-xl text-sm font-semibold text-center ${
              msg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Pricing Tier Cards */}
        <div className="grid gap-6 md:grid-cols-3 items-stretch">
          {TIERS.map((tier) => {
            const Icon = tier.icon
            const isCurrent = activePlan?.badgeId === tier.id || activePlan?.id === tier.id
            const priceVal = isLocalUser
              ? billingCycle === 'annual' ? tier.priceNGN * 10 : tier.priceNGN
              : billingCycle === 'annual' ? tier.priceUSD * 10 : tier.priceUSD
            const priceFormatted = isLocalUser ? `₦${priceVal.toLocaleString()}` : `$${priceVal}`
            const periodLabel = billingCycle === 'annual' ? '/yr' : '/mo'

            return (
              <div
                key={tier.id}
                className={`bg-white dark:bg-[#18181b] rounded-3xl p-6 sm:p-7 flex flex-col justify-between border transition-all hover:translate-y-[-2px] ${tier.borderClass} relative`}
              >
                {tier.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#008751] text-white text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${tier.badgeBg}`}>
                      <Icon size={22} />
                    </div>
                    {tier.subtitle && (
                      <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                        {tier.subtitle}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-extrabold text-dark dark:text-white">{tier.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 min-h-[32px]">{tier.tagline}</p>

                  <div className="mt-4 pb-5 border-b border-gray-100 dark:border-zinc-800">
                    <span className="text-3xl sm:text-4xl font-black text-dark dark:text-white">{priceFormatted}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold ml-1.5">{periodLabel}</span>
                  </div>

                  <div className="mt-5 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      Included Features:
                    </p>
                    {tier.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        <FiCheck className="text-[#008751] mt-0.5 flex-shrink-0 font-bold" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    onClick={() => setSelectedPlan(tier)}
                    disabled={isCurrent}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition text-center cursor-pointer ${
                      isCurrent
                        ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : tier.buttonClass
                    }`}
                  >
                    {isCurrent ? 'Current Active Plan' : `Upgrade to ${tier.name}`}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Payment Gateway Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#18181b] border border-gray-100 dark:border-zinc-800 rounded-3xl max-w-sm sm:max-w-md w-full p-5 sm:p-6 shadow-2xl relative animate-scaleUp overflow-hidden">
            <button
              onClick={() => setSelectedPlan(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-dark dark:hover:text-white transition cursor-pointer text-sm font-bold"
            >
              ✕
            </button>

            <div className="text-center mb-6 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                Subscription Checkout
              </span>
              <h3 className="text-xl font-extrabold text-dark dark:text-white mt-2">
                Upgrade to {selectedPlan.name}
              </h3>
              <p className="text-2xl font-black text-primary mt-1">
                {isLocalUser
                  ? `₦${(billingCycle === 'annual' ? selectedPlan.priceNGN * 10 : selectedPlan.priceNGN).toLocaleString()}`
                  : `$${billingCycle === 'annual' ? selectedPlan.priceUSD * 10 : selectedPlan.priceUSD} USD`}
                <span className="text-xs text-gray-400 font-normal ml-1.5">
                  {billingCycle === 'annual' ? '/ year' : '/ month'}
                </span>
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Secure Checkout Gateway:
              </p>

              {isLocalUser ? (
                <button
                  onClick={() => handlePaystackCheckout(selectedPlan)}
                  disabled={processingPayment}
                  className="w-full p-3.5 bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700/60 rounded-2xl text-left transition flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-base font-bold flex-shrink-0">
                      ₦
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-dark dark:text-white text-sm">Paystack</span>
                        <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-bold">Nigeria & Africa</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Cards, Bank Transfer, USSD, Verve</p>
                    </div>
                  </div>
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold text-sm flex-shrink-0">
                    ₦{(billingCycle === 'annual' ? selectedPlan.priceNGN * 10 : selectedPlan.priceNGN).toLocaleString()}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => handleFlutterwaveCheckout(selectedPlan)}
                  disabled={processingPayment}
                  className="w-full p-3.5 bg-orange-50 hover:bg-orange-100/80 dark:bg-orange-950/30 dark:hover:bg-orange-950/50 border border-orange-300 dark:border-orange-700/60 rounded-2xl text-left transition flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center text-base font-bold flex-shrink-0">
                      <FiGlobe size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-dark dark:text-white text-sm">Flutterwave</span>
                        <span className="text-[9px] bg-orange-500 text-white px-1.5 py-0.2 rounded-full font-bold">International & USA</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Visa, Mastercard, Apple Pay, Google Pay</p>
                    </div>
                  </div>
                  <span className="text-orange-700 dark:text-orange-300 font-bold text-sm flex-shrink-0">
                    ${billingCycle === 'annual' ? selectedPlan.priceUSD * 10 : selectedPlan.priceUSD} USD
                  </span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-center text-gray-400 dark:text-gray-500 mt-5 flex items-center justify-center gap-1.5">
              <FiShield size={13} className="text-[#008751]" />
              256-Bit Bank Grade Encryption • Instant Auto-Activation
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
