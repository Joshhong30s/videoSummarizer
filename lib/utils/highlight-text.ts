import * as React from 'react';

const HIGHLIGHT_CLASS = 'bg-yellow-200 dark:bg-yellow-900';

export function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text;

  try {
    const escapedQuery = escapeRegExp(query);
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));

    if (parts.length === 1) return text;

    return React.createElement(
      React.Fragment,
      null,
      parts.map((part: string, i: number) => {
        const isMatch = part.toLowerCase() === query.toLowerCase();
        return isMatch
          ? React.createElement(
              'mark',
              { key: i, className: HIGHLIGHT_CLASS },
              part
            )
          : part;
      })
    );
  } catch (error) {
    console.error('Error highlighting text:', error);
    return text;
  }
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
