'use client';

import { Logo } from '@/app/components/ui/logo';
import { LoginButton } from '../auth/login-button';

export function AppHeader() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@500&display=swap"
        rel="stylesheet"
      />
      <header className="bg-white/70 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <span
              className="font-semibold"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              VideoSummarizer
            </span>
          </div>
          <LoginButton />
        </div>
      </header>
    </>
  );
}
