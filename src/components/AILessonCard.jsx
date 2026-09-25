'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiBookOpen, FiCheckCircle, FiAward, FiShare2, FiHeart, FiMessageCircle, FiZap, FiBook, FiCheck, FiX } from 'react-icons/fi'
import UserBadge from './UserBadge'
import ShareModal from './ShareModal'

export default function AILessonCard({ post, onCommentClick }) {
  const [selectedOption, setSelectedOption] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post?.likesCount || 12)
  const [isCorrect, setIsCorrect] = useState(false)

  // Reset quiz & interactive state whenever post changes (prevents answer state leaking across lessons)
  useEffect(() => {
    setSelectedOption(null)
    setIsAnswered(false)
    setIsCorrect(false)
    setLiked(false)
    setShowShareModal(false)
  }, [post?.id, post?._id])

  if (!post) return null

  const author = typeof post.author === 'object' ? post.author : { name: post.author || 'Official AI Study Bot' }
  const cleanTitle = (post.title || '')
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/\s*\([A-Za-z]+\s+\d+\)/g, '')
    .replace(/\s*\(\d{4}-\d{2}-\d{2}\)/g, '')
    .trim()
  const cleanContent = (post.content || '').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()

  // Parse citationSummary JSON if quiz data is stored inside it
  let parsedQuiz = {}
  try {
    if (post.citationSummary && typeof post.citationSummary === 'string' && post.citationSummary.startsWith('{')) {
      parsedQuiz = JSON.parse(post.citationSummary)
    } else if (post.citationSummary && typeof post.citationSummary === 'object') {
      parsedQuiz = post.citationSummary
    }
  } catch (_) {}

  // Smart Topic-Based Quiz Question & Options Resolution
  let defaultQuestion = post.quizQuestion || parsedQuiz.quizQuestion
  let defaultOptions = post.quizOptions || parsedQuiz.quizOptions
  let correctIdx = post.correctOptionIndex !== undefined 
    ? post.correctOptionIndex 
    : (parsedQuiz.correctOptionIndex !== undefined ? parsedQuiz.correctOptionIndex : 0)

  // Replace missing or generic fallback questions with rich, authentic curriculum exam questions
  const isGenericQuestion = !defaultQuestion || 
    !defaultOptions || 
    !Array.isArray(defaultOptions) || 
    defaultOptions.length === 0 ||
    typeof defaultQuestion !== 'string' ||
    defaultQuestion.startsWith('What is the main principle demonstrated') ||
    defaultQuestion.startsWith('What is the cornerstone requirement')

  if (isGenericQuestion) {
    const textCorpus = `${cleanTitle} ${cleanContent} ${post.category || ''} ${author.username || ''}`.toLowerCase()

    // 1. Medicine & Clinical Sciences
    if (textCorpus.includes('renal') || textCorpus.includes('raas') || textCorpus.includes('nephron') || textCorpus.includes('kidney')) {
      defaultQuestion = 'Where is Angiotensin-Converting Enzyme (ACE) primarily located in the human body?'
      defaultOptions = ['Pulmonary vascular endothelium (lungs)', 'Renal collecting ducts', 'Adrenal medulla', 'Pancreatic islets']
      correctIdx = 0
    } else if (textCorpus.includes('coronary') || textCorpus.includes('myocardial') || textCorpus.includes('heart') || textCorpus.includes('cardio')) {
      defaultQuestion = 'What is the primary cause of acute myocardial infarction?'
      defaultOptions = ['Coronary artery occlusion', 'Low blood pressure', 'Vitamin deficiency', 'Skeletal muscle fatigue']
      correctIdx = 0
    } else if (textCorpus.includes('med') || textCorpus.includes('clinical') || textCorpus.includes('physiology')) {
      defaultQuestion = 'Which blood vessels carry oxygenated blood from the lungs directly into the left atrium?'
      defaultOptions = ['Pulmonary veins', 'Pulmonary arteries', 'Superior vena cava', 'Coronary sinus']
      correctIdx = 0
    }
    // 2. Sciences (Chemistry, Physics, Biology)
    else if (textCorpus.includes('electronegativity') || textCorpus.includes('periodic table') || textCorpus.includes('chemistry')) {
      defaultQuestion = 'Which element has the highest electronegativity value on the Pauling scale?'
      defaultOptions = ['Fluorine', 'Oxygen', 'Chlorine', 'Sodium']
      correctIdx = 0
    } else if (textCorpus.includes('newton') || textCorpus.includes('f = ma') || textCorpus.includes('physics') || textCorpus.includes('acceleration')) {
      defaultQuestion = 'If you push a 5kg box with 15N of net horizontal force, what is its acceleration?'
      defaultOptions = ['3 m/s²', '10 m/s²', '75 m/s²', '0.3 m/s²']
      correctIdx = 0
    } else if (textCorpus.includes('science') || textCorpus.includes('cell') || textCorpus.includes('biology')) {
      defaultQuestion = 'Which cellular organelle is primarily responsible for generating ATP via aerobic respiration?'
      defaultOptions = ['Mitochondria', 'Endoplasmic reticulum', 'Golgi apparatus', 'Lysosome']
      correctIdx = 0
    }
    // 3. Law & Jurisprudence
    else if (textCorpus.includes('audi alteram') || textCorpus.includes('natural justice') || textCorpus.includes('fair hearing')) {
      defaultQuestion = 'What does the Latin legal maxim "Audi Alteram Partem" dictate?'
      defaultOptions = ['Hear the other side before deciding', 'Buyer beware', 'The law is harsh but it is the law', 'State of legal emergency']
      correctIdx = 0
    } else if (textCorpus.includes('consideration') || textCorpus.includes('contract')) {
      defaultQuestion = 'In common law contract doctrine, what is the legal status of "past consideration"?'
      defaultOptions = ['It is generally invalid and cannot support a new promise', 'It is always legally binding', 'It automatically replaces new consideration', 'It applies only to maritime shipping']
      correctIdx = 0
    } else if (textCorpus.includes('ultra vires') || textCorpus.includes('company law') || textCorpus.includes('law')) {
      defaultQuestion = 'What does an act being "Ultra Vires" signify in corporate and administrative law?'
      defaultOptions = ['Beyond legal powers or statutory authority', 'Within sovereign royal prerogative', 'Presumed innocent until proven guilty', 'A binding precedent across all courts']
      correctIdx = 0
    }
    // 4. Literature in English & World History
    else if (textCorpus.includes('irony') || textCorpus.includes('macbeth') || textCorpus.includes('shakespeare') || textCorpus.includes('drama')) {
      defaultQuestion = 'What defines dramatic irony in literature and drama?'
      defaultOptions = ['The audience knows key facts that characters do not', 'Characters know all facts while the audience is confused', 'When an unexpected natural disaster occurs', 'A humorous monologue using multiple puns']
      correctIdx = 0
    } else if (textCorpus.includes('literature') || textCorpus.includes('poetry') || textCorpus.includes('personification')) {
      defaultQuestion = 'Which literary device attributes human qualities or actions to inanimate objects?'
      defaultOptions = ['Personification', 'Hyperbole', 'Synecdoche', 'Onomatopoeia']
      correctIdx = 0
    } else if (textCorpus.includes('history')) {
      defaultQuestion = 'In what year did Nigeria gain independence from British colonial rule?'
      defaultOptions = ['1960', '1963', '1957', '1970']
      correctIdx = 0
    }
    // 5. Commerce & Business Economics
    else if (textCorpus.includes('insurance') || textCorpus.includes('uberrimae') || textCorpus.includes('good faith')) {
      defaultQuestion = 'What does the insurance doctrine of "Uberrimae Fidei" require?'
      defaultOptions = ['Both parties must disclose all material facts honestly', 'The insurer must pay claims regardless of fraud', 'Premiums must remain flat for ten years', 'The insured can withhold prior accident history']
      correctIdx = 0
    } else if (textCorpus.includes('commerce') || textCorpus.includes('trade') || textCorpus.includes('quota')) {
      defaultQuestion = 'What term describes a government numerical restriction on the quantity of goods imported?'
      defaultOptions = ['Import Quota', 'Customs Tariff', 'Export Subsidy', 'Trade Embargo']
      correctIdx = 0
    }
    // 6. Accounting & Financial Economics
    else if (textCorpus.includes('accounting') || textCorpus.includes('equation') || textCorpus.includes('balance sheet') || textCorpus.includes('bookkeeping')) {
      defaultQuestion = 'According to the fundamental accounting equation, Assets must equal which of the following?'
      defaultOptions = ['Liabilities + Owner Equity', 'Liabilities - Owner Equity', 'Gross Revenue - Operating Expenses', 'Cash Inflow / Current Debt']
      correctIdx = 0
    } else if (textCorpus.includes('debit') || textCorpus.includes('credit')) {
      defaultQuestion = 'In double-entry bookkeeping, an increase in an asset account is recorded as a:'
      defaultOptions = ['Debit', 'Credit', 'Contra-liability', 'Dividend']
      correctIdx = 0
    }
    // 7. Political Science & Governance
    else if (textCorpus.includes('separation of powers') || textCorpus.includes('montesquieu') || textCorpus.includes('governance') || textCorpus.includes('polsci')) {
      defaultQuestion = 'Who formulated the modern doctrine of the Separation of Powers in 1748?'
      defaultOptions = ['Baron de Montesquieu', 'Thomas Hobbes', 'Niccolò Machiavelli', 'Karl Marx']
      correctIdx = 0
    }
    // 8. Product Design & UI/UX
    else if (textCorpus.includes('60-30-10') || textCorpus.includes('color') || textCorpus.includes('design')) {
      defaultQuestion = 'In the 60-30-10 UI design rule, what elements should the 10% accent color be reserved for?'
      defaultOptions = ['Call-to-Action buttons and key interactive elements', 'The entire canvas background', 'Body paragraphs of text', 'The header navigation background']
      correctIdx = 0
    } else if (textCorpus.includes('figma') || textCorpus.includes('auto-layout')) {
      defaultQuestion = 'Which Figma sizing property makes an element stretch to fill its parent container width?'
      defaultOptions = ['Fill Container', 'Hug Contents', 'Fixed Width', 'Clip Content']
      correctIdx = 0
    } else if (textCorpus.includes('touch') || textCorpus.includes('target')) {
      defaultQuestion = 'According to mobile accessibility standards (Apple HIG & WCAG), what is the minimum touch target size?'
      defaultOptions = ['44 × 44 pt (or 48 × 48 px)', '20 × 20 px', '12 × 12 px', '80 × 80 px']
      correctIdx = 0
    }
    // 9. Web Engineering
    else if (textCorpus.includes('event loop') || textCorpus.includes('microtask') || textCorpus.includes('javascript')) {
      defaultQuestion = 'Which queue has higher execution priority in the JavaScript Event Loop?'
      defaultOptions = ['Microtask Queue (Promises)', 'Macrotask Queue (setTimeout)', 'Rendering Queue', 'Idle Callbacks']
      correctIdx = 0
    } else if (textCorpus.includes('flexbox') || textCorpus.includes('center a div') || textCorpus.includes('css')) {
      defaultQuestion = 'Which CSS Flexbox property aligns items vertically along the cross axis?'
      defaultOptions = ['align-items', 'justify-content', 'text-align', 'float']
      correctIdx = 0
    }
    // 10. Data Science & AI
    else if (textCorpus.includes('overfitting') || textCorpus.includes('machine learning') || textCorpus.includes('data')) {
      defaultQuestion = 'Which scenario strongly indicates that a machine learning model is overfitting?'
      defaultOptions = ['High training accuracy but poor validation/test accuracy', 'Equal accuracy on both training and validation sets', 'Low accuracy on both training and test data', 'Fast convergence during gradient descent']
      correctIdx = 0
    } else {
      defaultQuestion = 'Which core principle is essential for mastering this academic topic?'
      defaultOptions = [
        'Mastering verified primary concepts and practical examples',
        'Relying solely on unverified assumptions',
        'Ignoring standard examination curriculum',
        'None of the above'
      ]
      correctIdx = 0
    }
  }

  const handleSelectOption = (index) => {
    if (isAnswered) return
    setSelectedOption(index)
    setIsAnswered(true)
    if (index === correctIdx) {
      setIsCorrect(true)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900 border-2 border-amber-500/30 dark:border-amber-500/20 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition relative overflow-hidden mb-2"
    >
      {/* Decorative Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-primary" />

      {/* Card Header: AI Lesson Badge & Author */}
      <div className="flex items-center justify-between mb-4 pt-1 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-emerald-600 text-white flex items-center justify-center font-bold overflow-hidden shadow-md flex-shrink-0">
            {author.avatar ? (
              <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
            ) : (
              <img src="/scholarhub-logo.svg" alt="ScholarHub" className="w-full h-full object-contain p-1" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm text-dark dark:text-white">{author.name || 'Official AI Study Bot'}</h3>
              <UserBadge user={author} />
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">@{author.username || 'ai_tutor'} • {post.category || 'Academic Track'}</p>
          </div>
        </div>

        {/* Prominent Official AI Study Lesson Tag */}
        <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-2xs">
          <FiBook size={12} />
          <span>OFFICIAL AI LESSON</span>
        </span>
      </div>

      {/* Lesson Title */}
      <h2 className="text-base font-extrabold text-dark dark:text-white mb-3 leading-snug">
        {cleanTitle}
      </h2>

      {/* Lesson Body Content */}
      <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-amber-500/5 dark:bg-zinc-800/60 p-4 rounded-xl border border-amber-500/10 dark:border-zinc-700/50 mb-4 font-normal">
        {cleanContent}
      </div>

      {/* Verified Academic Source / Citation Badge */}
      {post.citationSource && (
        <div className="mb-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
          <FiCheckCircle size={13} />
          <span>Verified Curriculum Source: {post.citationSource}</span>
        </div>
      )}

      {/* Interactive Knowledge Check Widget */}
      <div className="bg-gray-50 dark:bg-zinc-800/80 p-4 rounded-xl border border-gray-200/80 dark:border-zinc-700/80 mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-extrabold text-dark dark:text-white flex items-center gap-1.5">
            <FiZap className="text-amber-500" size={14} />
            <span>Knowledge Check</span>
          </h4>
          <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 bg-gray-200/60 dark:bg-zinc-700 px-2 py-0.5 rounded-full">
            Self Practice
          </span>
        </div>

        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-3">
          {defaultQuestion}
        </p>

        {/* 4-Option Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {defaultOptions.map((opt, idx) => {
            let btnStyle = 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:border-primary'

            if (isAnswered) {
              if (idx === correctIdx) {
                btnStyle = 'bg-emerald-500 text-white border-emerald-600 font-bold shadow-md'
              } else if (idx === selectedOption) {
                btnStyle = 'bg-red-500 text-white border-red-600 font-bold'
              } else {
                btnStyle = 'bg-gray-100 dark:bg-zinc-900/50 text-gray-400 border-gray-200 dark:border-zinc-800 opacity-60'
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswered}
                className={`p-2.5 text-left rounded-xl text-xs border transition flex items-center justify-between ${btnStyle}`}
              >
                <span>{opt}</span>
                {isAnswered && idx === correctIdx && <FiCheck size={14} className="flex-shrink-0" />}
                {isAnswered && idx === selectedOption && idx !== correctIdx && <FiX size={14} className="flex-shrink-0" />}
              </button>
            )
          })}
        </div>

        {/* Feedback Banner */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-2.5 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm ${
                isCorrect ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
              }`}
            >
              <FiAward size={16} />
              <span>{isCorrect ? 'Correct Answer! Concept Verified.' : `Incorrect. Option ${String.fromCharCode(65 + correctIdx)} is the correct answer.`}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-800 text-gray-500 text-xs font-bold">
        <button
          onClick={() => setLiked(!liked)}
          className={`flex items-center gap-1.5 transition cursor-pointer ${liked ? 'text-red-500' : 'hover:text-dark dark:hover:text-white'}`}
        >
          <FiHeart size={16} className={liked ? 'fill-current' : ''} />
          <span>{liked ? 'Liked' : 'Like'}</span>
        </button>

        <button
          onClick={() => onCommentClick && onCommentClick(post)}
          className="flex items-center gap-1.5 hover:text-primary transition text-gray-500 hover:text-primary cursor-pointer"
        >
          <FiMessageCircle size={16} />
          <span>{post.commentCount || 0} Comments</span>
        </button>

        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-1.5 hover:text-primary transition cursor-pointer"
        >
          <FiShare2 size={16} />
          <span>Share Lesson</span>
        </button>
      </div>

      {/* Share Modal Integration */}
      <ShareModal
        isOpen={showShareModal}
        post={post}
        onClose={() => setShowShareModal(false)}
      />
    </motion.div>
  )
}
