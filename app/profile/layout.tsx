import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Profile — IITBase',
  description: 'Build your IITBase profile to get discovered by top companies hiring IIT alumni.',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}