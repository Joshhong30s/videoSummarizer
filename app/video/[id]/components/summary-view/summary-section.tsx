import ReactMarkdown from 'react-markdown';

interface SummarySectionProps {
  title: string;
  content: string;
  lang: 'en' | 'zh';
}

export function SummarySection({ title, content, lang }: SummarySectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <div
        className={`prose prose-gray max-w-none ${
          lang === 'zh' ? 'text-lg leading-relaxed' : ''
        }`}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
