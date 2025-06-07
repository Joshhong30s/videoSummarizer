'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import type { AppError } from '@/lib/types';

interface ErrorPageProps {
  error: AppError;
  reset?: () => void;
}

export function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error:', {
      message: error.message,
      code: error.code,
      status: error.status,
      digest: error.digest,
      context: error.context,
    });
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Error image */}
        <div className="w-48 h-48 mx-auto mb-8">
          <svg
            viewBox="0 0 240 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Screen with error icon */}
            <circle cx="120" cy="120" r="116" fill="#F3F4F6" />
            <rect x="60" y="70" width="120" height="90" rx="8" fill="#E5E7EB" />
            <rect x="64" y="74" width="112" height="82" rx="6" fill="white" />

            <circle cx="96" cy="110" r="4" fill="#6B7280" />
            <circle cx="144" cy="110" r="4" fill="#6B7280" />
            <path
              d="M96 130C96 130 108 126 120 126C132 126 144 130 144 130"
              stroke="#6B7280"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M80 170L100 190"
              stroke="#DC2626"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M100 170L80 190"
              stroke="#DC2626"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M140 175C140 175 150 180 160 175"
              stroke="#DC2626"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M130 185C130 185 145 192 160 185"
              stroke="#DC2626"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Error message */}
        <div className="space-y-2 mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            {error.status === 404 ? 'Not Found' : 'Something went wrong'}
          </h1>
          <p className="text-gray-500">
            {error.message ||
              'An unexpected error occurred. Please try again later.'}
          </p>
          {error.code && process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-gray-400">Error code: {error.code}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go back home
          </Link>
          {reset && (
            <button
              onClick={reset}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try again
            </button>
          )}
        </div>

        {/* Error details (development only) */}
        {process.env.NODE_ENV === 'development' &&
          (error.digest || error.context) && (
            <div className="mt-8 text-left">
              <details className="text-sm text-gray-500">
                <summary className="cursor-pointer hover:text-gray-700">
                  View error details
                </summary>
                <pre className="mt-2 p-4 bg-gray-50 rounded-lg overflow-x-auto">
                  <code>
                    {JSON.stringify(
                      {
                        digest: error.digest,
                        context: error.context,
                      },
                      null,
                      2
                    )}
                  </code>
                </pre>
              </details>
            </div>
          )}
      </div>
    </div>
  );
}
