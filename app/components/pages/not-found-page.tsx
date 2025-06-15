'use client';

import Link from 'next/link';

interface NotFoundPageProps {
  title?: string;
  message?: string;
  actionText?: string;
  actionHref?: string;
}

export function NotFoundPage({
  title = 'Page not found',
  message = 'The page you&apos;re looking for doesn&apos;t exist or has been moved.',
  actionText = 'Go back home',
  actionHref = '/',
}: NotFoundPageProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="w-48 h-48 mx-auto mb-8">
          <svg
            viewBox="0 0 240 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="120" cy="120" r="116" fill="#F3F4F6" />
            <rect x="60" y="70" width="120" height="90" rx="8" fill="#E5E7EB" />
            <rect x="64" y="74" width="112" height="82" rx="6" fill="white" />

            <circle
              cx="105"
              cy="115"
              r="20"
              stroke="#6B7280"
              strokeWidth="4"
              fill="none"
            />
            <path
              d="M120 130L135 145"
              stroke="#6B7280"
              strokeWidth="4"
              strokeLinecap="round"
            />

            <path
              d="M160 90C160 90 165 85 170 90"
              stroke="#9CA3AF"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M165 95L165 100"
              stroke="#9CA3AF"
              strokeWidth="4"
              strokeLinecap="round"
            />

            <path
              d="M80 160C80 160 85 155 90 160"
              stroke="#9CA3AF"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M85 165L85 170"
              stroke="#9CA3AF"
              strokeWidth="4"
              strokeLinecap="round"
            />

            <path
              d="M150 170C150 170 155 165 160 170"
              stroke="#9CA3AF"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M155 175L155 180"
              stroke="#9CA3AF"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500 mb-8">{message}</p>

        <Link
          href={actionHref}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {actionText}
        </Link>
      </div>
    </div>
  );
}
