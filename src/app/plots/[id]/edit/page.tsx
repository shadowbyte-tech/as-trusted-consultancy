import AuthGuard from '@/components/auth-guard';
import PlotForm from '@/components/plot-form';
import { getPlotById } from '@/lib/actions';
import { notFound } from 'next/navigation';

export default async function EditPlotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plot = await getPlotById(id);

  if (!plot) {
    notFound();
  }

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto p-4">
        <div className="space-y-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Edit Plot Details</h1>
          <p className="text-muted-foreground">
            Update the information for Plot No. {plot.plotNumber}. Click "Save Changes" when you're done.
          </p>
        </div>
        <PlotForm plot={plot} />
      </div>
    </AuthGuard>
  );
}
