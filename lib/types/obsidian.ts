export interface ObsidianNote {
  title: string;
  content: string;
  folder?: string;
  tags?: string[];
}

export interface ObsidianConfig {
  endpoint: string;
  vault?: string;
  folder?: string;
}

export interface ObsidianService {
  createNote: (note: ObsidianNote) => Promise<Response>;
  checkConnection: () => Promise<boolean>;
}
