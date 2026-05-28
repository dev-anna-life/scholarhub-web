/* eslint-disable no-unused-vars */
import { motion } from "framer-motion"
import { FiFileText } from "react-icons/fi"
import { useRouter } from "next/navigation"

function Terms() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-light pt-16 md:pt-0 relative z-10">
      <div className="max-w-3xl mx-auto px-4 py-8 md:pl-10">
        <button
          onClick={() => router.push(-1)}
          className="text-sm text-gray-500 hover:text-primary mb-6 flex items-center gap-1"
        >
          ← Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <FiFileText size={28} className="text-primary" />
            <h1 className="text-2xl font-extrabold text-dark">Terms of Service</h1>
          </div>

          <p className="text-sm text-gray-500 mb-6">Last updated: May 4, 2026</p>

          <div className="space-y-6 text-sm text-gray-600">
            <section>
              <h2 className="text-lg font-bold text-dark mb-2">1. Acceptance of Terms</h2>
              <p>By creating an account or using ScholarHub, you agree to be bound by these terms. If you do not agree, please do not use the platform.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-dark mb-2">2. Eligibility</h2>
              <p>You must be at least 13 years old and a student to use ScholarHub. You are responsible for maintaining the security of your account credentials.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-dark mb-2">3. Acceptable Use</h2>
              <p className="mb-2">You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Post inappropriate, harmful, or illegal content</li>
                <li>Impersonate another person or institution</li>
                <li>Harass, bully, or discriminate against other users</li>
                <li>Spam, advertise, or promote commercial products</li>
                <li>Attempt to gain unauthorized access to the platform</li>
                <li>Use automated bots to interact with the platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-dark mb-2">4. Content Ownership</h2>
              <p>You retain ownership of content you post. By posting, you grant ScholarHub a license to display and distribute your content within the platform. We may remove content that violates these terms.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-dark mb-2">5. Coin System</h2>
              <p>Coins are virtual rewards earned through platform activity. They have no real-world monetary value and cannot be exchanged for cash. ScholarHub reserves the right to modify the coin system at any time.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-dark mb-2">6. Account Termination</h2>
              <p>We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from your settings.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-dark mb-2">7. Platform Availability</h2>
              <p>We strive to keep ScholarHub available 24/7 but do not guarantee uninterrupted access. We may perform maintenance or updates that temporarily affect availability.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-dark mb-2">8. Limitation of Liability</h2>
              <p>ScholarHub is provided "as is." We are not liable for any damages arising from your use of the platform, including but not limited to data loss or service interruption.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-dark mb-2">9. Changes to Terms</h2>
              <p>We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-dark mb-2">10. Contact</h2>
              <p>For questions about these terms, contact us at <span className="text-primary">support@scholarhub.com</span>.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Terms
