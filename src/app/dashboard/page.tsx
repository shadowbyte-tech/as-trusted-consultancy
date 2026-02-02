
import { getPlots } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { FileUp, Pencil, Home, Users, MoreVertical, MapPin, Square } from 'lucide-react';
import type { Plot, PlotFacing } from '@/lib/definitions';
import DeletePlotButton from '@/components/delete-plot-button';
import Image from 'next/image';
import { ChartContainer, ChartTooltipContent, ChartTooltip, BarChart, Bar, XAxis, YAxis } from '@/components/ui/chart';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const chartConfig = {
  count: {
    label: 'Plots',
    color: 'hsl(var(--chart-1))',
  },
} satisfies import('@/components/ui/chart').ChartConfig;


export default async function DashboardPage() {
  const plots = await getPlots();
  const totalPlots = plots.length;

  const getFacingCounts = (plots: Plot[]) => {
    const counts = new Map<PlotFacing, number>();
    const facings: PlotFacing[] = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'];
    
    facings.forEach(facing => counts.set(facing, 0));

    plots.forEach(plot => {
        counts.set(plot.plotFacing, (counts.get(plot.plotFacing) || 0) + 1);
    });

    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
  };

  const facingData = getFacingCounts(plots);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">
            Owner Dashboard
            </h1>
            <p className="text-muted-foreground">
            Welcome back, here's an overview of your listings.
            </p>
        </div>
         <Button asChild className="hidden sm:inline-flex">
            <Link href="/upload">
              <FileUp className="mr-2 h-4 w-4" />
              Upload New Plot
            </Link>
          </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plots</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlots}</div>
            <p className="text-xs text-muted-foreground">
              Currently listed on the platform
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              (Excluding owner)
            </p>
          </CardContent>
        </Card>

         <Card className="sm:col-span-2 lg:col-span-4">
            <CardHeader>
                <CardTitle>Plot Distribution by Facing</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] w-full p-2">
                <ChartContainer config={chartConfig} className="w-full h-full">
                    <BarChart accessibilityLayer data={facingData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} angle={-45} textAnchor="end" height={50} interval={0} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Current Listings</CardTitle>
            <CardDescription className="mt-1">
              Manage your existing plot listings.
            </CardDescription>
        </CardHeader>
        <CardContent>
          {plots.length > 0 ? (
            <>
            {/* Mobile View */}
            <div className="grid gap-4 sm:hidden">
                {plots.map((plot: Plot) => (
                    <Card key={plot.id}>
                        <CardHeader className="flex flex-row items-start gap-4 p-4">
                             <Image
                                src={plot.imageUrl}
                                alt={`Plot ${plot.plotNumber}`}
                                width={80}
                                height={60}
                                className="rounded-md object-cover aspect-[4/3]"
                                data-ai-hint={plot.imageHint}
                                loading="lazy"
                            />
                            <div className="flex-1">
                                <CardTitle>{`Plot No. ${plot.plotNumber}`}</CardTitle>
                                <div className="text-sm text-muted-foreground mt-1">
                                    <p className='flex items-center'><MapPin className="mr-2 h-3 w-3" /> {`${plot.areaName}, ${plot.villageName}`}</p>
                                    <p className='flex items-center mt-1'><Square className="mr-2 h-3 w-3" /> {plot.plotSize}</p>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href={`/plots/${plot.id}/edit`}>Edit</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                         <div className="w-full">
                                            <DeletePlotButton plotId={plot.id} trigger="menuitem" />
                                        </div>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            {/* Desktop View */}
            <Table className="hidden sm:table">
                <TableHeader>
                <TableRow>
                    <TableHead className="hidden sm:table-cell">Image</TableHead>
                    <TableHead>Plot No.</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="hidden md:table-cell">Facing</TableHead>
                    <TableHead className="hidden lg:table-cell">Size</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {plots.map((plot: Plot) => (
                    <TableRow key={plot.id}>
                    <TableCell className="hidden sm:table-cell">
                        <Image
                            src={plot.imageUrl}
                            alt={`Plot ${plot.plotNumber}`}
                            width={64}
                            height={48}
                            className="rounded-md object-cover"
                            data-ai-hint={plot.imageHint}
                            loading="lazy"
                        />
                    </TableCell>
                    <TableCell className="font-medium">{plot.plotNumber}</TableCell>
                    <TableCell>{`${plot.areaName}, ${plot.villageName}`}</TableCell>
                    <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{plot.plotFacing}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{plot.plotSize}</TableCell>
                    <TableCell className="text-right space-x-2">
                        <Button asChild variant="outline" size="icon">
                        <Link href={`/plots/${plot.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Link>
                        </Button>
                        <DeletePlotButton plotId={plot.id} />
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Home className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Plots Found</h3>
                <p className="mt-1 text-sm text-muted-foreground">Get started by uploading your first plot.</p>
                <Button asChild className="mt-6">
                    <Link href="/upload">
                        <FileUp className="mr-2 h-4 w-4" />
                        Upload New Plot
                    </Link>
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
