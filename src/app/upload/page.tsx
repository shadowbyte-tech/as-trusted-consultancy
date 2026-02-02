
import AuthGuard from '@/components/auth-guard';
import PlotForm from '@/components/plot-form';

export default function UploadPage() {
  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto p-4">
        <div className="space-y-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Upload New Plot</h1>
          <p className="text-muted-foreground">
            Fill in the details below to add a new plot to the listing. All fields are required.
          </p>
        </div>
        <PlotForm />
      </div>
    </AuthGuard>
  );
}
