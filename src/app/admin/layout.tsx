import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Check if user is one of the authorized admins
  const userEmail = session?.user?.email?.toLowerCase();
  const isAdmin = 
    userEmail === 'niyateshaukkalyan@gmail.com' ||
    userEmail === 'sujeetgarud111@gmail.com' ||
    userEmail === 'niyateshaukh.entry@gmail.com' ||
    userEmail === 'dhavalemayur746@gmail.com';

  if (!session || !isAdmin) {
    redirect('/');
  }

  return <>{children}</>;
}