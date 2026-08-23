export const TOP_CITATIONS = [
  { label: 'NASA', tag: 'NASA', desc: 'National Aeronautics and Space Administration' },
  { label: 'Wikipedia', tag: 'Wikipedia', desc: 'Global Free Encyclopedia' },
  { label: 'Google (Google Scholar)', tag: 'Google (Google Scholar)', desc: 'Academic Search & Global Repository' },
  { label: 'IALS', tag: 'IALS', desc: 'Institute of Advanced Legal Studies' },
  { label: 'UNESCO', tag: 'UNESCO', desc: 'UN Educational, Scientific & Cultural Org' },
  { label: 'BBC', tag: 'BBC', desc: 'British Broadcasting Corporation Academic News' },
]

export const SECONDARY_CITATIONS = [
  { label: 'IEEE Xplore', tag: 'IEEE', desc: 'Institute of Electrical and Electronics Engineers' },
  { label: 'PubMed', tag: 'PubMed', desc: 'National Library of Medicine' },
  { label: 'CERN', tag: 'CERN', desc: 'European Council for Nuclear Research' },
  { label: 'JSTOR', tag: 'JSTOR', desc: 'Digital Library of Journals & Books' },
  { label: 'WHO', tag: 'WHO', desc: 'World Health Organization' },
  { label: 'MIT OpenCourseWare', tag: 'MIT OCW', desc: 'Massachusetts Institute of Technology' },
  { label: 'NUC Curriculum (CCMAS)', tag: 'NUC CCMAS', desc: 'Nigerian Universities Commission' },
  { label: 'SURCON Curriculum', tag: 'SURCON', desc: 'Surveyors Council of Nigeria' },
  { label: 'COREN Engineering Benchmark', tag: 'COREN', desc: 'Council for the Regulation of Engineering in Nigeria' },
  { label: 'MDCN Medical Benchmark', tag: 'MDCN', desc: 'Medical and Dental Council of Nigeria' },
  { label: 'ICAN Accounting Framework', tag: 'ICAN', desc: 'Institute of Chartered Accountants of Nigeria' },
  { label: 'Cambridge International Curriculum', tag: 'Cambridge', desc: 'IGCSE & A-Level Syllabus' },
  { label: 'Stanford Encyclopedia of Philosophy', tag: 'Stanford SEP', desc: 'Peer-Reviewed Philosophy Repository' },
]

export const FALLBACK_CITATIONS = [
  { label: 'Verified Textbook', tag: 'Verified Textbook', desc: 'Academic Peer-Reviewed Textbook' },
  { label: 'University Curriculum', tag: 'University Curriculum', desc: 'Official Faculty & Departmental Syllabus' },
  { label: 'National High School Curriculum (JAMB / WAEC)', tag: 'JAMB / WAEC', desc: 'Secondary Examination Syllabus' },
]

export const CITATION_ALIASES = {
  'nasa': 'NASA',
  'wikipedia': 'Wikipedia',
  'wiki': 'Wikipedia',
  'google': 'Google (Google Scholar)',
  'google scholar': 'Google (Google Scholar)',
  'scholar': 'Google (Google Scholar)',
  'ials': 'IALS',
  'unesco': 'UNESCO',
  'bbc': 'BBC',
  'bbc news': 'BBC',
  'ieee': 'IEEE',
  'pubmed': 'PubMed',
  'cern': 'CERN',
  'jstor': 'JSTOR',
  'who': 'WHO',
  'mit': 'MIT OCW',
  'mit ocw': 'MIT OCW',
  'nuc': 'NUC CCMAS',
  'nuc ccmas': 'NUC CCMAS',
  'surcon': 'SURCON',
  'coren': 'COREN',
  'mdcn': 'MDCN',
  'ican': 'ICAN',
  'cambridge': 'Cambridge',
  'textbook': 'Verified Textbook',
  'verified textbook': 'Verified Textbook',
  'curriculum': 'University Curriculum',
  'university curriculum': 'University Curriculum',
  'jamb': 'JAMB / WAEC',
  'waec': 'JAMB / WAEC',
}

export function formatCitationSource(input) {
  if (!input || typeof input !== 'string') return ''
  const trimmed = input.trim()
  const lower = trimmed.toLowerCase()
  if (CITATION_ALIASES[lower]) {
    return CITATION_ALIASES[lower]
  }
  return trimmed
}
