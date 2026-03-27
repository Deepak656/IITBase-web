import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

        .lp-root {
          font-family: 'DM Sans', system-ui, sans-serif;
          color: #1c1917;
        }

        /* ── Hero ───────────────────────────────────────────── */
        .lp-hero {
          background: #0a0f1e;
          position: relative;
          overflow: hidden;
          padding: 120px 24px 100px;
        }

        .lp-hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        .lp-hero-glow {
          position: absolute;
          width: 700px;
          height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%);
          top: -200px;
          right: -200px;
          pointer-events: none;
        }

        .lp-hero-glow-2 {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 65%);
          bottom: -100px;
          left: -100px;
          pointer-events: none;
        }

        .lp-hero-inner {
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .lp-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          color: #a5b4fc;
          letter-spacing: 0.3px;
          margin-bottom: 32px;
        }

        .lp-hero-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #6366f1;
          animation: lp-pulse 2s ease-in-out infinite;
        }

        @keyframes lp-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }

        .lp-hero-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(42px, 6vw, 72px);
          font-weight: 500;
          color: #f8fafc;
          line-height: 1.1;
          letter-spacing: -1px;
          margin-bottom: 24px;
          max-width: 820px;
        }

        .lp-hero-heading em {
          font-style: italic;
          color: #a5b4fc;
        }

        .lp-hero-sub {
          font-size: 18px;
          color: #64748b;
          line-height: 1.7;
          font-weight: 300;
          max-width: 560px;
          margin-bottom: 48px;
        }

        .lp-hero-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 64px;
        }

        .lp-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          color: white;
          font-size: 15px;
          font-weight: 500;
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 4px 24px rgba(99,102,241,0.3);
          font-family: 'DM Sans', sans-serif;
        }

        .lp-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(99,102,241,0.4);
        }

        .lp-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background: rgba(255,255,255,0.05);
          color: #94a3b8;
          font-size: 15px;
          font-weight: 400;
          border-radius: 10px;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }

        .lp-btn-ghost:hover {
          background: rgba(255,255,255,0.08);
          color: #f1f5f9;
          border-color: rgba(255,255,255,0.18);
        }

        .lp-hero-stats {
          display: flex;
          align-items: center;
          gap: 40px;
          flex-wrap: wrap;
          padding-top: 40px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .lp-hero-stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 500;
          color: #f8fafc;
          letter-spacing: -0.5px;
          line-height: 1;
          margin-bottom: 4px;
        }

        .lp-hero-stat-label {
          font-size: 13px;
          color: #475569;
          font-weight: 300;
        }

        .lp-hero-stat-divider {
          width: 1px;
          height: 36px;
          background: rgba(255,255,255,0.07);
        }

        /* ── Social proof bar ───────────────────────────────── */
        .lp-proof {
          background: #f7f6f3;
          border-top: 1px solid #e8e5df;
          border-bottom: 1px solid #e8e5df;
          padding: 20px 24px;
          overflow: hidden;
        }

        .lp-proof-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .lp-proof-label {
          font-size: 12px;
          font-weight: 500;
          color: #a8a29e;
          text-transform: uppercase;
          letter-spacing: 1px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .lp-proof-divider {
          width: 1px;
          height: 16px;
          background: #d4cfc8;
          flex-shrink: 0;
        }

        .lp-proof-items {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .lp-proof-item {
          font-size: 13px;
          font-weight: 500;
          color: #78716c;
          white-space: nowrap;
        }

        /* ── Section shared ─────────────────────────────────── */
        .lp-section {
          padding: 96px 24px;
        }

        .lp-section-inner {
          max-width: 1100px;
          margin: 0 auto;
        }

        .lp-section-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #6366f1;
          margin-bottom: 16px;
        }

        .lp-section-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 500;
          color: #1c1917;
          letter-spacing: -0.5px;
          line-height: 1.2;
          margin-bottom: 16px;
        }

        .lp-section-sub {
          font-size: 16px;
          color: #78716c;
          line-height: 1.7;
          font-weight: 300;
          max-width: 520px;
          margin-bottom: 56px;
        }

        /* ── How it works ───────────────────────────────────── */
        .lp-how {
          background: #ffffff;
        }

        .lp-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
          background: #e8e5df;
          border: 1px solid #e8e5df;
          border-radius: 16px;
          overflow: hidden;
        }

        .lp-step {
          background: #ffffff;
          padding: 36px 32px;
          position: relative;
        }

        .lp-step-num {
          font-family: 'Playfair Display', serif;
          font-size: 48px;
          font-weight: 500;
          color: #f0efe9;
          line-height: 1;
          margin-bottom: 20px;
          letter-spacing: -2px;
        }

        .lp-step-title {
          font-size: 16px;
          font-weight: 600;
          color: #1c1917;
          margin-bottom: 10px;
          letter-spacing: -0.2px;
        }

        .lp-step-body {
          font-size: 14px;
          color: #78716c;
          line-height: 1.7;
          font-weight: 300;
        }

        /* ── For whom ───────────────────────────────────────── */
        .lp-whom {
          background: #f7f6f3;
        }

        .lp-whom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .lp-whom-card {
          background: #ffffff;
          border: 1px solid #e8e5df;
          border-radius: 16px;
          padding: 40px;
          position: relative;
          overflow: hidden;
        }

        .lp-whom-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
        }

        .lp-whom-card-talent::before { background: linear-gradient(90deg, #6366f1, #818cf8); }
        .lp-whom-card-recruiter::before { background: linear-gradient(90deg, #10b981, #34d399); }

        .lp-whom-card-icon {
          font-size: 32px;
          margin-bottom: 20px;
          display: block;
        }

        .lp-whom-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 500;
          color: #1c1917;
          margin-bottom: 10px;
          letter-spacing: -0.3px;
        }

        .lp-whom-card-sub {
          font-size: 14px;
          color: #78716c;
          line-height: 1.7;
          font-weight: 300;
          margin-bottom: 28px;
        }

        .lp-whom-list {
          list-style: none;
          padding: 0;
          margin: 0 0 32px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .lp-whom-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 14px;
          color: #44403c;
          font-weight: 400;
          line-height: 1.5;
        }

        .lp-whom-list li::before {
          content: '✓';
          font-size: 12px;
          font-weight: 600;
          color: #6366f1;
          margin-top: 1px;
          flex-shrink: 0;
        }

        .lp-whom-card-recruiter .lp-whom-list li::before {
          color: #10b981;
        }

        .lp-whom-cta-talent {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          color: white;
          font-size: 14px;
          font-weight: 500;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }

        .lp-whom-cta-talent:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(99,102,241,0.3);
        }

        .lp-whom-cta-recruiter {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #059669, #10b981);
          color: white;
          font-size: 14px;
          font-weight: 500;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }

        .lp-whom-cta-recruiter:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(16,185,129,0.3);
        }

        /* ── Why IITBase ────────────────────────────────────── */
        .lp-why {
          background: #ffffff;
        }

        .lp-why-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .lp-why-item {
          padding: 0;
        }

        .lp-why-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #f0efe9;
          border: 1px solid #e8e5df;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          color: #6366f1;
        }

        .lp-why-title {
          font-size: 15px;
          font-weight: 600;
          color: #1c1917;
          margin-bottom: 8px;
          letter-spacing: -0.1px;
        }

        .lp-why-body {
          font-size: 14px;
          color: #78716c;
          line-height: 1.7;
          font-weight: 300;
        }

        /* ── Community ──────────────────────────────────────── */
        .lp-community {
          background: #0a0f1e;
          position: relative;
          overflow: hidden;
        }

        .lp-community-grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        .lp-community-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 96px 24px;
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .lp-community-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #10b981;
          margin-bottom: 16px;
        }

        .lp-community-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 3.5vw, 40px);
          font-weight: 500;
          color: #f8fafc;
          letter-spacing: -0.5px;
          line-height: 1.2;
          margin-bottom: 16px;
        }

        .lp-community-sub {
          font-size: 15px;
          color: #64748b;
          line-height: 1.7;
          font-weight: 300;
          margin-bottom: 32px;
        }

        .lp-community-features {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .lp-community-feature {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 18px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
        }

        .lp-community-feature-icon {
          font-size: 20px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .lp-community-feature-title {
          font-size: 14px;
          font-weight: 500;
          color: #cbd5e1;
          margin-bottom: 3px;
        }

        .lp-community-feature-body {
          font-size: 13px;
          color: #475569;
          font-weight: 300;
          line-height: 1.5;
        }

        /* ── CTA ────────────────────────────────────────────── */
        .lp-cta {
          background: #f7f6f3;
          border-top: 1px solid #e8e5df;
          padding: 96px 24px;
        }

        .lp-cta-inner {
          max-width: 680px;
          margin: 0 auto;
          text-align: center;
        }

        .lp-cta-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(30px, 4vw, 46px);
          font-weight: 500;
          color: #1c1917;
          letter-spacing: -0.5px;
          line-height: 1.2;
          margin-bottom: 16px;
        }

        .lp-cta-sub {
          font-size: 16px;
          color: #78716c;
          line-height: 1.7;
          font-weight: 300;
          margin-bottom: 40px;
        }

        .lp-cta-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .lp-cta-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          color: white;
          font-size: 15px;
          font-weight: 500;
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 4px 24px rgba(99,102,241,0.25);
          font-family: 'DM Sans', sans-serif;
        }

        .lp-cta-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(99,102,241,0.35);
        }

        .lp-cta-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background: #ffffff;
          color: #44403c;
          font-size: 15px;
          font-weight: 400;
          border-radius: 10px;
          text-decoration: none;
          border: 1px solid #e8e5df;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }

        .lp-cta-btn-secondary:hover {
          border-color: #d4cfc8;
          background: #fafaf9;
          color: #1c1917;
        }

        /* ── Responsive ─────────────────────────────────────── */
        @media (max-width: 768px) {
          .lp-steps         { grid-template-columns: 1fr; }
          .lp-whom-grid     { grid-template-columns: 1fr; }
          .lp-why-grid      { grid-template-columns: 1fr 1fr; }
          .lp-community-inner { grid-template-columns: 1fr; gap: 40px; }
          .lp-hero-stats    { gap: 24px; }
          .lp-hero-stat-divider { display: none; }
        }

        @media (max-width: 480px) {
          .lp-why-grid { grid-template-columns: 1fr; }
          .lp-hero { padding: 80px 20px 60px; }
          .lp-section { padding: 64px 20px; }
        }
      `}</style>

      <div className="lp-root">

        {/* ── Hero ────────────────────────────────────────── */}
        <section className="lp-hero">
          <div className="lp-hero-grid" />
          <div className="lp-hero-glow" />
          <div className="lp-hero-glow-2" />

          <div className="lp-hero-inner">
            <div className="lp-hero-badge">
              <span className="lp-hero-badge-dot" />
              Exclusively for IIT graduates
            </div>

            <h1 className="lp-hero-heading">
              The network where<br />
              <em>IIT talent</em> meets<br />
              serious opportunity.
            </h1>

            <p className="lp-hero-sub">
              Every job is manually reviewed. Every member is IIT-verified.
              No noise, no middlemen — just the right roles for the right people.
            </p>

            <div className="lp-hero-actions">
              <Link href="/jobs" className="lp-btn-primary">
                Browse open roles
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/signup" className="lp-btn-ghost">
                Create your profile
              </Link>
            </div>

            <div className="lp-hero-stats">
              {[
                { value: '100%', label: 'Manually reviewed jobs' },
                null,
                { value: 'IIT only', label: 'Verified talent pool' },
                null,
                { value: 'Zero', label: 'Spam or noise' },
                null,
                { value: 'Direct', label: 'To decision makers' },
              ].map((stat, i) =>
                stat === null ? (
                  <div key={i} className="lp-hero-stat-divider" />
                ) : (
                  <div key={i}>
                    <div className="lp-hero-stat-value">{stat.value}</div>
                    <div className="lp-hero-stat-label">{stat.label}</div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* ── Proof bar ───────────────────────────────────── */}
        <div className="lp-proof">
          <div className="lp-proof-inner">
            <span className="lp-proof-label">IITians from</span>
            <div className="lp-proof-divider" />
            <div className="lp-proof-items">
              {['IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kharagpur', 'IIT Kanpur', 'IIT Roorkee', 'IIT Hyderabad', 'IIT Guwahati'].map(iit => (
                <span key={iit} className="lp-proof-item">{iit}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── How it works ────────────────────────────────── */}
        <section className="lp-section lp-how">
          <div className="lp-section-inner">
            <div className="lp-section-eyebrow">How it works</div>
            <h2 className="lp-section-heading">
              From profile to offer.<br />No noise in between.
            </h2>
            <p className="lp-section-sub">
              A three-step process designed for people who don't have time to waste.
            </p>

            <div className="lp-steps">
              {[
                {
                  num: '01',
                  title: 'Create your profile',
                  body: 'Add your IIT credentials, work experience, skills, and what you\'re looking for. Takes under 10 minutes.',
                },
                {
                  num: '02',
                  title: 'Browse curated roles',
                  body: 'Every listing is manually reviewed by our team. You see quality roles from companies that specifically want IIT talent.',
                },
                {
                  num: '03',
                  title: 'Apply directly',
                  body: 'No intermediaries. We link you directly to the company\'s application page or connect you with the recruiter.',
                },
              ].map(step => (
                <div key={step.num} className="lp-step">
                  <div className="lp-step-num">{step.num}</div>
                  <div className="lp-step-title">{step.title}</div>
                  <p className="lp-step-body">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── For whom ────────────────────────────────────── */}
        <section className="lp-section lp-whom">
          <div className="lp-section-inner">
            <div className="lp-section-eyebrow">Built for two audiences</div>
            <h2 className="lp-section-heading">
              Whether you're hiring<br />or being hired.
            </h2>

            <div className="lp-whom-grid">
              <div className="lp-whom-card lp-whom-card-talent">
                <span className="lp-whom-card-icon">🎓</span>
                <h3 className="lp-whom-card-title">For IIT graduates</h3>
                <p className="lp-whom-card-sub">
                  Your degree opens doors. We make sure the right doors are in front of you — roles that match your depth, not just your keywords.
                </p>
                <ul className="lp-whom-list">
                  <li>Only roles actively seeking IIT talent</li>
                  <li>Full job description transparency — no bait and switch</li>
                  <li>Community-verified listings, flagged when stale</li>
                  <li>Direct recruiter access, no black-hole applications</li>
                  <li>Peer network to share referrals and opportunities</li>
                </ul>
                <Link href="/signup?role=JOB_SEEKER" className="lp-whom-cta-talent">
                  Create your profile →
                </Link>
              </div>

              <div className="lp-whom-card lp-whom-card-recruiter">
                <span className="lp-whom-card-icon">🏢</span>
                <h3 className="lp-whom-card-title">For recruiters</h3>
                <p className="lp-whom-card-sub">
                  Stop sorting through hundreds of unqualified applications. Post once, reach the exact talent pool you're looking for.
                </p>
                <ul className="lp-whom-list">
                  <li>Access to verified IIT-graduate profiles</li>
                  <li>Manual review ensures listing quality on both sides</li>
                  <li>Targeted reach — no wasted impressions</li>
                  <li>Transparent tier-1 hiring signal to attract serious candidates</li>
                  <li>Managed applicant pipeline in your dashboard</li>
                </ul>
                <Link href="/signup?role=RECRUITER" className="lp-whom-cta-recruiter">
                  Post a role →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Why IITBase ─────────────────────────────────── */}
        <section className="lp-section lp-why">
          <div className="lp-section-inner">
            <div className="lp-section-eyebrow">Why IITBase</div>
            <h2 className="lp-section-heading">
              Built different,<br />on purpose.
            </h2>
            <p className="lp-section-sub">
              Every product decision was made with one question in mind — does this make it easier for serious talent to find serious work?
            </p>

            <div className="lp-why-grid">
              {[
                {
                  icon: (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: 'Every job is hand-reviewed',
                  body: 'We read every submission before it goes live. No algorithmic approvals, no spam.',
                },
                {
                  icon: (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                  title: 'Direct application links',
                  body: 'We never intercept applications. You apply directly on the company\'s career page.',
                },
                {
                  icon: (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: 'Always fresh',
                  body: 'Expired listings are removed. The community flags stale posts. What you see is live.',
                },
                {
                  icon: (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ),
                  title: 'Full transparency',
                  body: 'Every listing shows why it qualifies. No ambiguous job titles, no hidden requirements.',
                },
                {
                  icon: (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                  title: 'Peer-powered integrity',
                  body: 'IITians report outdated or misleading listings. The community keeps the platform honest.',
                },
                {
                  icon: (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  ),
                  title: 'Private by default',
                  body: 'Your profile is only surfaced to relevant recruiters. We don\'t sell your data or blast your inbox.',
                },
              ].map(item => (
                <div key={item.title} className="lp-why-item">
                  <div className="lp-why-icon">{item.icon}</div>
                  <div className="lp-why-title">{item.title}</div>
                  <p className="lp-why-body">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Community ───────────────────────────────────── */}
        <section className="lp-community">
          <div className="lp-community-grid-bg" />
          <div className="lp-community-inner">
            <div>
              <div className="lp-community-eyebrow">Community</div>
              <h2 className="lp-community-heading">
                Your network gets you hired.<br />We make it work.
              </h2>
              <p className="lp-community-sub">
                IITBase isn't just a job board. It's an active network of graduates helping each other navigate careers — referrals, opportunities, and honest advice from people who've been there.
              </p>
              <Link href="/signup" className="lp-btn-primary" style={{ display: 'inline-flex' }}>
                Join the network →
              </Link>
            </div>

            <div className="lp-community-features">
              {[
                {
                  icon: '🤝',
                  title: 'Peer referrals',
                  body: 'Share open roles at your company directly with fellow IITians. Referrals close faster.',
                },
                {
                  icon: '📢',
                  title: 'Opportunity sharing',
                  body: 'IITians post roles from their networks. Community-sourced jobs that never make it to LinkedIn.',
                },
                {
                  icon: '🛡️',
                  title: 'Community moderation',
                  body: 'Members flag outdated or misleading listings. The platform stays clean because the community cares.',
                },
                {
                  icon: '💬',
                  title: 'Honest signal',
                  body: 'Know which companies are actually good to work at, from people who work there.',
                },
              ].map(f => (
                <div key={f.title} className="lp-community-feature">
                  <span className="lp-community-feature-icon">{f.icon}</span>
                  <div>
                    <div className="lp-community-feature-title">{f.title}</div>
                    <p className="lp-community-feature-body">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────── */}
        <section className="lp-cta">
          <div className="lp-cta-inner">
            <h2 className="lp-cta-heading">
              Your next role is here.<br />Start looking.
            </h2>
            <p className="lp-cta-sub">
              Join the network built specifically for IIT graduates. No noise, no spam — just the right opportunities from companies that know what IIT means.
            </p>
            <div className="lp-cta-actions">
              <Link href="/jobs" className="lp-cta-btn-primary">
                Browse open roles →
              </Link>
              <Link href="/signup" className="lp-cta-btn-secondary">
                Create free account
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}