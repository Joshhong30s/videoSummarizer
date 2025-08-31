import { getVideoId, formatVideoDuration, getVideoThumbnail, getVideoInfo } from '../youtube';

// Mock fetch for getVideoInfo tests
global.fetch = jest.fn();

describe('youtube utilities', () => {
  describe('getVideoId', () => {
    test('should extract video ID from youtube.com URLs', () => {
      const testCases = [
        {
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          expected: 'dQw4w9WgXcQ'
        },
        {
          url: 'https://youtube.com/watch?v=dQw4w9WgXcQ&t=10s',
          expected: 'dQw4w9WgXcQ'
        },
        {
          url: 'https://m.youtube.com/watch?v=dQw4w9WgXcQ&feature=youtu.be',
          expected: 'dQw4w9WgXcQ'
        }
      ];

      testCases.forEach(({ url, expected }) => {
        expect(getVideoId(url)).toBe(expected);
      });
    });

    test('should extract video ID from youtu.be URLs', () => {
      const testCases = [
        {
          url: 'https://youtu.be/dQw4w9WgXcQ',
          expected: 'dQw4w9WgXcQ'
        },
        {
          url: 'https://youtu.be/dQw4w9WgXcQ?t=10',
          expected: 'dQw4w9WgXcQ'
        },
        {
          url: 'http://youtu.be/dQw4w9WgXcQ',
          expected: 'dQw4w9WgXcQ'
        }
      ];

      testCases.forEach(({ url, expected }) => {
        expect(getVideoId(url)).toBe(expected);
      });
    });

    test('should extract video ID from embed URLs', () => {
      const testCases = [
        {
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          expected: 'dQw4w9WgXcQ'
        },
        {
          url: 'https://youtube.com/embed/dQw4w9WgXcQ?start=10',
          expected: 'dQw4w9WgXcQ'
        }
      ];

      testCases.forEach(({ url, expected }) => {
        expect(getVideoId(url)).toBe(expected);
      });
    });

    test('should return null for invalid URLs', () => {
      const invalidUrls = [
        'https://vimeo.com/123456',
        'https://www.youtube.com/',
        'https://youtube.com/user/someuser',
        'not-a-url',
        '',
        'https://youtu.be/',
        'https://www.youtube.com/watch',
      ];

      invalidUrls.forEach(url => {
        expect(getVideoId(url)).toBeNull();
      });
    });

    test('should handle malformed URLs gracefully', () => {
      const malformedUrls = [
        'not a url',
        'http://',
        '://youtube.com',
        null as any,
        undefined as any,
        123 as any,
      ];

      malformedUrls.forEach(url => {
        expect(getVideoId(url)).toBeNull();
      });
    });
  });

  describe('formatVideoDuration', () => {
    test('should format duration with hours correctly', () => {
      expect(formatVideoDuration(3661)).toBe('1:01:01'); // 1小時1分1秒
      expect(formatVideoDuration(7200)).toBe('2:00:00'); // 2小時
      expect(formatVideoDuration(3600)).toBe('1:00:00'); // 1小時
      expect(formatVideoDuration(14400)).toBe('4:00:00'); // 4小時
    });

    test('should format duration without hours correctly', () => {
      expect(formatVideoDuration(90)).toBe('1:30');    // 1分30秒
      expect(formatVideoDuration(330)).toBe('5:30');   // 5分30秒
      expect(formatVideoDuration(45)).toBe('0:45');    // 45秒
      expect(formatVideoDuration(0)).toBe('0:00');     // 0秒
      expect(formatVideoDuration(600)).toBe('10:00');  // 10分鐘
    });

    test('should handle large durations correctly', () => {
      expect(formatVideoDuration(36000)).toBe('10:00:00'); // 10小時
      expect(formatVideoDuration(90061)).toBe('25:01:01'); // 25小時1分1秒
    });

    test('should handle edge cases', () => {
      expect(formatVideoDuration(3599)).toBe('59:59');     // 59分59秒
      expect(formatVideoDuration(59)).toBe('0:59');        // 59秒
      expect(formatVideoDuration(1)).toBe('0:01');         // 1秒
    });
  });

  describe('getVideoThumbnail', () => {
    test('should generate correct thumbnail URL', () => {
      const videoId = 'dQw4w9WgXcQ';
      const expectedUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      
      expect(getVideoThumbnail(videoId)).toBe(expectedUrl);
    });

    test('should handle different video IDs', () => {
      const testCases = [
        { id: 'abc123', expected: 'https://img.youtube.com/vi/abc123/maxresdefault.jpg' },
        { id: '123-ABC_xyz', expected: 'https://img.youtube.com/vi/123-ABC_xyz/maxresdefault.jpg' },
        { id: 'a', expected: 'https://img.youtube.com/vi/a/maxresdefault.jpg' },
      ];

      testCases.forEach(({ id, expected }) => {
        expect(getVideoThumbnail(id)).toBe(expected);
      });
    });
  });

  describe('getVideoInfo', () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    const originalError = console.error;

    beforeEach(() => {
      mockFetch.mockClear();
      // Mock console.error to avoid noise in test output
      console.error = jest.fn();
    });

    afterEach(() => {
      console.error = originalError;
    });

    test('should fetch video info successfully', async () => {
      const mockVideoInfo = {
        title: 'Test Video',
        description: 'Test Description',
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
        duration: 180
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockVideoInfo,
      } as Response);

      const result = await getVideoInfo('dQw4w9WgXcQ');
      
      expect(result).toEqual(mockVideoInfo);
      expect(mockFetch).toHaveBeenCalledWith('/api/videos/info?videoId=dQw4w9WgXcQ');
    });

    test('should return null when API request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const result = await getVideoInfo('invalid-id');
      
      expect(result).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith('/api/videos/info?videoId=invalid-id');
    });

    test('should return null when fetch throws an error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getVideoInfo('dQw4w9WgXcQ');
      
      expect(result).toBeNull();
    });

  });

  describe('integration tests', () => {
    test('should work with extracted video ID and thumbnail generation', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const videoId = getVideoId(url);
      
      expect(videoId).toBe('dQw4w9WgXcQ');
      expect(getVideoThumbnail(videoId!)).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg');
    });

    test('should handle complete workflow', () => {
      const testUrls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://youtube.com/embed/dQw4w9WgXcQ'
      ];

      testUrls.forEach(url => {
        const videoId = getVideoId(url);
        expect(videoId).toBe('dQw4w9WgXcQ');
        
        if (videoId) {
          const thumbnail = getVideoThumbnail(videoId);
          expect(thumbnail).toContain('dQw4w9WgXcQ');
        }
      });
    });
  });
});