import { NotFoundPage } from '@/app/components/pages/not-found-page';
import { generateNotFoundMetadata } from '@/lib/metadata';

export const metadata = generateNotFoundMetadata(
  'Video Not Found',
  'The requested video could not be found. It might have been deleted or made private.'
);

export default function VideoNotFound() {
  return (
    <div className="pt-16" suppressHydrationWarning>
      <NotFoundPage
        title="Video not found"
        message="The video you're looking for could not be found. It might have been deleted or made private."
        actionText="Browse videos"
      />
    </div>
  );
}
