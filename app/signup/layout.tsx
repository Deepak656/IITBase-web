import '../styles/auth-theme.css';

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Renders children directly — no Navbar, no Footer
  // The root layout's <main> wrapper still applies flex-1
  return <>{children}</>;
}