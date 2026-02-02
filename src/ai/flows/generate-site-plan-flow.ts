'use server';
/**
 * @fileOverview An AI flow to generate a potential site plan for a plot.
 *
 * - generateSitePlan - A function that handles the site plan generation.
 * - GenerateSitePlanInput - The input type for the generateSitePlan function.
 * - GenerateSitePlanOutput - The return type for the generateSitePlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateSitePlanInputSchema = z.object({
  plotSize: z.string().describe('The size of the plot, e.g., 2400 sqft.'),
  plotFacing: z
    .string()
    .describe('The cardinal direction the plot faces, e.g., North.'),
  areaName: z.string().describe('The name of the area where the plot is located.'),
});
export type GenerateSitePlanInput = z.infer<typeof GenerateSitePlanInputSchema>;

const GenerateSitePlanOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      "A generated image of the site plan, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateSitePlanOutput = z.infer<typeof GenerateSitePlanOutputSchema>;

export async function generateSitePlan(
  input: GenerateSitePlanInput
): Promise<GenerateSitePlanOutput> {
  return generateSitePlanFlow(input);
}

const generateImagePrompt = ai.definePrompt({
    name: 'generateSitePlanPrompt',
    input: { schema: GenerateSitePlanInputSchema },
    prompt: `Generate a 2D top-down architectural site plan for a residential house on an empty plot of land.

    Plot Details:
    - Size: {{plotSize}}
    - Facing: {{plotFacing}}
    - Location Context: {{areaName}}

    The site plan should show a potential house layout, a garden, and a driveway.
    The style should be a clean, modern architectural blueprint with clear labels for rooms like "Living Room", "Bedroom", "Kitchen".
    The image should be black and white with blue accents.
    Do not include any people, cars, or 3D elements.
    `,
});

const generateSitePlanFlow = ai.defineFlow(
  {
    name: 'generateSitePlanFlow',
    inputSchema: GenerateSitePlanInputSchema,
    outputSchema: GenerateSitePlanOutputSchema,
  },
  async (input) => {
    const renderedPrompt = await generateImagePrompt.render(input);
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: renderedPrompt.messages?.[0]?.content?.[0]?.text || 'Generate a site plan',
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to produce a valid URL.');
    }

    return {
        imageUrl: media.url
    };
  }
);
