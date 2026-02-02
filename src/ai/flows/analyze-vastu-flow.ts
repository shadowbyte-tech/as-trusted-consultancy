'use server';
/**
 * @fileOverview An AI flow to analyze a plot based on Vastu Shastra principles.
 *
 * - analyzeVastu - A function that handles the Vastu analysis.
 * - AnalyzeVastuInput - The input type for the analyzeVastu function.
 * - AnalyzeVastuOutput - The return type for the analyzeVastu function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeVastuInputSchema = z.object({
  plotFacing: z.string().describe('The cardinal direction the plot faces.'),
  plotSize: z.string().describe('The size of the plot, e.g., in square feet.'),
  areaName: z.string().describe('The name of the area or locality.'),
});
export type AnalyzeVastuInput = z.infer<typeof AnalyzeVastuInputSchema>;

const AnalyzeVastuOutputSchema = z.object({
  vastuRating: z
    .enum(['Excellent', 'Good', 'Average', 'Poor'])
    .describe('The overall Vastu compatibility rating of the plot.'),
  analysisSummary: z
    .string()
    .describe('A brief, one-paragraph summary of the Vastu analysis.'),
  positivePoints: z
    .array(z.string())
    .describe('A list of positive aspects of the plot according to Vastu.'),
  negativePoints: z
    .array(z.string())
    .describe(
      'A list of negative aspects or points of caution for the plot according to Vastu.'
    ),
});
export type AnalyzeVastuOutput = z.infer<typeof AnalyzeVastuOutputSchema>;

export async function analyzeVastu(
  input: AnalyzeVastuInput
): Promise<AnalyzeVastuOutput> {
  return analyzeVastuFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeVastuPrompt',
  input: { schema: AnalyzeVastuInputSchema },
  output: { schema: AnalyzeVastuOutputSchema },
  prompt: `You are an expert in Vastu Shastra, the traditional Indian system of architecture.
Analyze the provided plot details and generate a Vastu analysis.

Your analysis should be practical and easy for a potential buyer to understand.
Based on the plot facing direction, provide a rating, a summary, and key positive and negative points.
A North or East facing plot is generally considered most auspicious.

Plot Details:
- Facing Direction: {{{plotFacing}}}
- Plot Size: {{{plotSize}}}
- Location: {{{areaName}}}

Generate the analysis and provide the output in the structured format requested.
`,
});

const analyzeVastuFlow = ai.defineFlow(
  {
    name: 'analyzeVastuFlow',
    inputSchema: AnalyzeVastuInputSchema,
    outputSchema: AnalyzeVastuOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
