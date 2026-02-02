import { ASLogo } from '@/components/as-logo';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Handshake, Scale, Sparkles, MapPin, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getPlots } from '@/lib/actions';
import { generateMarketInsights } from '@/ai/flows/generate-market-insights-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

const aboutItems = [
    {
        icon: Handshake,
        title: "Trust & Transparency",
        description: "We believe in clear, honest communication. Every plot we list is thoroughly verified, ensuring you have complete peace of mind."
    },
    {
        icon: Sparkles,
        title: "Expert Guidance",
        description: "With years of experience in the real estate market, we provide expert advice, from Vastu analysis to future development potential."
    },
    {
        icon: Scale,
        title: "Integrity First",
        description: "Our business is built on a foundation of integrity. We are committed to ethical practices and building long-lasting relationships with our clients."
    }
];

export default async function Home() {
    const plots = await getPlots();
    let insights = null;
    let insightsError = null;

    try {
        if (plots.length > 0 && process.env.NEXT_PUBLIC_GEMINI_API_KEY_CONFIGURED === 'true') {
            const plotSummaries = plots.map(p => ({ areaName: p.areaName, villageName: p.villageName, plotFacing: p.plotFacing, plotSize: p.plotSize }));
            insights = await generateMarketInsights({ plots: plotSummaries });
        }
    } catch(e) {
        console.error("Failed to generate market insights:", e);
        insightsError = "Could not load AI market insights. The model may be busy or unavailable. Please check back later."
    }

  return (
    <div className="flex flex-col">
       <Header />
       <section className="relative w-full py-20 md:py-32 lg:py-40 bg-background">
         <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom dark:border-b dark:border-slate-100/5" style={{ maskImage: 'linear-gradient(to bottom, transparent, black, black, transparent)'}}></div>
        <div className="absolute inset-0 -z-10">
            <Image 
                src="https://placehold.co/1920x1080.png"
                alt="Modern house property"
                fill
                className="object-cover opacity-10"
                data-ai-hint="real estate"
                priority
            />
             <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        </div>

        <div className="container relative px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center">
            <ASLogo className="h-24 w-24" />
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none font-headline">
                Find Your Future Property
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Your trusted partner in real estate.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {insights && (
        <section className="py-12 md:py-24 bg-secondary/30">
            <div className="container px-4 md:px-6">
                 <div className="text-center space-y-4 mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter font-headline">AI-Powered Market Insights</h2>
                    <p className="max-w-3xl mx-auto text-muted-foreground">
                        We leverage AI to analyze our listings and provide you with exclusive market intelligence. Register to unlock detailed plot information.
                    </p>
                </div>
                 <div className="grid gap-8 md:grid-cols-3">
                    <Card className="p-6 text-center">
                        <CardContent className="flex flex-col items-center gap-4">
                            <div className="bg-primary/10 p-4 rounded-full">
                                <MapPin className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold font-headline">Hotspot Area</h3>
                            <p className="text-muted-foreground">{insights.hotspotArea}</p>
                        </CardContent>
                    </Card>
                    <Card className="p-6 text-center">
                        <CardContent className="flex flex-col items-center gap-4">
                            <div className="bg-primary/10 p-4 rounded-full">
                                <TrendingUp className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold font-headline">Trending Opportunity</h3>
                            <p className="text-muted-foreground">{insights.trendingOpportunity}</p>
                        </CardContent>
                    </Card>
                    <Card className="p-6 text-center">
                        <CardContent className="flex flex-col items-center gap-4">
                            <div className="bg-primary/10 p-4 rounded-full">
                                <DollarSign className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold font-headline">Investment Teaser</h3>
                            <p className="text-muted-foreground">{insights.investmentTeaser}</p>
                        </CardContent>
                    </Card>
                 </div>

                 <div className="text-center mt-12">
                     <Button asChild size="lg">
                         <Link href="/register">
                             Register for Exclusive Access <ArrowRight className="ml-2 h-4 w-4" />
                         </Link>
                     </Button>
                 </div>
            </div>
        </section>
      )}

      {insightsError && (
        <div className="container px-4 md:px-6 py-8">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Insights Unavailable</AlertTitle>
                <AlertDescription>{insightsError}</AlertDescription>
            </Alert>
        </div>
      )}

      <section className="py-12 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl font-bold tracking-tighter font-headline">Why Choose Us?</h2>
                <p className="max-w-3xl mx-auto text-muted-foreground">
                    At AS Trusted Consultancy, we're more than just real estate agents; we are your partners in building a secure future. We are dedicated to helping you find the perfect piece of land that meets your needs and exceeds your expectations.
                </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
                {aboutItems.map((item) => (
                    <Card key={item.title} className="text-center p-6">
                        <CardContent className="flex flex-col items-center gap-4">
                           <div className="bg-primary/10 p-4 rounded-full">
                             <item.icon className="h-8 w-8 text-primary" />
                           </div>
                           <h3 className="text-xl font-bold font-headline">{item.title}</h3>
                           <p className="text-muted-foreground">{item.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </section>
    </div>
  );
}
