'use client';

import { useState } from 'react';
import type { Plot } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Building, GraduationCap, Hospital, Loader2, Search, ShoppingCart, Sparkles } from 'lucide-react';
import { getNearbyAmenities, type Amenities } from '@/ai/flows/get-nearby-amenities-flow';

export default function NearbyAmenities({ plot }: { plot: Plot }) {
  const [amenities, setAmenities] = useState<Amenities | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isApiKeyConfigured = process.env.NEXT_PUBLIC_GEMINI_API_KEY_CONFIGURED === 'true';

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setAmenities(null);
    try {
      const result = await getNearbyAmenities({
        location: `${plot.areaName}, ${plot.villageName}`,
      });
      setAmenities(result);
    } catch (e) {
      console.error(e);
      let errorMessage = 'Failed to find amenities. The model may have encountered an error. Please try again later.';
       if (e instanceof Error && (e.message.includes('503') || e.message.includes('overloaded'))) {
           errorMessage = 'The AI model is currently busy. Please wait a moment and try again.'
       }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const amenityIcons = {
    schools: GraduationCap,
    hospitals: Hospital,
    markets: ShoppingCart,
    transport: Building,
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
            <Search className="h-6 w-6 mr-3 text-primary" />
            What's Nearby?
        </CardTitle>
        <CardDescription>
            Use AI to discover schools, hospitals, and markets near this plot.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
            <div className="w-full flex flex-col items-center justify-center bg-muted/50 rounded-lg p-8">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="mt-4 text-muted-foreground font-medium">Searching for amenities...</p>
            </div>
        )}

        {!isLoading && error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Search Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isLoading && amenities && (
          <div className="space-y-4">
            {Object.entries(amenities).map(([category, items]) => {
              if (items.length === 0) return null;
              const Icon = amenityIcons[category as keyof typeof amenityIcons] || Building;
              return (
                <div key={category}>
                  <h4 className="font-semibold flex items-center mb-2 capitalize">
                    <Icon className="h-4 w-4 mr-2 text-primary" />
                    {category}
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                    {items.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
        
        {!amenities && !isLoading && !error && (
             <Button onClick={handleGenerate} disabled={isLoading || !isApiKeyConfigured} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Find Nearby Amenities
            </Button>
        )}

        {amenities && !isLoading && !error && (
            <Button onClick={handleGenerate} disabled={isLoading || !isApiKeyConfigured} variant="outline" className="w-full mt-4">
                <Sparkles className="mr-2 h-4 w-4" />
                Regenerate
            </Button>
        )}
        
        {!isApiKeyConfigured && (
            <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Feature Disabled</AlertTitle>
                <AlertDescription>
                    The "What's Nearby?" feature requires a Gemini API key to be configured by the developer.
                </AlertDescription>
            </Alert>
        )}

      </CardContent>
    </Card>
  );
}
