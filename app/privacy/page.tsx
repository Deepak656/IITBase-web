'use client';

import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: January 26, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-gray max-w-none">

          {/* Intro */}
          <div className="mb-12">
            <p className="text-gray-700">
              IITBase ("we", "our", or "us") is a community-driven job discovery platform. We respect your privacy and are committed
              to protecting your personal data. This Privacy Policy explains how we collect, use, store, and safeguard information
              when you use our website and services.
            </p>
          </div>

          {/* Data Collected */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold">Information We Collect</h2>

            <h3 className="text-lg font-semibold mt-6">Job Seekers</h3>
            <ul className="ml-6 text-gray-700 space-y-2">
              <li>• Name, email address, phone number</li>
              <li>• Resume/CV, profile photo</li>
              <li>• Education, work experience, skills</li>
              <li>• Feedback, reports, and communications</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6">Recruiters / Companies</h3>
            <ul className="ml-6 text-gray-700 space-y-2">
              <li>• Recruiter name, email, phone number</li>
              <li>• Company name, job descriptions, job links</li>
              <li>• Recruitment-related communications</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6">Automatically Collected</h3>
            <ul className="ml-6 text-gray-700 space-y-2">
              <li>• IP address, browser type, device data</li>
              <li>• Usage data (pages visited, interactions)</li>
              <li>• Cookies and similar technologies</li>
            </ul>
          </div>

          {/* Usage */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold">How We Use Information</h2>
            <ul className="ml-6 text-gray-700 space-y-2">
              <li>• Display and manage job listings</li>
              <li>• Enable job applications and recruiter outreach</li>
              <li>• Improve platform quality and user experience</li>
              <li>• Respond to reports, feedback, and takedown requests</li>
              <li>• Prevent misuse, fraud, and abuse</li>
              <li>• Comply with legal obligations</li>
            </ul>
          </div>

          {/* Sharing */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold">Data Sharing</h2>
            <p className="text-gray-700">
              We do <strong>not sell or rent</strong> your personal data. Information may be shared only:
            </p>
            <ul className="ml-6 text-gray-700 space-y-2">
              <li>• With your explicit consent</li>
              <li>• With service providers (hosting, email, analytics)</li>
              <li>• When legally required</li>
            </ul>
          </div>

          {/* Security */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold">Data Security</h2>
            <p className="text-gray-700">
              We use industry-standard security practices including access controls, encryption,
              and secure infrastructure. While no system is 100% secure, we continuously work to
              protect your data.
            </p>
          </div>

          {/* Retention */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold">Data Retention</h2>
            <p className="text-gray-700">
              We retain personal data only as long as necessary for platform operations or legal compliance.
              You may request deletion of your data at any time.
            </p>
          </div>

          {/* Rights */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold">Your Rights</h2>
            <ul className="ml-6 text-gray-700 space-y-2">
              <li>• Access, update, or delete your data</li>
              <li>• Withdraw consent</li>
              <li>• Report inaccurate or misleading content</li>
            </ul>
            <p className="mt-4">
              Contact us at <a href="mailto:hello@iitbase.com" className="text-blue-600">hello@iitbase.com</a>
            </p>
          </div>

          {/* Contact */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-bold">Contact Us</h2>
            <p className="text-gray-700">
              Email: <a href="mailto:hello@iitbase.com" className="text-blue-600">hello@iitbase.com</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
