import { CategoriesProvider } from '@/lib/contexts/categories-context';
import { VideosProvider } from '@/lib/contexts/videos-context';
import { MainLayout } from './components/layout';
import { Providers } from './providers';
import './globals.css';

export const metadata = {
  title: 'YouTube Summarizer',
  description: 'Summarize YouTube videos with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link focus-ring">
          Skip to main content
        </a>
        <Providers>
          <CategoriesProvider>
            <VideosProvider>
              <MainLayout>
                <main id="main-content" tabIndex={-1}>
                  {children}
                </main>
              </MainLayout>
            </VideosProvider>
          </CategoriesProvider>
        </Providers>
      </body>
    </html>
  );
}
