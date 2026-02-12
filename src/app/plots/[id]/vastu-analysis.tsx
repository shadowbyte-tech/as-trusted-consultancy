'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Plot } from '@/lib/definitions';
import { CheckCircle2, Shield, ThumbsDown, ThumbsUp, XCircle, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type AnalyzeVastuOutput = {
  vastuRating: 'Excellent' | 'Good' | 'Average' | 'Poor';
  analysisSummary: string;
  positivePoints: string[];
  negativePoints: string[];
};

const ratingConfig = {
    Excellent: { icon: ThumbsUp, color: 'text-green-600', bgColor: 'bg-green-100' },
    Good: { icon: ThumbsUp, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
    Average: { icon: Shield, color: 'text-amber-600', bgColor: 'bg-amber-100' },
    Poor: { icon: ThumbsDown, color: 'text-red-600', bgColor: 'bg-red-100' },
};

export default function VastuAnalysis({ plot }: { plot: Plot }) {
    const [analysis, setAnalysis] = useState<AnalyzeVastuOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // AI features temporarily disabled
        setError('AI features are temporarily disabled for build stability. They will be re-enabled in a future update.');
        setIsLoading(false);
    }, [plot]);

    if (isLoading) {
        return (
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
        );
    }

    if (error) {
         return (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-xl font-bold font-headline">
                        <Shield className="h-6 w-6 mr-3 text-destructive" />
                        Vastu Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center p-4 rounded-md border-2 border-dashed border-destructive/50 bg-destructive/10 text-destructive">
                        <AlertTriangle className="h-8 w-8 mb-2" />
                        <p className="font-semibold text-center">{error}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    if (!analysis) return null;

    const config = ratingConfig[analysis.vastuRating];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center text-xl font-bold font-headline">
                    <div className={`mr-3 rounded-full p-1.5 ${config.bgColor}`}>
                        <config.icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    Vastu Analysis: <span className={`ml-2 ${config.color}`}>{analysis.vastuRating}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">{analysis.analysisSummary}</p>
                
                {analysis.positivePoints.length > 0 && (
                    <div>
                        <h4 className="font-semibold flex items-center mb-2">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                            Positive Aspects
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                            {analysis.positivePoints.map((point, i) => <li key={i}>{point}</li>)}
                        </ul>
                    </div>
                )}

                {analysis.negativePoints.length > 0 && (
                     <div>
                        <h4 className="font-semibold flex items-center mb-2">
                             <XCircle className="h-4 w-4 mr-2 text-red-500" />
                            Points of Caution
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                            {analysis.negativePoints.map((point, i) => <li key={i}>{point}</li>)}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
