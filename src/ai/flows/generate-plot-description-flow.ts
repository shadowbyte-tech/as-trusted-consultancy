'use server';
/**
 * @fileOverview An AI flow to generate a real estate description for a plot of land.
 *
 * - generatePlotDescription - A function that handles the description generation.
 * - GeneratePlotDescriptionInput - The input type for the function.
 * - GeneratePlotDescriptionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePlotDescriptionInputSchema = z.object({
  plotSize: z.string().describe('The size of the plot, e.g., 2400 sqft.'),
  plotFacing: z
    .string()
    .describe('The cardinal direction the plot faces, e.g., North.'),
  villageName: z.string().describe('The name of the village where the plot is located.'),
  areaName: z.string().describe('The name of the area or colony where the plot is located.'),
});
export type GeneratePlotDescriptionInput = z.infer<typeof GeneratePlotDescriptionInputSchema>;

const GeneratePlotDescriptionOutputSchema = z.object({
  description: z.string().describe('A professionally written, enticing real estate marketing description for the plot.'),
});
export type GeneratePlotDescriptionOutput = z.infer<typeof GeneratePlotDescriptionOutputSchema>;

export async function generatePlotDescription(
  input: GeneratePlotDescriptionInput
): Promise<GeneratePlotDescriptionOutput> {
  return generatePlotDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePlotDescriptionPrompt',
  input: { schema: GeneratePlotDescriptionInputSchema },
  output: { schema: GeneratePlotDescriptionOutputSchema },
  prompt: `You are an expert real estate copywriter. Your task is to write a compelling, professional, and enticing marketing description for a plot of land based on the details provided.

The description should be a single, well-structured paragraph. Highlight the key features and benefits, such as the size, facing direction, and location. Use appealing language to attract potential buyers and investors. Make it sound like a premium property opportunity.

Plot Details:
- Plot Size: {{{plotSize}}}
- Facing Direction: {{{plotFacing}}}
- Village: {{{villageName}}}
- Area/Colony: {{{areaName}}}

Generate the description now.
`,
});

const generatePlotDescriptionFlow = ai.defineFlow(
  {
    name: 'generatePlotDescriptionFlow',
    inputSchema: GeneratePlotDescriptionInputSchema,
    outputSchema: GeneratePlotDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
