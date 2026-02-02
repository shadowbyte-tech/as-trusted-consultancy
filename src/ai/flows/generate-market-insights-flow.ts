'use server';
/**
 * @fileOverview An AI flow to analyze the entire plot database and generate high-level market insights.
 *
 * - generateMarketInsights - A function that handles the market analysis.
 * - GenerateMarketInsightsInput - The input type for the generateMarketInsights function.
 * - MarketInsightsOutput - The return type for the generateMarketInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PlotSummarySchema = z.object({
  areaName: z.string(),
  villageName: z.string(),
  plotFacing: z.string(),
  plotSize: z.string(),
});

const GenerateMarketInsightsInputSchema = z.object({
  plots: z.array(PlotSummarySchema).describe("A list of summaries for all available plots."),
});
export type GenerateMarketInsightsInput = z.infer<typeof GenerateMarketInsightsInputSchema>;

const MarketInsightsOutputSchema = z.object({
  hotspotArea: z.string().describe("A compelling sentence identifying a key area with a high concentration of listings, framed as an opportunity."),
  trendingOpportunity: z.string().describe("An insight about a common or trending plot feature (e.g., a specific facing or size) that is in high demand."),
  investmentTeaser: z.string().describe("A forward-looking statement hinting at the investment potential of the properties, based on the data, without making specific promises."),
});
export type MarketInsightsOutput = z.infer<typeof MarketInsightsOutputSchema>;

export async function generateMarketInsights(
  input: GenerateMarketInsightsInput
): Promise<MarketInsightsOutput> {
  return generateMarketInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMarketInsightsPrompt',
  input: { schema: GenerateMarketInsightsInputSchema },
  output: { schema: MarketInsightsOutputSchema },
  prompt: `You are a savvy real estate market analyst for a consultancy in India.
Your goal is to generate exciting, high-level "teaser" insights based on a list of available plots.
These insights will be displayed on the homepage to attract potential buyers and encourage them to register for more details.
Do NOT mention specific plot numbers. Frame everything as a market opportunity.

Analyze the following list of plots:
{{#each plots}}
- Location: {{this.areaName}}, {{this.villageName}} | Facing: {{this.plotFacing}} | Size: {{this.plotSize}}
{{/each}}

Based on your analysis, generate the three requested insights in the specified format. Make them sound professional and enticing.
`,
});

const generateMarketInsightsFlow = ai.defineFlow(
  {
    name: 'generateMarketInsightsFlow',
    inputSchema: GenerateMarketInsightsInputSchema,
    outputSchema: MarketInsightsOutputSchema,
  },
  async (input) => {
    // If there are no plots, return a default message to avoid calling the AI with empty data.
    if (input.plots.length === 0) {
        return {
            hotspotArea: "A variety of premium plots are available across several promising locations.",
            trendingOpportunity: "Plots suitable for immediate construction and long-term investment are currently listed.",
            investmentTeaser: "Explore our exclusive listings to find properties with significant growth potential."
        };
    }
    const { output } = await prompt(input);
    return output!;
  }
);
