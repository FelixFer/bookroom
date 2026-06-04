export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Background — light mode */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat dark:hidden"
        style={{ backgroundImage: "url('/auth-day.png')" }}
      />
      {/* Background — dark mode */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 hidden bg-cover bg-center bg-no-repeat dark:block"
        style={{ backgroundImage: "url('/auth-night.png')" }}
      />
      {/* Tint overlay — softens contrast behind the card */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-white/20 dark:bg-black/30" />

      {children}
    </>
  );
}
