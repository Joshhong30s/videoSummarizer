import type { Metadata } from 'next';

interface GenerateMetadataOptions {
  title?: string;
  description?: string;
  noindex?: boolean;
}

export function generateMetadata({
  title,
  description,
  noindex = false,
}: GenerateMetadataOptions): Metadata {
  const baseTitle = 'YT Summarizer';
  const finalTitle = title ? `${title} - ${baseTitle}` : baseTitle;

  return {
    title: finalTitle,
    description,
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      title: finalTitle,
      description,
      type: 'website',
      siteName: baseTitle,
    },
    twitter: {
      card: 'summary',
      title: finalTitle,
      description,
    },
  };
}

export function generateErrorMetadata(
  title = 'Error',
  description = 'An error occurred. Please try again later.'
): Metadata {
  return generateMetadata({
    title,
    description,
    noindex: true,
  });
}

export function generateNotFoundMetadata(
  title = 'Not Found',
  description = 'The page you are looking for could not be found.'
): Metadata {
  return generateMetadata({
    title,
    description,
    noindex: true,
  });
}
