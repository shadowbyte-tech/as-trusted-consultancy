import { getPlotById } from '@/lib/actions';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Square, Compass, FileText, Pencil, Shield, Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import AuthButtonWrapper from './auth-button-wrapper';
import VastuAnalysis from './vastu-analysis';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import SitePlanGenerator from './site-plan-generator';
import NearbyAmenities from './nearby-amenities';
import FutureVisualizer from './future-visualizer';

const ContactForm = dynamic(() => import('@/components/contact-form'), { 
  loading: () => <Skeleton className="h-[460px] w-full" />
});

export default async function PlotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plot = await getPlotById(id);

  if (!plot) {
    notFound();
  }

  const plotDetails = [
    { icon: FileText, label: "Plot Number", value: plot.plotNumber },
    { icon: MapPin, label: "Location", value: `${plot.areaName}, ${plot.villageName}` },
    { icon: Square, label: "Plot Size", value: plot.plotSize },
    { icon: Compass, label: "Facing", value: plot.plotFacing },
  ]

  const VastuAnalysisSkeleton = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-bold font-headline">
          <Shield className="h-6 w-6 mr-3 text-primary/50" />
          <span className='text-primary/50'>Vastu Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
        </div>
        <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
    </Card>
  )

  const AmenitiesSkeleton = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
            <Search className="h-6 w-6 mr-3 text-primary/50" />
             <span className='text-primary/50'>What's Nearby?</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )

  const FutureVisualizerSkeleton = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Eye className="h-6 w-6 mr-3 text-primary/50" />
          <span className="text-primary/50">Future Development Visualizer</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )


  return (
    <div className="container mx-auto max-w-5xl py-6 sm:py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-8">
          <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
            <Image
              src={plot.imageUrl}
              alt={`Plot ${plot.plotNumber}`}
              fill
              className="object-cover"
              data-ai-hint={plot.imageHint}
              priority
            />
          </div>
          {plot.description && (
             <Card>
                <CardHeader>
                  <CardTitle>Property Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{plot.description}</p>
                </CardContent>
             </Card>
           )}
           <SitePlanGenerator plot={plot} />
           <Suspense fallback={<VastuAnalysisSkeleton />}>
             <VastuAnalysis plot={plot} />
           </Suspense>
            <Suspense fallback={<FutureVisualizerSkeleton />}>
             <FutureVisualizer plot={plot} />
           </Suspense>
        </div>

        <div className="flex flex-col gap-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="secondary" className="mb-2">For Sale</Badge>
                    <CardTitle className="mt-2 text-3xl font-bold font-headline">
                      Plot Details
                    </CardTitle>
                  </div>
                  <AuthButtonWrapper>
                    <Button asChild variant="outline" size="icon">
                      <Link href={`/plots/${plot.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit Plot</span>
                      </Link>
                    </Button>
                  </AuthButtonWrapper>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {plotDetails.map((detail, index) => (
                  <li key={index} className="flex items-center">
                    <detail.icon className="h-5 w-5 mr-4 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{detail.label}</p>
                      <p className="font-semibold">{detail.value}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
           <Suspense fallback={<AmenitiesSkeleton />}>
             <NearbyAmenities plot={plot} />
           </Suspense>
          <ContactForm plotNumber={plot.plotNumber} />
        </div>
      </div>
    </div>
  );
}
