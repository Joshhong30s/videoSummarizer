export interface ObsidianNote {
  title: string;
  content: string;
  folder?: string;
  tags?: string[];
}

export interface ObsidianConfig {
  endpoint: string; // Default: http://localhost:27123
  vault?: string; // Optional vault name
  folder?: string; // Optional folder path
}

export interface ObsidianService {
  createNote: (note: ObsidianNote) => Promise<Response>;
  checkConnection: () => Promise<boolean>;
}
