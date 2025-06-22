'use client';

import { ErrorPage } from '@/app/components/pages/error-page';
import { generateErrorMetadata } from '@/lib/metadata';
import { createAppError } from '@/lib/types/error';


export const metadata = generateErrorMetadata();

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const appError = createAppError(
    error.message || 'An unexpected error occurred',
    {
      digest: error.digest,
      code: 'GLOBAL_ERROR',
      status: 500,
    }
  );

  return <ErrorPage error={appError} reset={reset} />;
}
