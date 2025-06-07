'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      setShow(window.scrollY > window.innerHeight * 0.2);
    };

    window.addEventListener('scroll', checkScroll, { passive: true });
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-6 right-6 z-50
        p-3 rounded-full 
        bg-blue-500/80 hover:bg-blue-600/80
        text-white shadow-lg
        backdrop-blur-sm
        transition-all duration-200
        transform ${
          show ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }
        sm:bottom-8 sm:right-8
      `}
      aria-label="回到頂部"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
