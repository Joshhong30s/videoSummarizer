'use client';

import { useEffect, useRef } from 'react';

interface ScreenReaderAnnouncementProps {
  message: string;
  politeness?: 'polite' | 'assertive';
}

export function ScreenReaderAnnouncement({ 
  message, 
  politeness = 'polite' 
}: ScreenReaderAnnouncementProps) {
  const announcementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (announcementRef.current && message) {
      announcementRef.current.textContent = message;
      
      // Clear the message after announcement
      const timer = setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div
      ref={announcementRef}
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    />
  );
}

// Global announcer for imperative use
let announcer: ((message: string, politeness?: 'polite' | 'assertive') => void) | null = null;

export function setGlobalAnnouncer(announce: (message: string, politeness?: 'polite' | 'assertive') => void) {
  announcer = announce;
}

export function announce(message: string, politeness: 'polite' | 'assertive' = 'polite') {
  if (announcer) {
    announcer(message, politeness);
  }
}