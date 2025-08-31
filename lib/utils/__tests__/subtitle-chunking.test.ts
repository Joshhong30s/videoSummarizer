import { chunkSubtitles, chunksToText } from '../subtitle-chunking';

interface SubtitleLine {
  start: number;
  end?: number;
  duration?: number;
  text: string;
}

describe('subtitle-chunking utilities', () => {
  describe('chunkSubtitles', () => {
    test('should handle empty or invalid input', () => {
      expect(chunkSubtitles([])).toEqual([]);
      expect(chunkSubtitles(null as any)).toEqual([]);
      expect(chunkSubtitles(undefined as any)).toEqual([]);
    });

    test('should create single chunk for short subtitles', () => {
      const subtitles: SubtitleLine[] = [
        { start: 0, end: 2, text: 'Hello' },
        { start: 2, end: 4, text: 'World' },
        { start: 4, end: 6, text: 'Test' }
      ];

      const chunks = chunkSubtitles(subtitles, 3600, 10000);
      
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toEqual(subtitles);
    });

    test('should split by duration when exceeding maxChunkDuration', () => {
      const subtitles: SubtitleLine[] = [
        { start: 0, end: 100, text: 'First part' },
        { start: 100, end: 200, text: 'Second part' },
        { start: 200, end: 300, text: 'Third part' },
        { start: 300, end: 400, text: 'Fourth part' }
      ];

      // 設定較小的 duration limit (150 秒)
      const chunks = chunkSubtitles(subtitles, 150, 10000);
      
      expect(chunks.length).toBeGreaterThan(1);
      // 檢查總的字幕數量保持一致
      const totalSubtitles = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      expect(totalSubtitles).toBe(4);
    });

    test('should split by character count when exceeding maxChunkChars', () => {
      const longText = 'A'.repeat(5000); // 5000 字符
      const subtitles: SubtitleLine[] = [
        { start: 0, end: 10, text: longText },
        { start: 10, end: 20, text: 'Short text' },
        { start: 20, end: 30, text: 'Another short text' }
      ];

      // 設定較小的字符限制 (4000 字符)
      const chunks = chunkSubtitles(subtitles, 3600, 4000);
      
      expect(chunks.length).toBeGreaterThan(1);
      // 第一個 chunk 應該只包含長文本
      expect(chunks[0]).toHaveLength(1);
      expect(chunks[0][0].text).toBe(longText);
    });

    test('should handle subtitles with duration property', () => {
      const subtitles: SubtitleLine[] = [
        { start: 0, duration: 100, text: 'First with duration' },
        { start: 100, duration: 100, text: 'Second with duration' },
        { start: 200, duration: 100, text: 'Third with duration' }
      ];

      const chunks = chunkSubtitles(subtitles, 150, 10000);
      
      // 檢查總的字幕數量保持一致
      const totalSubtitles = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      expect(totalSubtitles).toBe(3);
    });

    test('should handle mixed duration and end time properties', () => {
      const subtitles: SubtitleLine[] = [
        { start: 0, end: 50, text: 'With end time' },
        { start: 50, duration: 50, text: 'With duration' },
        { start: 100, end: 150, text: 'With end time again' }
      ];

      const chunks = chunkSubtitles(subtitles, 75, 10000);
      
      // 檢查總的字幕數量保持一致
      const totalSubtitles = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      expect(totalSubtitles).toBe(3);
    });

    test('should use default parameters correctly', () => {
      const subtitles: SubtitleLine[] = [
        { start: 0, end: 10, text: 'Test' }
      ];

      const chunksDefault = chunkSubtitles(subtitles);
      const chunksExplicit = chunkSubtitles(subtitles, 3600, 10000);
      
      expect(chunksDefault).toEqual(chunksExplicit);
    });

    test('should handle edge case with zero duration', () => {
      const subtitles: SubtitleLine[] = [
        { start: 0, end: 0, text: 'Zero duration' },
        { start: 0, duration: 0, text: 'Zero duration 2' },
        { start: 1, end: 2, text: 'Normal' }
      ];

      const chunks = chunkSubtitles(subtitles, 3600, 10000);
      
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toHaveLength(3);
    });

    test('should handle large numbers correctly', () => {
      const subtitles: SubtitleLine[] = [
        { start: 0, end: 5000, text: 'Very long subtitle' },
        { start: 5000, end: 10000, text: 'Another long subtitle' }
      ];

      const chunks = chunkSubtitles(subtitles, 6000, 10000);
      
      // 檢查總的字幕數量保持一致
      const totalSubtitles = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      expect(totalSubtitles).toBe(2);
    });
  });

  describe('chunksToText', () => {
    test('should convert chunks to text arrays', () => {
      const chunks: SubtitleLine[][] = [
        [
          { start: 0, end: 2, text: 'Hello' },
          { start: 2, end: 4, text: 'World' }
        ],
        [
          { start: 4, end: 6, text: 'Test' },
          { start: 6, end: 8, text: 'Case' }
        ]
      ];

      const textArray = chunksToText(chunks);
      
      expect(textArray).toHaveLength(2);
      expect(textArray[0]).toBe('Hello World');
      expect(textArray[1]).toBe('Test Case');
    });

    test('should handle empty chunks', () => {
      expect(chunksToText([])).toEqual([]);
      expect(chunksToText([[], []])).toEqual(['', '']);
    });

    test('should handle single line chunks', () => {
      const chunks: SubtitleLine[][] = [
        [{ start: 0, end: 2, text: 'Single line' }],
        [{ start: 2, end: 4, text: 'Another single' }]
      ];

      const textArray = chunksToText(chunks);
      
      expect(textArray).toEqual(['Single line', 'Another single']);
    });

    test('should handle chunks with empty text', () => {
      const chunks: SubtitleLine[][] = [
        [
          { start: 0, end: 2, text: '' },
          { start: 2, end: 4, text: 'World' }
        ],
        [
          { start: 4, end: 6, text: 'Test' },
          { start: 6, end: 8, text: '' }
        ]
      ];

      const textArray = chunksToText(chunks);
      
      expect(textArray[0]).toBe(' World');
      expect(textArray[1]).toBe('Test ');
    });

    test('should join multiple lines with spaces correctly', () => {
      const chunks: SubtitleLine[][] = [
        [
          { start: 0, end: 1, text: 'This' },
          { start: 1, end: 2, text: 'is' },
          { start: 2, end: 3, text: 'a' },
          { start: 3, end: 4, text: 'test' }
        ]
      ];

      const textArray = chunksToText(chunks);
      
      expect(textArray[0]).toBe('This is a test');
    });
  });

  describe('integration tests', () => {
    test('should work together correctly', () => {
      const subtitles: SubtitleLine[] = [
        { start: 0, end: 100, text: 'First long segment' },
        { start: 100, end: 200, text: 'Second long segment' },
        { start: 200, end: 300, text: 'Third segment' }
      ];

      const chunks = chunkSubtitles(subtitles, 150, 10000);
      const textArray = chunksToText(chunks);
      
      expect(chunks.length).toBe(textArray.length);
      
      // 驗證所有文本都被保留
      const allText = textArray.join(' ');
      expect(allText).toContain('First long segment');
      expect(allText).toContain('Second long segment');
      expect(allText).toContain('Third segment');
    });

    test('should preserve all subtitle content across chunks', () => {
      const subtitles: SubtitleLine[] = [
        { start: 0, end: 50, text: 'A'.repeat(2000) },
        { start: 50, end: 100, text: 'B'.repeat(2000) },
        { start: 100, end: 150, text: 'C'.repeat(2000) }
      ];

      const chunks = chunkSubtitles(subtitles, 3600, 3000); // 強制按字符分割
      const textArray = chunksToText(chunks);
      
      const totalOriginalChars = subtitles.reduce((sum, sub) => sum + sub.text.length, 0);
      const totalChunkChars = textArray.reduce((sum, text) => sum + text.length - (text.split(' ').length - 1), 0); // 減去空格
      
      expect(totalChunkChars).toBe(totalOriginalChars);
    });
  });
});