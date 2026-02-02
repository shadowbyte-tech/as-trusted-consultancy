'use client';

import { useState } from 'react';
import type { Plot, PlotFacing } from '@/lib/definitions';
import PlotCard from './plot-card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Compass } from 'lucide-react';

const plotFacings: (PlotFacing | 'All')[] = ['All', 'North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'];

export default function PlotList({ plots }: { plots: Plot[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [facing, setFacing] = useState<PlotFacing | 'All'>('All');

  const filteredPlots = plots.filter((plot) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      plot.areaName.toLowerCase().includes(term) ||
      plot.villageName.toLowerCase().includes(term) ||
      plot.plotNumber.toLowerCase().includes(term);
    const matchesFacing = facing === 'All' || plot.plotFacing === facing;

    return matchesSearch && matchesFacing;
  });

  return (
    <div>
      <div className="mb-8 space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter text-center font-headline">
            Available Plots
          </h2>
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                type="text"
                placeholder="Search by location or plot no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                />
            </div>
            <div className="relative">
                 <Select value={facing} onValueChange={(value) => setFacing(value as PlotFacing | 'All')}>
                    <SelectTrigger className="w-full md:w-[200px]">
                        <Compass className="h-4 w-4 text-muted-foreground mr-2" />
                        <SelectValue placeholder="Filter by facing" />
                    </SelectTrigger>
                    <SelectContent>
                        {plotFacings.map((f) => (
                        <SelectItem key={f} value={f}>
                            {f === 'All' ? 'All Facings' : f}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
      </div>
      
      {filteredPlots.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlots.map((plot) => (
            <PlotCard key={plot.id} plot={plot} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-10">
          No plots match your criteria. Please try different filters.
        </p>
      )}
    </div>
  );
}
