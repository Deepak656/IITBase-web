export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Recruiter pages render without the public Navbar and Footer.
  // They have their own navigation inside each page.
  return <>{children}</>;
}