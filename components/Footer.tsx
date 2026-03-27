import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: '#ffffff',
      borderTop: '1px solid #e8e5df',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 24px 32px' }}>

        {/* Top grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: 48,
          marginBottom: 48,
        }}>

          {/* Brand */}
          <div>
            <Link href="/" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              marginBottom: 16,
            }}>
              <div style={{
                width: 34,
                height: 34,
                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Playfair Display', serif",
                fontSize: 17,
                fontWeight: 600,
                color: 'white',
                flexShrink: 0,
              }}>
                I
              </div>
              <span style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 18,
                fontWeight: 500,
                color: '#1c1917',
                letterSpacing: '-0.3px',
              }}>
                IITBase
              </span>
            </Link>

            <p style={{
              fontSize: 14,
              color: '#78716c',
              lineHeight: 1.7,
              fontWeight: 300,
              maxWidth: 320,
              margin: '0 0 20px',
            }}>
              The professional network built exclusively for IIT graduates and the companies serious about hiring them.
            </p>

            <p style={{ fontSize: 13, color: '#a8a29e', fontWeight: 300 }}>
              Every job manually reviewed.<br />Every member IIT-verified.
            </p>
          </div>

          {/* Platform */}
          <div>
            <p style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#a8a29e',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginBottom: 20,
            }}>
              Platform
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { href: '/jobs',               label: 'Browse Jobs' },
                { href: '/share-opportunity',  label: 'Share Opportunity' },
                { href: '/signup?role=JOB_SEEKER', label: 'Join as Jobseeker' },
                { href: '/signup?role=RECRUITER',  label: 'Join as Recruiter' },
                { href: '/login',              label: 'Sign In' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} style={{
                    fontSize: 14,
                    color: '#78716c',
                    textDecoration: 'none',
                    fontWeight: 300,
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#1c1917')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#78716c')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#a8a29e',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginBottom: 20,
            }}>
              Company
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { href: '/about',    label: 'About Us' },
                { href: '/careers',  label: 'Careers' },
                { href: '/contact',  label: 'Contact' },
                { href: '/feedback', label: 'Feedback' },
                { href: '/feedback', label: 'Report a Bug' },
              ].map((link, i) => (
                <li key={i}>
                  <a href={link.href} style={{
                    fontSize: 14,
                    color: '#78716c',
                    textDecoration: 'none',
                    fontWeight: 300,
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#1c1917')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#78716c')}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          paddingTop: 24,
          borderTop: '1px solid #e8e5df',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <p style={{ fontSize: 13, color: '#a8a29e', fontWeight: 300 }}>
            © {currentYear} IITBase. All rights reserved.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {[
              { href: '/privacy', label: 'Privacy Policy' },
              { href: '/terms',   label: 'Terms of Service' },
            ].map(link => (
              <a key={link.href} href={link.href} style={{
                fontSize: 13,
                color: '#a8a29e',
                textDecoration: 'none',
                fontWeight: 300,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#78716c')}
              onMouseLeave={e => (e.currentTarget.style.color = '#a8a29e')}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}