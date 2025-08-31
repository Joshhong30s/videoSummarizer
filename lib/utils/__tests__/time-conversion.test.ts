import {
  secondsToMinutes,
  minutesToSeconds,
  formatTimeToMinutes,
  formatTimeToSeconds,
  formatSecondsToTime
} from '../time-conversion';

describe('time-conversion utilities', () => {
  describe('secondsToMinutes', () => {
    test('should convert seconds to minutes correctly', () => {
      expect(secondsToMinutes(60)).toBe(1);
      expect(secondsToMinutes(120)).toBe(2);
      expect(secondsToMinutes(90)).toBe(1); // 1.5分鐘向下取整
      expect(secondsToMinutes(0)).toBe(0);
      expect(secondsToMinutes(3661)).toBe(61); // 1小時1分1秒
    });
  });

  describe('minutesToSeconds', () => {
    test('should convert minutes to seconds correctly', () => {
      expect(minutesToSeconds(1)).toBe(60);
      expect(minutesToSeconds(2)).toBe(120);
      expect(minutesToSeconds(0.5)).toBe(30);
      expect(minutesToSeconds(0)).toBe(0);
    });
  });

  describe('formatTimeToMinutes', () => {
    test('should parse HH:MM:SS format correctly', () => {
      expect(formatTimeToMinutes('1:30:45')).toBe(90.75); // 1小時30分45秒 = 90.75分鐘
      expect(formatTimeToMinutes('0:05:30')).toBe(5.5);   // 5分30秒 = 5.5分鐘
      expect(formatTimeToMinutes('2:00:00')).toBe(120);   // 2小時 = 120分鐘
    });

    test('should parse MM:SS format correctly', () => {
      expect(formatTimeToMinutes('5:30')).toBe(5.5);   // 5分30秒 = 5.5分鐘
      expect(formatTimeToMinutes('10:15')).toBe(10.25); // 10分15秒 = 10.25分鐘
      expect(formatTimeToMinutes('0:45')).toBe(0.75);   // 45秒 = 0.75分鐘
    });

    test('should handle edge cases', () => {
      expect(formatTimeToMinutes('0:00:00')).toBe(0);
      expect(formatTimeToMinutes('0:00')).toBe(0);
      expect(formatTimeToMinutes('')).toBe(0);
    });
  });

  describe('formatTimeToSeconds', () => {
    test('should parse HH:MM:SS format correctly', () => {
      expect(formatTimeToSeconds('1:30:45')).toBe(5445); // 1小時30分45秒
      expect(formatTimeToSeconds('0:05:30')).toBe(330);  // 5分30秒
      expect(formatTimeToSeconds('2:00:00')).toBe(7200); // 2小時
    });

    test('should parse MM:SS format correctly', () => {
      expect(formatTimeToSeconds('5:30')).toBe(330);   // 5分30秒
      expect(formatTimeToSeconds('10:15')).toBe(615);  // 10分15秒
      expect(formatTimeToSeconds('0:45')).toBe(45);    // 45秒
    });

    test('should handle edge cases', () => {
      expect(formatTimeToSeconds('0:00:00')).toBe(0);
      expect(formatTimeToSeconds('0:00')).toBe(0);
      expect(formatTimeToSeconds('')).toBe(0);
    });
  });

  describe('formatSecondsToTime', () => {
    test('should format seconds to HH:MM:SS when hours > 0', () => {
      expect(formatSecondsToTime(3661)).toBe('01:01:01'); // 1小時1分1秒
      expect(formatSecondsToTime(7200)).toBe('02:00:00'); // 2小時
      expect(formatSecondsToTime(3600)).toBe('01:00:00'); // 1小時
    });

    test('should format seconds to MM:SS when hours = 0', () => {
      expect(formatSecondsToTime(90)).toBe('01:30');   // 1分30秒
      expect(formatSecondsToTime(330)).toBe('05:30');  // 5分30秒
      expect(formatSecondsToTime(45)).toBe('00:45');   // 45秒
      expect(formatSecondsToTime(0)).toBe('00:00');    // 0秒
    });

    test('should handle large numbers correctly', () => {
      expect(formatSecondsToTime(36000)).toBe('10:00:00'); // 10小時
      expect(formatSecondsToTime(90061)).toBe('25:01:01'); // 25小時1分1秒
    });
  });

  describe('round trip conversions', () => {
    test('should maintain consistency between formatTimeToSeconds and formatSecondsToTime', () => {
      const testCases = ['1:30:45', '0:05:30', '10:15'];
      
      testCases.forEach(timeStr => {
        const seconds = formatTimeToSeconds(timeStr);
        const backToTime = formatSecondsToTime(seconds);
        expect(formatTimeToSeconds(backToTime)).toBe(seconds);
      });
    });
  });
});