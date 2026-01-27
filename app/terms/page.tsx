'use client';

import { useRouter } from 'next/navigation';

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
          <p className="text-gray-600">Last updated: January 26, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-gray max-w-none">

          <p className="text-gray-700">
            IITBase is a free, community-driven job discovery platform. By accessing or using IITBase,
            you agree to these Terms & Conditions.
          </p>

          <h2 className="text-2xl font-bold mt-10">Nature of Service</h2>
          <p className="text-gray-700">
            IITBase lists job opportunities sourced from public job boards, company career pages,
            and recruiter submissions. We do not guarantee job availability, accuracy, or hiring outcomes.
          </p>

          <h2 className="text-2xl font-bold mt-10">User Responsibilities</h2>
          <ul className="ml-6 text-gray-700 space-y-2">
            <li>• Provide accurate and lawful information</li>
            <li>• Do not post misleading, fraudulent, or spam content</li>
            <li>• Respect community standards and reporting mechanisms</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10">Recruiter & Company Posts</h2>
          <p className="text-gray-700">
            Recruiters are responsible for the accuracy and legitimacy of their job postings.
            IITBase reserves the right to remove any job post upon request, report, or violation.
          </p>

          <h2 className="text-2xl font-bold mt-10">Content Moderation</h2>
          <p className="text-gray-700">
            Users may report job posts or content. We review reports in good faith but are not obligated
            to act in all cases.
          </p>

          <h2 className="text-2xl font-bold mt-10">Data & Privacy</h2>
          <p className="text-gray-700">
            All personal data is handled according to our Privacy Policy. We do not sell user data and
            follow industry-standard security practices.
          </p>

          <h2 className="text-2xl font-bold mt-10">Free Service Disclaimer</h2>
          <p className="text-gray-700">
            IITBase is currently offered free of charge. Features, pricing, or business models may change
            in the future with notice.
          </p>

          <h2 className="text-2xl font-bold mt-10">Limitation of Liability</h2>
          <p className="text-gray-700">
            IITBase is not liable for job outcomes, employer actions, or third-party content.
            Use the platform at your own discretion.
          </p>

          <h2 className="text-2xl font-bold mt-10">Governing Law</h2>
          <p className="text-gray-700">
            These Terms are governed by the laws of India.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-12">
            <h2 className="text-xl font-bold">Contact</h2>
            <p className="text-gray-700">
              Questions or concerns? Email us at{' '}
              <a href="mailto:hello@iitbase.com" className="text-blue-600">
                hello@iitbase.com
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
