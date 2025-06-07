'use client';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="relative">
        <main className="relative min-h-screen w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
