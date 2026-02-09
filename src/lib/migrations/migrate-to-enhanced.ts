'use server';

import { readPlots, writePlots } from '../database';
import type { Plot } from '../definitions';
import type { EnhancedPlot } from '../enhanced-definitions';

/**
 * Migrate existing plots to enhanced schema
 * This is backward compatible - existing data is preserved
 * @returns Promise with migration results
 */
export async function migratePlotsToEnhanced(): Promise<{
  success: boolean;
  migratedCount: number;
  errors?: string[];
}> {
  try {
    const plots = await readPlots();
    const errors: string[] = [];
    
    const enhancedPlots: EnhancedPlot[] = plots.map((plot: Plot) => {
      try {
        return {
          ...plot,
          // Set default values for new fields
          status: 'Available' as const,
          priceNegotiable: true,
          priceVisibility: 'inquiry' as const,
          images: plot.imageUrl ? [plot.imageUrl] : [],
          thumbnailUrl: plot.imageUrl,
          imageHint: plot.imageHint || 'legacy upload',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          viewCount: 0,
        } as EnhancedPlot;
      } catch (error) {
        errors.push(`Failed to migrate plot ${plot.id}: ${error}`);
        return null as any;
      }
    }).filter((p: any) => p !== null);
    
    await writePlots(enhancedPlots as any);
    
    return {
      success: errors.length === 0,
      migratedCount: enhancedPlots.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    return {
      success: false,
      migratedCount: 0,
      errors: [`Migration failed: ${error}`],
    };
  }
}

/**
 * Check if migration is needed
 * @returns Promise with migration status
 */
export async function checkMigrationStatus(): Promise<{
  needsMigration: boolean;
  plotCount: number;
  enhancedCount: number;
}> {
  const plots = await readPlots();
  const enhancedCount = plots.filter((p: any) => 
    'status' in p && 'images' in p
  ).length;
  
  return {
    needsMigration: enhancedCount < plots.length,
    plotCount: plots.length,
    enhancedCount,
  };
}
