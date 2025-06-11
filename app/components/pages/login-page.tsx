'use client';

import { signIn } from 'next-auth/react';
import { SkeletonCard, SkeletonSearch } from '../ui/skeleton-card';
import { Logo } from '../ui/logo';

export function LoginPage() {
  const handleGuestLogin = () => signIn('credentials', { callbackUrl: '/' });

  return (
    <>
      <div
        className="fixed inset-0 z-[-1] bg-gradient-to-br 
                  from-gray-100 via-gray-300 to-gray-500
                   dark:from-gray-700 dark:via-gray-800 dark:to-gray-900
                   animate-gradient-flow bg-[length:200%_200%]"
      />
      <div className="fixed inset-0 z-0 bg-white/10 dark:bg-black/20 backdrop-blur-sm" />
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4">
        <div className="relative z-10 w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xl animate-fade-in">
          <div className="flex items-center justify-center mb-8">
            {' '}
            <Logo className="h-8 w-8 text-gray-900" />
            <span className="ml-3 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {' '}
              VideoSummarizer
            </span>
          </div>

          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            {' '}
            Choose how you'd like to continue
          </p>

          <div className="space-y-4">
            {' '}
            <button
              onClick={() => signIn('google')}
              className="
                w-full py-3 px-4 border border-gray-300 dark:border-slate-600 rounded-lg 
                font-medium text-gray-700 dark:text-gray-200 
                bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                transition-colors duration-150 flex items-center justify-center space-x-2
              "
            >
              <span>Sign in with Google</span>
            </button>
            <button
              onClick={handleGuestLogin}
              className="
                w-full py-3 px-4 border border-gray-300 dark:border-slate-600 rounded-lg
                font-medium text-gray-700 dark:text-gray-200 
                bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                transition-colors duration-150
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
