'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { setToken } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { getToken } from '@/lib/auth';

import StepIntentEmail from './components/StepIntentEmail';
import StepOtpPassword from './components/StepOtpPassword';
import StepWelcome from './components/StepWelcome';
import JobSeekerOnboardingForm from './components/JobSeekerOnboardingForm';
import RecruiterOnboardingForm from './components/RecruiterOnboardingForm';
import StepSuccess from './components/StepSuccess';

type SignupStep =
  | 'INTENT_EMAIL'
  | 'OTP_PASSWORD'
  | 'WELCOME'
  | 'PROFILE'
  | 'SUCCESS';

type Role = 'JOB_SEEKER' | 'RECRUITER';

export default function SignupClient() {
  const router = useRouter();
  const { refreshAuth } = useAuth();

  const [step, setStep] = useState<SignupStep>('INTENT_EMAIL');
  const [role, setRoleState] = useState<Role>('JOB_SEEKER');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
    useEffect(() => {
    const token = getToken();
    const role = getRole();

    if (token && role) {
        if (role === 'JOB_SEEKER') router.replace('/jobs');
        else if (role === 'RECRUITER') router.replace('/submit-job');
        else router.replace('/');
    }
    }, []);

  /* -------- Handlers -------- */

  const handleEmailSubmitted = async (email: string, role: Role) => {
    await api.auth.requestSignupOtp(email);
    setEmail(email);
    setRoleState(role);
    setStep('OTP_PASSWORD');
  };

  const handleOtpVerified = async (data: {
    token: string;
    role: Role;
    userId: number;
  }) => {
    setToken(data.token);
    setRole(data.role);
    refreshAuth();
    setUserId(data.userId);
    setStep('WELCOME');
  };

  const handleProfileCompleted = async () => {
    setStep('SUCCESS');
  };

  const handleFinish = () => {
    if (role === 'JOB_SEEKER') router.push('/jobs');
    else router.push('/submit-job');
  };

  /* -------- Render -------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {step === 'INTENT_EMAIL' && (
          <StepIntentEmail onSubmit={handleEmailSubmitted} />
        )}

        {step === 'OTP_PASSWORD' && (
          <StepOtpPassword
            email={email}
            role={role}
            onVerified={handleOtpVerified}
          />
        )}

        {step === 'WELCOME' && (
        <StepWelcome
            role={role}
            onContinue={() => setStep('PROFILE')}
            onSkip={() => setStep('SUCCESS')}
        />
        )}

        {step === 'PROFILE' && role === 'JOB_SEEKER' && userId && (
          <JobSeekerOnboardingForm
            userId={userId}
            onComplete={handleProfileCompleted}
          />
        )}

        {step === 'PROFILE' && role === 'RECRUITER' && userId && (
          <RecruiterOnboardingForm
            userId={userId}
            onComplete={handleProfileCompleted}
          />
        )}

        {step === 'SUCCESS' && (
          <StepSuccess role={role} onFinish={handleFinish} />
        )}
      </div>
    </div>
  );
}
