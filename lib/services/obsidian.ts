import {
  ObsidianNote,
  ObsidianConfig,
  ObsidianService,
} from '@/lib/types/obsidian';
import { formatTime } from '@/lib/utils/format-time';

const DEFAULT_CONFIG: ObsidianConfig = {
  endpoint: 'http://localhost:27123',
  folder: 'YouTube Notes',
};

export class ObsidianClient implements ObsidianService {
  private config: ObsidianConfig;

  constructor(config: Partial<ObsidianConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.endpoint}/status`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async createNote(note: ObsidianNote): Promise<Response> {
    const response = await fetch(`${this.config.endpoint}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...note,
        folder: note.folder || this.config.folder,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create note in Obsidian');
    }

    return response;
  }
}

export function generateMarkdownContent({
  title,
  url,
  summary,
  highlights = [],
  notes = '',
  tags = [],
}: {
  title: string;
  url: string;
  summary: string;
  highlights?: Array<{ timestamp: number; content: string }>;
  notes?: string;
  tags?: string[];
}): string {
  const frontmatter = [
    '---',
    `video_title: "${title}"`,
    `video_url: "${url}"`,
    `created_at: "${new Date().toISOString().split('T')[0]}"`,
    `tags: ${JSON.stringify(tags)}`,
    '---\n',
  ].join('\n');

  const highlightsSection =
    highlights.length > 0
      ? [
          '## 重點標記',
          ...highlights.map(
            h => `- 🕐 ${formatTime(h.timestamp)} - ${h.content}`
          ),
          '\n',
        ].join('\n')
      : '';

  const notesSection = notes ? ['## 筆記', notes, '\n'].join('\n') : '';

  const summarySection = ['## 摘要', summary, '\n'].join('\n');

  const relatedSection = ['## 相關連結', ...tags.map(tag => `#${tag}`)].join(
    '\n'
  );

  return [
    frontmatter,
    summarySection,
    highlightsSection,
    notesSection,
    relatedSection,
  ].join('\n');
}

// 用於下載 markdown 文件的輔助函數
export function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
