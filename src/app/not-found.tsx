import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-6xl font-bold text-muted-foreground mb-4">404</CardTitle>
            <h1 className="text-2xl font-bold">Page Not Found</h1>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Sorry, we couldn't find the page you're looking for.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button asChild variant="outline">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
              <Button asChild>
                <Link href="/plots">
                  View Plots
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}