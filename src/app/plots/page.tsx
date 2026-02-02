import { getPlots } from '@/lib/actions';
import PlotList from '@/components/plot-list';
import UserAuthGuard from '@/components/user-auth-guard';
import { Header } from '@/components/header';

export default async function PlotsPage() {
  const plots = await getPlots();

  return (
    <UserAuthGuard>
      <Header />
      <div className="container py-6 sm:py-12">
          <PlotList plots={plots} />
      </div>
    </UserAuthGuard>
  );
}
