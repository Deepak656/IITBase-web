'use client';

import { useState } from 'react';
import { useRouter, useSearchParams  } from 'next/navigation';
import { api } from '../../lib/api';
import { setToken, setRole } from '../../lib/auth';
import { useAuth } from '../../context/AuthContext';

export default function SignupClient() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [formData, setFormData] = useState({
    password: '',
    role: 'JOB_SEEKER' as 'JOB_SEEKER' | 'RECRUITER',
    college: '',
    graduationYear: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const searchParams = useSearchParams();
  const intent = searchParams.get('intent');
  const next = searchParams.get('next');

  const handleRequestOtp = async () => {
    if (!email) return;
    setError('');
    setLoading(true);

    try {
      await api.auth.requestSignupOtp(email);
      setStep('otp');
      startResendCooldown();
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await api.auth.verifySignupOtp(otpValue, {
        email,
        password: formData.password,
        role: formData.role,
        college: formData.college || undefined,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : undefined,
      });

      setToken(response.token);
      setRole(response.role);
      refreshAuth();
      if (response.role === 'ADMIN') {
        router.push(next || '/admin/jobs');
      }  else if (response.role === 'JOB_SEEKER') {
        router.push(next || '/jobs');
      } else if (response.role === 'RECRUITER' ) {
        router.push(next || '/submit-job');
      } else {
        router.push(next || '/profile')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setError('');
    setLoading(true);

    try {
      await api.auth.resendOtp(email, 'SIGNUP');
      startResendCooldown();
      setOtp(['', '', '', '', '', '']);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
    if (e.key === 'Enter' && index === 5 && otp[5] && formData.password.length >= 8) {
      handleVerifyOtp();
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg mb-4">
            <span className="text-white font-bold text-3xl">I</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Join IITBase
          </h1>
          <p className="text-slate-600 text-base">
            Access curated opportunities for top-tier talent
          </p>
          {intent && (
            <div className="mb-4 p-3 text-sm bg-blue-50 border border-blue-200 rounded-md text-blue-700">
              {intent === 'submit-job' && (
                <>Create an account to <strong>submit a job</strong> on IITBase.</>
              )}
              {intent === 'apply' && (
                <>Join <strong>IITBase</strong> to apply for this job.</>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Email */}
          {step === 'email' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRequestOtp()}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 text-base"
                  placeholder="you@example.com"
                />
              </div>

              <button
                onClick={handleRequestOtp}
                disabled={loading || !email}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30"
              >
                {loading ? 'Sending OTP...' : 'Continue with Email'}
              </button>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Verify Your Email
                </h3>
                <p className="text-slate-600 text-sm">
                  We've sent a 6-digit code to<br />
                  <span className="font-semibold text-slate-900">{email}</span>
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    />
                  ))}
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Create Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                      placeholder="At least 8 characters"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      I am a
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
                    >
                      <option value="JOB_SEEKER">Job Seeker</option>
                      <option value="RECRUITER">Recruiter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      College/University <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                      placeholder="e.g., IIT Bombay"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Graduation Year <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.graduationYear}
                      onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                      min="1950"
                      max="2030"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                      placeholder="e.g., 2024"
                    />
                  </div>
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/30"
                >
                  {loading ? 'Verifying...' : 'Create Account'}
                </button>

                <div className="text-center space-y-3">
                  <button
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 
                      ? `Resend OTP in ${resendCooldown}s` 
                      : 'Resend OTP'}
                  </button>
                  
                  <button
                    onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); }}
                    className="block w-full text-sm text-slate-600 hover:text-slate-900"
                  >
                    Change email address
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-slate-600 text-sm">
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign in
              </a>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          By creating an account, you agree to our{' '}
          <a href="/terms" className="underline">Terms of Service</a> and{' '}
          <a href="/privacy" className="underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}