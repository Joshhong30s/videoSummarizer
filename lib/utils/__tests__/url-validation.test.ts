import { isValidYoutubeUrl, extractVideoId, YOUTUBE_DOMAINS } from '../url-validation';

describe('url-validation utilities', () => {
  describe('YOUTUBE_DOMAINS', () => {
    test('should contain expected YouTube domains', () => {
      expect(YOUTUBE_DOMAINS).toContain('youtube.com');
      expect(YOUTUBE_DOMAINS).toContain('youtu.be');
      expect(YOUTUBE_DOMAINS).toContain('www.youtube.com');
      expect(YOUTUBE_DOMAINS).toContain('m.youtube.com');
    });
  });

  describe('isValidYoutubeUrl', () => {
    test('should return true for valid YouTube URLs', () => {
      const validUrls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
        'http://youtube.com/watch?v=dQw4w9WgXcQ',
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
        'https://youtube.com/v/dQw4w9WgXcQ',
      ];

      validUrls.forEach(url => {
        expect(isValidYoutubeUrl(url)).toBe(true);
      });
    });

    test('should return false for invalid URLs', () => {
      const invalidUrls = [
        'https://vimeo.com/123456',
        'https://facebook.com/video',
        'https://example.com',
        'not-a-url',
        'https://youtube.fake.com/watch?v=123',
        'https://notyoutube.com/watch?v=123',
        '',
        'ftp://youtube.com/watch?v=123',
      ];

      invalidUrls.forEach(url => {
        expect(isValidYoutubeUrl(url)).toBe(false);
      });
    });

    test('should handle malformed URLs gracefully', () => {
      const malformedUrls = [
        'not a url',
        'http://',
        '://youtube.com',
        'https://youtube',
        null as any,
        undefined as any,
        123 as any,
      ];

      malformedUrls.forEach(url => {
        expect(isValidYoutubeUrl(url)).toBe(false);
      });
    });
  });

  describe('extractVideoId', () => {
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
        expect(extractVideoId(url)).toBe(expected);
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
        expect(extractVideoId(url)).toBe(expected);
      });
    });

    test('should return null for URLs without video ID', () => {
      const urlsWithoutId = [
        'https://www.youtube.com/',
        'https://youtube.com/user/someuser',
        'https://youtu.be/',
        'https://www.youtube.com/watch',
        'https://www.youtube.com/watch?list=123',
      ];

      urlsWithoutId.forEach(url => {
        expect(extractVideoId(url)).toBeNull();
      });
    });

    test('should return null for non-YouTube URLs', () => {
      const nonYouTubeUrls = [
        'https://vimeo.com/123456',
        'https://example.com/watch?v=123',
        'https://facebook.com/video',
      ];

      nonYouTubeUrls.forEach(url => {
        expect(extractVideoId(url)).toBeNull();
      });
    });

    test('should handle malformed URLs gracefully', () => {
      const malformedUrls = [
        'not a url',
        'http://',
        '://youtube.com',
        '',
        null as any,
        undefined as any,
        123 as any,
      ];

      malformedUrls.forEach(url => {
        expect(extractVideoId(url)).toBeNull();
      });
    });

    test('should handle edge cases for video IDs', () => {
      // 測試不同長度的 video ID
      const testCases = [
        {
          url: 'https://youtube.com/watch?v=a',
          expected: 'a'
        },
        {
          url: 'https://youtube.com/watch?v=abcdefghijk',
          expected: 'abcdefghijk'
        },
        {
          url: 'https://youtu.be/123-ABC_xyz',
          expected: '123-ABC_xyz'
        }
      ];

      testCases.forEach(({ url, expected }) => {
        expect(extractVideoId(url)).toBe(expected);
      });
    });
  });

  describe('integration tests', () => {
    test('should work together for valid YouTube URLs', () => {
      const testUrls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://m.youtube.com/watch?v=dQw4w9WgXcQ'
      ];

      testUrls.forEach(url => {
        expect(isValidYoutubeUrl(url)).toBe(true);
        expect(extractVideoId(url)).toBe('dQw4w9WgXcQ');
      });
    });

    test('should handle invalid URLs consistently', () => {
      const invalidUrls = [
        'https://vimeo.com/123456',
        'not a url',
        ''
      ];

      invalidUrls.forEach(url => {
        expect(isValidYoutubeUrl(url)).toBe(false);
        expect(extractVideoId(url)).toBeNull();
      });
    });
  });
});