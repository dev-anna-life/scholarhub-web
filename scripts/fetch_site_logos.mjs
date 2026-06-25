import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Existing logos (skip these)
const existingPath = path.join(__dirname, '..', 'src', 'data', 'universityLogos.json')
const existing = JSON.parse(fs.readFileSync(existingPath, 'utf-8'))
const existingSlugs = new Set()

// Collect all school names from backend data
const schools = new Set()

function extractNames(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const matches = content.match(/'([^']+)'/g)
  if (matches) matches.forEach(m => schools.add(m.replace(/'/g, '')))
  const namedMatches = content.matchAll(/name:\s*'([^']+)'/g)
  for (const m of namedMatches) schools.add(m[1])
}

extractNames(path.join(__dirname, '..', '..', 'scholarhub-api', 'lib', 'africanUniversities.js'))
extractNames(path.join(__dirname, '..', '..', 'scholarhub-api', 'lib', 'nigerianUniversities.js'))

// Also add from existing schoolsByCountry for completeness
// Generate slug and check if we already have an image
function makeSlug(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Filter to schools without Wikipedia logos
const schoolsToCheck = [...schools].filter(n => !existing[n])
console.log(`Schools without Wikipedia logos: ${schoolsToCheck.length}`)

// Domain candidates per country TLD
const TLDs = {
  'Nigeria': ['.edu.ng', '.university.edu.ng', '.ng'],
  'Kenya': ['.ac.ke', '.ke'],
  'Ghana': ['.edu.gh', '.gh'],
  'South Africa': ['.ac.za', '.za'],
  'Uganda': ['.ac.ug', '.ug'],
  'Tanzania': ['.ac.tz', '.tz'],
  'Ethiopia': ['.edu.et', '.et'],
  'Rwanda': ['.ac.rw', '.rw'],
  'Zambia': ['.ac.zm', '.zm'],
  'Zimbabwe': ['.ac.zw', '.zw'],
  'Egypt': ['.edu.eg', '.eg'],
  'Morocco': ['.ac.ma', '.ma'],
  'Tunisia': ['.ac.tn', '.tn'],
  'Algeria': ['.dz'],
  'Sudan': ['.sd'],
  'default': ['.ac.za', '.ac.ke', '.edu.ng', '.ac.ug', '.ac.tz', '.edu.et', '.org', '.edu', '.university']
}

function getDomains(name) {
  const slug = makeSlug(name)
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^university-of-/, 'uni-')
    .replace(/^university-/, 'uni-')
  const short = slug.replace(/-(university|college|institute|of|technology|polytechnic)/g, '')
    .replace(/-+/g, '-').replace(/^-|-$/g, '')
  
  // Common domain patterns
  const patterns = [
    `www.${slug}.edu.ng`,
    `www.${slug}.ac.ke`,
    `www.${slug}.ac.ug`,
    `www.${slug}.ac.tz`,
    `www.${slug}.ac.za`,
    `www.${slug}.edu.et`,
    `www.${slug}.edu.gh`,
    `www.${slug}.ac.rw`,
    `www.${slug}.ac.zm`,
    `www.${slug}.edu.eg`,
    `www.${slug}.org`,
    `www.${slug}.edu`,
    `www.${slug}.net`,
    `www.${slug}.com`,
    `www.${short}.edu.ng`,
    `www.${short}.ac.ke`,
    `www.${short}.org`,
    `www.${short}.edu`,
    `www.${short}.com`,
    slug.includes('uni-') ? `www.${slug.replace('uni-', '')}.edu.ng` : null,
    slug.includes('uni-') ? `www.${slug.replace('uni-', '')}.ac.ke` : null,
  ].filter(Boolean)
  
  return [...new Set(patterns)]
}

// Extract logo from HTML
function extractLogoUrl(html, baseUrl) {
  const patterns = [
    // <img with "logo" in class
    ...html.matchAll(/<img[^>]*class=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/gi),
    // <img with "logo" in alt
    ...html.matchAll(/<img[^>]*alt=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/gi),
    // <img with "logo" in id
    ...html.matchAll(/<img[^>]*id=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/gi),
    // Just first header img
    ...html.matchAll(/<header[^>]*>[\s\S]*?<img[^>]*src=["']([^"']+)["']/gi),
    // First img in the page (fallback)
    ...html.matchAll(/<img[^>]*src=["']([^"']+\.(png|jpg|jpeg|svg|webp))["']/gi),
  ]
  
  for (const match of patterns) {
    if (match?.[1]) {
      let url = match[1]
      if (url.startsWith('//')) url = 'https:' + url
      else if (url.startsWith('/')) url = new URL(url, baseUrl).href
      else if (!url.startsWith('http')) url = new URL(url, baseUrl).href
      if (url.includes('logo') || url.includes('Logo')) return url
    }
  }
  
  // Also check nav/header for img elements
  const navImg = html.match(/<nav[^>]*>[\s\S]*?<img[^>]*src=["']([^"']+)["']/i)
  if (navImg?.[1]) return navImg[1]
  
  // Check for link rel="icon" (favicon can serve as logo)
  const icon = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i)
  if (icon?.[1]) return icon[1]
  
  return null
}

async function fetchWithTimeout(url, timeout = 8000) {
  try {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ScholarHub/1.0)' } })
    clearTimeout(id)
    if (res.ok) return { url: res.url, html: await res.text() }
  } catch {}
  return null
}

// Save directory for school logos
const imagesDir = path.join(__dirname, '..', 'public', 'images', 'schools')
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true })

let found = 0
let skipped = 0

for (let i = 0; i < schoolsToCheck.length; i++) {
  const name = schoolsToCheck[i]
  const slug = makeSlug(name)
  const outputPath = path.join(imagesDir, `${slug}.png`)
  
  // Skip if we already have this image
  if (fs.existsSync(outputPath)) { skipped++; continue }
  
  const domains = getDomains(name)
  let logoUrl = null
  let foundDomain = null
  
  // Try domains in parallel (up to 3 at a time)
  for (let d = 0; d < domains.length; d += 3) {
    const batch = domains.slice(d, d + 3).map(dom => `https://${dom}`)
    const results = await Promise.allSettled(batch.map(u => fetchWithTimeout(u)))
    
    for (let r = 0; r < results.length; r++) {
      const res = results[r]
      if (res.status === 'fulfilled' && res.value) {
        const { url: finalUrl, html } = res.value
        logoUrl = extractLogoUrl(html, finalUrl)
        if (logoUrl) {
          foundDomain = batch[r]
          break
        }
      }
    }
    if (logoUrl) break
  }
  
  if (logoUrl) {
    try {
      // Normalize URL
      if (logoUrl.startsWith('//')) logoUrl = 'https:' + logoUrl
      else if (logoUrl.startsWith('/')) logoUrl = new URL(logoUrl, foundDomain).href
      else if (!logoUrl.startsWith('http')) logoUrl = new URL(logoUrl, foundDomain).href
      
      const imgRes = await fetch(logoUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      if (imgRes.ok) {
        const buffer = Buffer.from(await imgRes.arrayBuffer())
        fs.writeFileSync(outputPath, buffer)
        found++
        if (found % 10 === 0) console.log(`[${i+1}/${schoolsToCheck.length}] Saved: ${slug}.png (${found} total)`)
      }
    } catch {}
  }
  
  if ((i + 1) % 50 === 0) console.log(`Progress: ${i+1}/${schoolsToCheck.length} | Found: ${found} | Skipped: ${skipped}`)
}

console.log(`\nDone! Found ${found} new logos (${skipped} already existed)`)
