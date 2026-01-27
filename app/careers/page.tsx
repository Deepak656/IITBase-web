// app/careers/page.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function CareersPage() {
  const router = useRouter();

  const positions = [
    {
      title: 'Software Developer',
      type: 'Full Time',
      location: 'Remote / Hybrid',
      description: 'Join our core engineering team to build and scale IITBase platform. Work on full-stack development with Next.js, React, and modern backend technologies.',
      responsibilities: [
        'Develop and maintain web applications using Next.js and React',
        'Design and implement RESTful APIs and backend services',
        'Collaborate on architecture decisions and technical design',
        'Write clean, maintainable, and well-tested code',
        'Participate in code reviews and knowledge sharing',
      ],
      requirements: [
        'Strong proficiency in JavaScript/TypeScript',
        'Experience with React and Next.js',
        'Understanding of backend development (Node.js, Java, or similar)',
        'Familiarity with databases (SQL/NoSQL)',
        'Good problem-solving and communication skills',
      ],
    },
    {
      title: 'Software Development Intern',
      type: 'Internship',
      location: 'Remote',
      description: 'Get hands-on experience working on a real-world product. Learn modern web development practices while contributing to features that impact thousands of users.',
      responsibilities: [
        'Assist in developing new features and improvements',
        'Write and test code under guidance of senior developers',
        'Participate in daily standups and sprint planning',
        'Learn industry best practices and coding standards',
        'Contribute to documentation and technical discussions',
      ],
      requirements: [
        'Currently pursuing or recently completed degree in CS/IT or related field',
        'Basic knowledge of web development (HTML, CSS, JavaScript)',
        'Familiarity with React or willingness to learn quickly',
        'Strong eagerness to learn and grow',
        'Good communication and teamwork skills',
      ],
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Careers at IITBase</h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Join us in building the premier job platform for India's top technical talent. We're a lean, ambitious team working on solving real problems.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Why Join Us */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Join IITBase?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real Impact</h3>
              <p className="text-gray-600 text-sm">Your work directly affects thousands of job seekers and shapes the future of technical hiring in India.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Learn & Grow</h3>
              <p className="text-gray-600 text-sm">Work with modern tech stack, learn best practices, and grow your skills in a supportive environment.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Early Team Member</h3>
              <p className="text-gray-600 text-sm">Join us at the ground floor. Shape the product, culture, and future of the company.</p>
            </div>
          </div>
        </div>

        {/* Open Positions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Open Positions</h2>
          <p className="text-gray-600 mb-8">We're currently hiring for the following roles</p>

          <div className="space-y-6">
            {positions.map((position, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-8 hover:border-gray-300 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{position.title}</h3>
                    <div className="flex flex-wrap gap-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-md">
                        {position.type}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-md">
                        {position.location}
                      </span>
                    </div>
                  </div>
                  <a
                    href="mailto:hello@iitbase.com?subject=Application for Software Developer Position"
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                  >
                    Apply Now
                  </a>
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">{position.description}</p>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Responsibilities</h4>
                    <ul className="space-y-2">
                      {position.responsibilities.map((item, i) => (
                        <li key={i} className="flex gap-3 text-gray-700 text-sm">
                          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Requirements</h4>
                    <ul className="space-y-2">
                      {position.requirements.map((item, i) => (
                        <li key={i} className="flex gap-3 text-gray-700 text-sm">
                          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How to Apply */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How to Apply</h2>
          <p className="text-gray-700 mb-4">
            Interested in joining our team? Send your resume and a brief introduction to:
          </p>
          <a
            href="mailto:hello@iitbase.com"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-lg transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            hello@iitbase.com
          </a>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Include the position title in your email subject line</p>
            <p>• Attach your resume (PDF preferred)</p>
            <p>• Tell us why you're interested in IITBase</p>
            <p>• Share any relevant projects or portfolio links</p>
          </div>
        </div>

        {/* Not Finding Right Role */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Don't see the right role?</h3>
          <p className="text-gray-600 mb-4">
            We're always interested in meeting talented people. Send us your resume and tell us how you'd like to contribute.
          </p>
          <a
            href="mailto:hello@iitbase.com?subject=General Application - IITBase"
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Get in Touch
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}