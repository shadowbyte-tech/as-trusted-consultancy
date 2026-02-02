
import AuthGuard from '@/components/auth-guard';
import DashboardSidebar from './sidebar';
import MobileSidebar from './mobile-sidebar';
import { Header } from '@/components/header';
import { getNewRegistrationCount } from '@/lib/actions';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const newRegistrationCount = await getNewRegistrationCount();

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <DashboardSidebar newRegistrationCount={newRegistrationCount} />
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 overflow-x-hidden bg-muted/40 p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
