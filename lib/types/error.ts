export interface AppError extends Error {
  digest?: string;
  code?: string;
  status?: number;
  context?: Record<string, unknown>;
}

export type ErrorWithDigest = Error & { digest?: string };

export function isNotFoundError(error: Error): boolean {
  return (
    error?.message === 'NOT_FOUND' ||
    error?.message?.toLowerCase().includes('not found')
  );
}

export function createAppError(
  message: string,
  options: {
    code?: string;
    status?: number;
    digest?: string;
    context?: Record<string, unknown>;
  } = {}
): AppError {
  const error = new Error(message) as AppError;
  error.code = options.code;
  error.status = options.status;
  error.digest = options.digest;
  error.context = options.context;
  return error;
}
