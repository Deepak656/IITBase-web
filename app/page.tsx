import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
              Premium Opportunities for Top-Tier Talent
            </h1>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
              IITBase connects graduates from IIT, NIT, and premier institutions with high-quality roles at leading companies. Every job is manually curated and verified.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/jobs"
                className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-400 text-gray-900 font-semibold rounded-lg hover:shadow-md transition-shadow"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Explore Opportunities
              </Link>
              <Link
                href="/submit-job"
                className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Post a Job
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                100%
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Manually Reviewed
              </div>
              <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Every job posting is vetted by our team
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                Top 1%
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Elite Institutions
              </div>
              <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Focused on IIT, NIT, and tier-1 colleges
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                Quality First
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                No Spam or Noise
              </div>
              <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Only relevant, high-caliber opportunities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              Why IITBase
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl" style={{ fontFamily: 'Roboto, sans-serif' }}>
              We understand the unique value that top-tier graduates bring to organizations. Our platform ensures you only see opportunities that match your caliber.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                Verified Listings
              </h3>
              <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Every job goes through manual review to ensure it meets our quality standards and is genuinely seeking tier-1 talent.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                Direct Applications
              </h3>
              <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                No middlemen. We provide direct links to company career pages, ensuring your application reaches the right people.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                Community Driven
              </h3>
              <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Report outdated or misleading listings. Our community helps maintain platform integrity and job quality.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                Advanced Filters
              </h3>
              <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Search by role, experience level, tech stack, location, and more to find opportunities that match your profile.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                Transparent Process
              </h3>
              <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                See why each job qualifies as tier-1 focused. We explain our selection criteria for every listing.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                Always Fresh
              </h3>
              <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                We actively remove expired listings and monitor job status to ensure you are not wasting time on closed positions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-400 rounded-xl p-16 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              Ready to Find Your Next Opportunity
            </h2>
            <p className="text-lg text-gray-800 mb-10 max-w-2xl mx-auto" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Join hundreds of tier-1 graduates who trust IITBase for their career advancement.
            </p>
            <Link
              href="/jobs"
              className="inline-block px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Start Exploring Jobs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}