'use client';

import { signIn } from 'next-auth/react';
import { SkeletonCard, SkeletonSearch } from '../ui/skeleton-card';
import { Logo } from '../ui/logo';

export function LoginPage() {
  const handleGuestLogin = () => signIn('credentials', { callbackUrl: '/' });

  return (
    <>
      <div className="fixed inset-0 bg-gray-100 z-[-2]" />

      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-auto p-8">
          <div className="max-w-2xl mx-auto">
            <SkeletonSearch />
          </div>

          <div
            className="
              mt-24
              grid gap-8
              grid-cols-[repeat(auto-fill,minmax(200px,1fr))]
            "
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className={`
       ${i % 2 === 0 ? 'bg-gray-300' : 'bg-gray-200'}
       rounded-lg
       transition-opacity
       ${i < 8 ? 'opacity-60' : 'opacity-30'}
     `}
              >
                <SkeletonCard />
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 w-full max-w-lg p-6 bg-white rounded-2xl border border-gray-300 shadow-md animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <Logo className="h-8 w-8 text-gray-900" />
            <span className="ml-2 text-2xl font-semibold text-gray-900">
              VideoSummarizer
            </span>
          </div>

          <p className="text-center text-gray-600 mb-6">
            Choose how you'd like to continue
          </p>

          <div className="space-y-6">
            <button
              onClick={() => signIn('google')}
              className="
                w-full py-3 border border-gray-700 rounded-xl
                font-medium text-gray-900 bg-white hover:bg-gray-50
                transition
              "
            >
              Sign in with Google
            </button>
            <button
              onClick={handleGuestLogin}
              className="
                w-full py-3 border border-gray-300 rounded-xl
                font-medium text-gray-800 bg-white hover:bg-gray-50
                transition
              "
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
