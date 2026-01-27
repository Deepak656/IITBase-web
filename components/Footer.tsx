import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-cyan-300 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <span className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                IITBase
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed max-w-md" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Premium job opportunities curated exclusively for IITians. Every listing is manually reviewed for quality and relevance.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
              Platform
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/jobs" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/submit-job" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Submit a Job
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Feedback & Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/about" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/careers" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <Link href="/feedback" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Report Bug & Feature Request
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
              © {currentYear} IITBase. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="/privacy" className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}