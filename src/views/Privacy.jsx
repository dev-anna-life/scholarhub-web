/* eslint-disable no-unused-vars */
import { motion } from "framer-motion"
import { FiShield, FiArrowLeft } from "react-icons/fi"
import { useRouter } from "next/navigation"

function Privacy() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-light pt-16 md:pt-0 relative z-10">
      <div className="max-w-3xl mx-auto px-4 py-8 md:pl-10">
        <button
          onClick={() => router.push(-1)}
          className="text-sm text-gray-500 hover:text-primary mb-6 flex items-center gap-1"
        >
          <FiArrowLeft size={14} /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <FiShield size={28} className="text-primary" />
            <h1 className="text-2xl font-extrabold text-dark">Privacy Policy</h1>
          </div>

          <p className="text-sm text-gray-500 mb-6">Last updated: May 4, 2026</p>

          <div className="space-y-6 text-sm text-gray-600">
            <section>
              <h2 className="text-lg font-bold text-dark mb-2">1. Information We Collect</h2>
              <p className="mb-2">We collect information you provide directly, including:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Full name and email address</li>
                <li>Phone number and school information</li>
                <li>Posts, comments, and interactions on the platform</li>
                <li>Profile data such as education level and interests</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-dark mb-2">2. How We Use Your Information</h2>
              <p className="mb-2">We use your information to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Create and manage your ScholarHub account</li>
                <li>Connect you with other students and communities</li>
                <li>Provide personalized content based on your interests</li>
                <li>Maintain platform security and prevent abuse</li>
                <li>Send important notifications about your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-dark mb-2">3. Data Sharing</h2>
              <p>We do not sell your personal information. Your profile may be visible to other users on the platform based on your privacy settings. We may share data with service providers who help us operate the platform.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-dark mb-2">4. Data Security</h2>
              <p>We use industry-standard security measures to protect your data, including encrypted passwords and secure server infrastructure. However, no system is 100% secure, and we cannot guarantee absolute security.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-dark mb-2">5. Data Retention</h2>
              <p>We retain your data as long as your account is active. If you delete your account, your personal information will be removed within 30 days.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-dark mb-2">6. Your Rights</h2>
              <p className="mb-2">You have the right to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access, update, or delete your personal data</li>
                <li>Change your privacy settings at any time</li>
                <li>Opt out of marketing communications</li>
                <li>Export your data from the platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-dark mb-2">7. Children's Privacy</h2>
              <p>ScholarHub is intended for students aged 13 and above. We do not knowingly collect data from children under 13.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-dark mb-2">8. Contact Us</h2>
              <p>If you have questions about this privacy policy, please contact us at <span className="text-primary">scholarhubng1@gmail.com</span>.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Privacy
