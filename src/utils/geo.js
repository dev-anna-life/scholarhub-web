// IP-based Geolocation helper with caching
export async function getClientGeo() {
  if (typeof window === 'undefined') {
    return {
      countryCode: 'NG',
      countryName: 'Nigeria',
      currency: 'NGN',
      currencySymbol: '₦',
      dialCode: '+234',
      isNigeria: true,
      isAfrica: true,
    }
  }

  try {
    const cached = sessionStorage.getItem('sh_geo_data')
    if (cached) {
      return JSON.parse(cached)
    }

    // Fast IP lookup from reliable public GeoIP endpoint
    const res = await fetch('https://ipapi.co/json/', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      const code = (data.country_code || 'NG').toUpperCase()
      const isNG = code === 'NG'
      const africanCodes = ['NG', 'GH', 'KE', 'ZA', 'RW', 'UG', 'TZ', 'EG', 'CM', 'SN', 'CI']
      const isAF = africanCodes.includes(code) || (data.continent_code === 'AF')

      const geoInfo = {
        countryCode: code,
        countryName: data.country_name || (isNG ? 'Nigeria' : 'United States'),
        currency: isNG ? 'NGN' : 'USD',
        currencySymbol: isNG ? '₦' : '$',
        dialCode: data.country_calling_code ? (data.country_calling_code.startsWith('+') ? data.country_calling_code : `+${data.country_calling_code}`) : (isNG ? '+234' : '+1'),
        isNigeria: isNG,
        isAfrica: isAF,
      }
      sessionStorage.setItem('sh_geo_data', JSON.stringify(geoInfo))
      return geoInfo
    }
  } catch (_) {}

  // Fallback defaults to Nigeria
  const fallback = {
    countryCode: 'NG',
    countryName: 'Nigeria',
    currency: 'NGN',
    currencySymbol: '₦',
    dialCode: '+234',
    isNigeria: true,
    isAfrica: true,
  }
  return fallback
}
