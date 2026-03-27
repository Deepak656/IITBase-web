'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../../lib/authApi';
import { setToken } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';

import StepIntentEmail from './components/StepIntentEmail';
import StepOtpPassword from './components/StepOtpPassword';
import StepSuccess from './components/StepSuccess';

type SignupStep = 'INTENT_EMAIL' | 'OTP_PASSWORD' | 'SUCCESS';
type Role = 'JOB_SEEKER' | 'RECRUITER';

const STEP_INDEX: Record<SignupStep, number> = {
  INTENT_EMAIL: 0,
  OTP_PASSWORD: 1,
  SUCCESS: 2,
};

export default function SignupClient() {
  const router = useRouter();
  const { user, loading, refreshAuth } = useAuth();

  const [step, setStep] = useState<SignupStep>('INTENT_EMAIL');
  const [role, setRole] = useState<Role>('JOB_SEEKER');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (loading || step !== 'INTENT_EMAIL' || !user) return;
    if (user.role === 'JOB_SEEKER') router.replace('/profile');
    else if (user.role === 'RECRUITER') router.replace('/recruiter/dashboard');
    else router.replace('/');
  }, [user, loading, step]);

  const handleEmailSubmitted = async (submittedEmail: string, selectedRole: Role) => {
    await authApi.auth.requestSignupOtp(submittedEmail);
    setEmail(submittedEmail);
    setRole(selectedRole);
    setStep('OTP_PASSWORD');
  };

  const handleOtpVerified = async (data: { token: string; role: Role; userId: number }) => {
    setToken(data.token);
    await refreshAuth();
    setRole(data.role);
    setStep('SUCCESS');
  };

  const handleFinish = () => {
    router.push(role === 'RECRUITER' ? '/recruiter/onboarding' : '/profile');
  };

  const currentDotIndex = STEP_INDEX[step];

  const leftPanelContent = {
    INTENT_EMAIL: {
      eyebrow: 'Trusted by IITians',
      heading: 'The network built\nfor India\'s best.',
      sub: 'IITBase connects top-tier engineering talent with companies that value pedigree, depth, and ambition.',
    },
    OTP_PASSWORD: {
      eyebrow: 'Almost there',
      heading: 'Verify your email\nand set a password.',
      sub: 'Your account is seconds away. Enter the code we sent and choose a strong password.',
    },
    SUCCESS: {
      eyebrow: 'You\'re in',
      heading: 'Account created\nsuccessfully.',
      sub: 'You now have access to IITBase. Start building your profile or explore open roles.',
    },
  }[step];

  return (
    <div className="auth-page">
      <div className="auth-bg-grid" />
      <div className="auth-glow-top-right" />
      <div className="auth-glow-bottom-left" />

      {/* ── Left panel ─────────────────────────────────────── */}
      <div className="auth-left">
        <a href="/" className="auth-logo">
          <div className="auth-logo-mark">I</div>
          <span className="auth-logo-text">IITBase</span>
        </a>

        <div>
          <div className="auth-left-eyebrow">{leftPanelContent.eyebrow}</div>
          <h2 className="auth-left-heading" style={{ whiteSpace: 'pre-line' }}>
            {leftPanelContent.heading}
          </h2>
          <p className="auth-left-sub">{leftPanelContent.sub}</p>
        </div>

        <div className="auth-trust-list">
          {[
            { icon: '🎓', title: 'IIT-verified network', sub: 'Only IIT graduates and serious recruiters' },
            { icon: '🔒', title: 'Private by default', sub: 'Your profile is only shown to relevant recruiters' },
            { icon: '⚡', title: 'Direct to decision makers', sub: 'No middlemen, no ghost applications' },
          ].map(p => (
            <div key={p.title} className="auth-trust-pill">
              <div className="auth-trust-pill-icon">{p.icon}</div>
              <div className="auth-trust-pill-body">
                <strong>{p.title}</strong>
                <span>{p.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────── */}
      <div className="auth-right">
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div className="auth-card auth-card-enter" key={step}>

            {/* Step dots */}
            <div className="auth-step-dots">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={`auth-dot${i === currentDotIndex ? ' active' : i < currentDotIndex ? ' done' : ''}`}
                />
              ))}
            </div>

            {step === 'INTENT_EMAIL' && (
              <StepIntentEmail onSubmit={handleEmailSubmitted} />
            )}
            {step === 'OTP_PASSWORD' && (
              <StepOtpPassword
                email={email}
                role={role}
                onVerified={handleOtpVerified}
                onBack={() => setStep('INTENT_EMAIL')}
              />
            )}
            {step === 'SUCCESS' && (
              <StepSuccess role={role} onFinish={handleFinish} />
            )}
          </div>

          <p className="auth-footer-note">
            By signing up you agree to our{' '}
            <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}