import { LoginPage } from '@/app/components/pages/login-page';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export default async function Page() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect('/');
  }

  return <LoginPage />;
}
