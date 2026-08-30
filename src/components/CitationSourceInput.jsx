'use client'
import { useState, useRef, useEffect } from 'react'
import { FiBookOpen, FiSearch, FiCheck, FiGlobe, FiBookmark } from 'react-icons/fi'
import { TOP_CITATIONS, SECONDARY_CITATIONS, FALLBACK_CITATIONS, formatCitationSource } from '../data/citationSources'

export default function CitationSourceInput({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState(value || '')
  const dropdownRef = useRef(null)

  useEffect(() => {
    setQuery(value || '')
  }, [value])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
        if (query) {
          const formatted = formatCitationSource(query)
          setQuery(formatted)
          onChange(formatted)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [query, onChange])

  const handleSelect = (itemTag) => {
    const formatted = formatCitationSource(itemTag)
    setQuery(formatted)
    onChange(formatted)
    setIsOpen(false)
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    setQuery(val)
    onChange(val)
  }

  const handleBlur = () => {
    if (query) {
      const formatted = formatCitationSource(query)
      setQuery(formatted)
      onChange(formatted)
    }
  }

  const filterItem = (item) => {
    if (!query) return true
    const q = query.toLowerCase()
    return item.label.toLowerCase().includes(q) || item.tag.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
  }

  const filteredTop = TOP_CITATIONS.filter(filterItem)
  const filteredSecondary = SECONDARY_CITATIONS.filter(filterItem)
  const filteredFallback = FALLBACK_CITATIONS.filter(filterItem)

  return (
    <div ref={dropdownRef} className="relative w-full">
      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <FiBookOpen size={14} className="text-primary" /> Citation / Source of Information
        </span>
        <span className="text-[10px] text-gray-400 font-normal">(Optional academic verification)</span>
      </label>

      <div className="relative">
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="e.g. NASA, Wikipedia, Google, UNESCO, Verified Textbook..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition shadow-xs"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition"
        >
          <FiSearch size={16} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-[#1e1e22] border border-gray-100 dark:border-zinc-700 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-72 flex flex-col divide-y divide-gray-100 dark:divide-zinc-800">
          
          {/* Section 1: Top 6 Global Selection Grid */}
          <div className="p-3 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
            <p className="text-[10px] font-extrabold text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
              <FiGlobe size={11} /> Global Boards & Research Hubs
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {TOP_CITATIONS.map(item => {
                const isSelected = query === item.tag
                return (
                  <button
                    key={item.tag}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(item.tag) }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition text-left ${
                      isSelected
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-gray-50 dark:bg-zinc-800 text-dark dark:text-white hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    {isSelected && <FiCheck size={12} className="flex-shrink-0 ml-1" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 2: All Academic Repositories & Curriculum Options */}
          <div className="p-2 overflow-y-auto max-h-48 scrollbar-thin divide-y divide-gray-50 dark:divide-zinc-800/50">
            {[...SECONDARY_CITATIONS, ...FALLBACK_CITATIONS].filter(filterItem).map(item => (
              <button
                key={item.tag}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(item.tag) }}
                className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800/80 text-left transition"
              >
                <div>
                  <span className="font-bold text-dark dark:text-white text-xs block">{item.label}</span>
                  <span className="text-[10px] text-gray-400 block truncate">{item.desc}</span>
                </div>
                {query === item.tag && <FiCheck size={13} className="text-primary flex-shrink-0 ml-2" />}
              </button>
            ))}
          </div>

        </div>
      )}
    </div>
  )
}
