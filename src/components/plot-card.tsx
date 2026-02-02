import type { Plot } from '@/lib/definitions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { Badge } from './ui/badge';

type PlotCardProps = {
  plot: Plot;
};

export default function PlotCard({ plot }: PlotCardProps) {
  return (
    <Link href={`/plots/${plot.id}`} className="group">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary">
        <CardHeader className="p-0">
          <div className="relative h-60 w-full">
            <Image
              src={plot.imageUrl}
              alt={`Plot ${plot.plotNumber} in ${plot.villageName}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={plot.imageHint}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <Badge variant="secondary" className="mb-2">{plot.plotFacing} Facing</Badge>
          <CardTitle className="text-xl font-headline">Plot No: {plot.plotNumber}</CardTitle>
          <div className="flex items-center text-muted-foreground mt-2">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{plot.areaName}, {plot.villageName}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 bg-secondary/30 flex justify-between items-center">
          <span className="text-sm font-semibold text-primary">{plot.plotSize}</span>
          <div className="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
