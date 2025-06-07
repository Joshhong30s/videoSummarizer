'use client';

import { useState } from 'react';
import { Download, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { IconButton } from '@/app/components/ui/icon-button';
import { Tooltip } from '@/app/components/ui/tooltip';
import {
  ObsidianClient,
  generateMarkdownContent,
  downloadMarkdown,
} from '@/lib/services/obsidian';

interface ObsidianExportProps {
  title: string;
  url: string;
  summary: string;
  highlights: Array<{ timestamp: number; content: string }>;
  notes: string;
  tags: string[];
}

export function ObsidianExport({
  title,
  url,
  summary,
  highlights,
  notes,
  tags,
}: ObsidianExportProps) {
  const [exporting, setExporting] = useState(false);

  const content = generateMarkdownContent({
    title,
    url,
    summary,
    highlights,
    notes,
    tags,
  });

  const handleDownload = () => {
    const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    downloadMarkdown(content, sanitizedTitle);
    toast.success('note downloaded successfully');
  };

  // 匯出到 Obsidian
  const handleExportToObsidian = async () => {
    const client = new ObsidianClient();
    setExporting(true);

    try {
      const isConnected = await client.checkConnection();
      if (!isConnected) {
        throw new Error('failed to connect Obsidian Local REST API');
      }

      await client.createNote({
        title,
        content,
        tags,
      });

      toast.success('note has exported to Obsidian');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(
        error instanceof Error ? error.message : 'failed to export note'
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Tooltip content="download note">
        <IconButton
          icon={Download}
          onClick={handleDownload}
          aria-label="download note"
        />
      </Tooltip>

      <Tooltip content="export to Obsidian">
        <IconButton
          icon={BookOpen}
          onClick={handleExportToObsidian}
          disabled={exporting}
          loading={exporting}
          aria-label="export to Obsidian"
        />
      </Tooltip>
    </div>
  );
}
