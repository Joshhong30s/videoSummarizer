'use client';

import { useState, useEffect } from 'react';
import { Logo } from '@/app/components/ui/logo';
import { LoginButton } from '../auth/login-button';
import { Button } from '../ui/button';
import { Menu, X, Home, FolderOpen, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ThemeToggle } from '../ui/theme-toggle';
import { usePathname } from 'next/navigation';

export function AppHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/categories', label: 'Categories', icon: FolderOpen },
    { href: 'https://github.com/Joshhong30s/videoSummarizer', label: 'Docs', icon: BookOpen, external: true },
  ];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap"
        rel="stylesheet"
      />
      
      <header
        className={cn(
          'sticky top-0 z-40 transition-all duration-300',
          isScrolled
            ? 'glass-dark shadow-lg'
            : 'bg-background/70 backdrop-blur-sm border-b border-border'
        )}
      >
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Logo />
                <span
                  className="font-semibold text-lg hidden sm:block gradient-text"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  VideoSummarizer
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                if (item.external) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        'text-muted-foreground hover:text-foreground hover:bg-accent'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </a>
                  );
                }
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'text-foreground bg-accent'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Profile / Login */}
              <div className="hidden sm:block">
                <LoginButton />
              </div>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle menu</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border overflow-hidden"
            >
              <nav className="container mx-auto px-4 py-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  if (item.external) {
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          'text-muted-foreground hover:text-foreground hover:bg-accent'
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </a>
                    );
                  }
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'text-foreground bg-accent'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
                
                <div className="pt-4 border-t border-border">
                  <div className="sm:hidden">
                    <LoginButton />
                  </div>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}