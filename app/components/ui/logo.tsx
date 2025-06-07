'use client';

export function Logo() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="3"
        width="16"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />

      <rect
        x="6"
        y="5"
        width="12"
        height="7"
        rx="1"
        fill="currentColor"
        opacity="0.1"
        stroke="currentColor"
        strokeWidth="1"
      />
      <polygon points="9,7 9,11 13,9" fill="currentColor" />

      <rect x="6" y="14" width="8" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="6" y="16.5" width="6" height="1" rx="0.5" fill="currentColor" />
      <rect x="6" y="18.5" width="7" height="1" rx="0.5" fill="currentColor" />

      <circle
        cx="18"
        cy="16"
        r="2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="3,2"
      />
      <circle cx="18" cy="16" r="0.5" fill="currentColor" />
    </svg>
  );
}
