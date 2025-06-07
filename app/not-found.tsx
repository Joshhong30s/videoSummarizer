import { NotFoundPage } from '@/app/components/pages/not-found-page';
import { generateNotFoundMetadata } from '@/lib/metadata';

export const metadata = generateNotFoundMetadata();

export default function NotFound() {
  return <NotFoundPage />;
}
