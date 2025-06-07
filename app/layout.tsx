import { CategoriesProvider } from '@/lib/contexts/categories-context';
import { VideosProvider } from '@/lib/contexts/videos-context';
import { MainLayout } from './components/layout';
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
    <html lang="zh-TW">
      <body>
        <CategoriesProvider>
          <VideosProvider>
            <MainLayout>{children}</MainLayout>
          </VideosProvider>
        </CategoriesProvider>
      </body>
    </html>
  );
}
