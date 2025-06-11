import { HomePage } from '@/app/components/pages/home-page';
// import { Chatbot } from '@/app/components/chat/chatbot'; // Chatbot 移至 HomePage 內部控制
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from './api/auth/[...nextauth]/options';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <>
      <HomePage />
    </>
  );
}
