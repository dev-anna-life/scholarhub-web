import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const API = 'https://en.wikipedia.org/w/api.php'

async function fetchWithRetry(url, params, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const p = new URLSearchParams(params)
      const res = await fetch(`${url}?${p}`, {
        headers: { 'User-Agent': 'ScholarHub/1.0 (scholarhub-web.vercel.app; annajoan@gmail.com)' }
      })
      if (res.ok) return res.json()
      if (res.status === 429) {
        const wait = 5000 * (i + 1)
        await new Promise(r => setTimeout(r, wait))
        continue
      }
      return null
    } catch { await new Promise(r => setTimeout(r, 2000)) }
  }
  return null
}

async function getWikipediaImage(name) {
  const data = await fetchWithRetry(API, {
    action: 'query', prop: 'pageimages', titles: name,
    format: 'json', piprop: 'original', pithumbsize: 500
  })
  if (!data?.query?.pages) return null
  const pages = Object.values(data.query.pages)
  const page = pages.find(p => p.original?.source)
  return page?.original?.source || null
}

// Collect all unique school names
const allSchools = new Set()

// 1. African universities (from backend data file)
const uniPath = path.join(__dirname, '..', '..', 'scholarhub-api', 'lib', 'africanUniversities.js')
const uniContent = fs.readFileSync(uniPath, 'utf-8')
const uniNames = uniContent.match(/'([^']+)'/g)?.map(s => s.replace(/'/g, '')) || []
uniNames.forEach(n => allSchools.add(n))

// 2. Nigerian universities
const ngUniPath = path.join(__dirname, '..', '..', 'scholarhub-api', 'lib', 'nigerianUniversities.js')
const ngContent = fs.readFileSync(ngUniPath, 'utf-8')
const ngNames = ngContent.match(/'([^']+)'/g)?.map(s => s.replace(/'/g, '')) || []
ngNames.forEach(n => allSchools.add(n))

// 3. African secondary schools
const secPath = path.join(__dirname, '..', '..', 'scholarhub-api', 'lib', 'africanSecondarySchools.js')
const secContent = fs.readFileSync(secPath, 'utf-8')
const secMatches = [...secContent.matchAll(/name:\s*'([^']+)'/g)]
secMatches.forEach(m => allSchools.add(m[1]))

// 4. Existing logos (keep them)
const existingPath = path.join(__dirname, '..', 'src', 'data', 'universityLogos.json')
const existing = JSON.parse(fs.readFileSync(existingPath, 'utf-8'))
const logos = { ...existing }

const namesToCheck = [...allSchools].filter(n => !existing[n])
console.log(`Existing logos: ${Object.keys(existing).length}`)
console.log(`New names to check: ${namesToCheck.length}`)
console.log(`Total school names: ${allSchools.size}`)

// Batch process
const BATCH = 30
const DELAY = 2500
let found = 0

for (let i = 0; i < namesToCheck.length; i += BATCH) {
  const batch = namesToCheck.slice(i, i + BATCH)
  const results = await Promise.allSettled(batch.map(name => getWikipediaImage(name).then(url => ({ name, url }))))
  
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.url) {
      logos[r.value.name] = r.value.url
      found++
    }
  }
  
  if ((i / BATCH) % 10 === 0) {
    console.log(`Progress: ${i + batch.length}/${namesToCheck.length} | Found: ${found} | Total: ${Object.keys(logos).length}`)
  }
  
  await new Promise(r => setTimeout(r, DELAY))
}

// Save
fs.writeFileSync(existingPath, JSON.stringify(logos, null, 2))
console.log(`\nDone! Total logos: ${Object.keys(logos).length} (${found} new)`)
