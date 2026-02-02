'use client';

import { useState } from 'react';
import Image from 'next/image';
import { visualizeFutureDevelopment } from '@/ai/flows/visualize-future-development-flow';
import type { Plot } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Eye, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function FutureVisualizer({ plot }: { plot: Plot }) {
  const [futureImageUrl, setFutureImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isApiKeyConfigured = process.env.NEXT_PUBLIC_GEMINI_API_KEY_CONFIGURED === 'true';

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setFutureImageUrl(null);
    try {
      // Fetch the image and convert to a Data URL
      const response = await fetch(plot.imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const blob = await response.blob();

      const reader = new FileReader();
      const dataUrlPromise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const currentImageUrlDataUri = await dataUrlPromise;

      const result = await visualizeFutureDevelopment({
        currentImageUrl: currentImageUrlDataUri,
        areaName: plot.areaName,
      });
 setFutureImageUrl(result.futureImageUrl);
    } catch (e) {
      console.error(e);
      let errorMessage = 'Failed to generate future view. The model may have encountered an error. Please try again later.';
       if (e instanceof Error && (e.message.includes('503') || e.message.includes('overloaded'))) {
           errorMessage = 'The AI model is currently busy. Please wait a moment and try again.'
       }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
            <Eye className="h-6 w-6 mr-3 text-primary" />
            Future Development Visualizer
        </CardTitle>
        <CardDescription>
            Use AI to get a glimpse of this area's potential future growth.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
            <div className="w-full flex flex-col items-center justify-center bg-muted/50 rounded-lg p-8">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="mt-4 text-muted-foreground font-medium">Generating future vision...</p>
                <p className="text-sm text-muted-foreground">This can take up to a minute.</p>
            </div>
        )}

        {!isLoading && error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Generation Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isLoading && futureImageUrl && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-4">
                <div className="space-y-2 text-center">
                    <p className="text-sm font-semibold">Current View</p>
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden border shadow-sm">
                        <Image src={plot.imageUrl} alt="Current view of the plot" fill className="object-cover" />
                    </div>
                </div>
                 <ArrowRight className="h-6 w-6 text-muted-foreground hidden sm:block" />
                 <div className="space-y-2 text-center">
                    <p className="text-sm font-semibold">AI-Generated Future View</p>
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden border-2 border-primary shadow-sm">
                        <Image src={futureImageUrl} alt="AI-generated future view" fill className="object-cover" />
                    </div>
                </div>
            </div>
             <p className="text-xs text-muted-foreground text-center pt-2">Note: This is an AI-generated artistic representation of potential development and not a guaranteed plan.</p>
          </div>
        )}
        
        {!isApiKeyConfigured && (
            <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Feature Disabled</AlertTitle>
                <AlertDescription>
                    The Future Visualizer requires a Gemini API key to be configured by the developer.
                </AlertDescription>
            </Alert>
        )}

      </CardContent>
      <CardContent>
         <Button onClick={handleGenerate} disabled={isLoading || !isApiKeyConfigured} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {futureImageUrl ? 'Regenerate Future View' : 'Visualize The Future'}
        </Button>
      </CardContent>
    </Card>
  );
}
