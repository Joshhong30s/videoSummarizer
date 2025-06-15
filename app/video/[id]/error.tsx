'use client';

import { ErrorPage } from '@/app/components/pages/error-page';
import { generateErrorMetadata } from '@/lib/metadata';
import {
  ErrorWithDigest,
  createAppError,
  isNotFoundError,
} from '@/lib/types/error';

export const metadata = generateErrorMetadata(
  'Video Error',
  'An error occurred while loading the video. Please try again later.'
);

export default function VideoError({
  error,
  reset,
}: {
  error: ErrorWithDigest;
  reset: () => void;
}) {
  const customError = createAppError(
    isNotFoundError(error)
      ? 'This video could not be found. It may have been deleted or made private.'
      : error.message || 'An error occurred while loading the video.',
    {
      code: isNotFoundError(error) ? 'VIDEO_NOT_FOUND' : 'VIDEO_ERROR',
      status: isNotFoundError(error) ? 404 : 500,
      digest: error.digest,
    }
  );

  return (
    <div className="pt-16" suppressHydrationWarning>
      <ErrorPage error={customError} reset={reset} />
    </div>
  );
}
