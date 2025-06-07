import Link from 'next/link';
import Image from 'next/image';
import {
  Video,
  Clock,
  Subtitles,
  FileText,
  Star,
  ListTodo,
} from 'lucide-react';
import { SearchResult } from '@/lib/types';
import { formatDuration } from '@/lib/utils/format-time';

interface SearchResultItemProps {
  result: SearchResult;
}

const CONTENT_TYPE_ICONS = {
  video: <Video className="h-4 w-4" />,
  subtitle: <Subtitles className="h-4 w-4" />,
  summary: <FileText className="h-4 w-4" />,
  highlight: <Star className="h-4 w-4 text-yellow-500" />,
  takeaway: <ListTodo className="h-4 w-4" />,
} as const;

const CONTENT_TYPE_LABELS = {
  video: 'Video',
  subtitle: 'Subtitle',
  summary: 'Summary',
  highlight: 'Highlight',
  takeaway: 'Note',
} as const;

const CONTENT_TYPE_COLORS = {
  video: 'bg-blue-100 text-blue-700',
  subtitle: 'bg-purple-100 text-purple-700',
  summary: 'bg-green-100 text-green-700',
  highlight: 'bg-yellow-100 text-yellow-700',
  takeaway: 'bg-pink-100 text-pink-700',
} as const;

export function SearchResultItem({ result }: SearchResultItemProps) {
  // Navigate to specific timestamp in video
  const videoUrl =
    `/video/${result.video_id}` +
    (result.timestamp ? `?t=${Math.floor(result.timestamp)}` : '');

  // Render HTML content with highlights
  const renderHTML = (html: string | undefined) => {
    if (!html) return { __html: '' };
    return { __html: html };
  };

  const contentType = result.content_type || 'video';

  return (
    <Link href={videoUrl}>
      <div className="group flex gap-4 rounded-lg border p-4 transition-colors hover:bg-gray-50">
        {/* Thumbnail */}
        <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md">
          <Image
            src={result.thumbnail_url}
            alt={result.video_title}
            className="object-cover"
            fill
            sizes="128px"
          />
          {result.timestamp && (
            <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-xs text-white">
              {formatDuration(result.timestamp)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2 overflow-hidden">
          {/* Title and type label */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <h3
                className="text-base font-medium text-gray-900 line-clamp-1 group-hover:text-blue-600"
                dangerouslySetInnerHTML={renderHTML(result.video_title)}
              />
              <div className="flex items-center gap-2">
                {/* Type icon and label */}
                <div
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${CONTENT_TYPE_COLORS[contentType as keyof typeof CONTENT_TYPE_COLORS]}`}
                >
                  {
                    CONTENT_TYPE_ICONS[
                      contentType as keyof typeof CONTENT_TYPE_ICONS
                    ]
                  }
                  <span>
                    {
                      CONTENT_TYPE_LABELS[
                        contentType as keyof typeof CONTENT_TYPE_LABELS
                      ]
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content preview */}
          {result.content && (
            <div className="relative">
              <p
                className="text-sm text-gray-600 line-clamp-2"
                dangerouslySetInnerHTML={renderHTML(result.content)}
              />
              <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white to-transparent" />
            </div>
          )}

          {/* Additional info */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {contentType === 'subtitle' && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Subtitle Section
              </span>
            )}
            {contentType === 'summary' && (
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Video Summary
              </span>
            )}
            {contentType === 'takeaway' && (
              <span className="flex items-center gap-1">
                <ListTodo className="h-3 w-3" />
                Note Content
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
