'use server';
/**
 * @fileOverview An AI flow to visualize future development around a plot.
 *
 * - visualizeFutureDevelopment - A function that handles the image generation.
 * - VisualizeFutureDevelopmentInput - The input type for the function.
 * - VisualizeFutureDevelopmentOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VisualizeFutureDevelopmentInputSchema = z.object({
  currentImageUrl: z.string().describe(
      "The current image of the plot, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  areaName: z.string().describe('The name of the area where the plot is located.'),
});
export type VisualizeFutureDevelopmentInput = z.infer<typeof VisualizeFutureDevelopmentInputSchema>;

const VisualizeFutureDevelopmentOutputSchema = z.object({
  futureImageUrl: z
    .string()
    .describe(
      "A generated image of the potential future development, as a data URI."
    ),
});
export type VisualizeFutureDevelopmentOutput = z.infer<typeof VisualizeFutureDevelopmentOutputSchema>;

export async function visualizeFutureDevelopment(
  input: VisualizeFutureDevelopmentInput
): Promise<VisualizeFutureDevelopmentOutput> {
  return visualizeFutureDevelopmentFlow(input);
}

const generateImagePrompt = ai.definePrompt({
    name: 'visualizeFutureDevelopmentPrompt',
    input: { schema: VisualizeFutureDevelopmentInputSchema },
    prompt: `Based on the provided image of a vacant plot of land located in an area named '{{areaName}}', generate a new image that visualizes potential future development in the SURROUNDING area.

    IMPORTANT:
    - Keep the primary plot of land in the foreground unchanged. It should remain vacant.
    - Add futuristic and developed elements to the BACKGROUND and surroundings. This could include modern residential buildings, commercial complexes, improved roads, parks, and other infrastructure.
    - The style should be photorealistic, seamlessly blending the new developments with the existing landscape.
    - The overall mood should be positive, bright, and suggest growth and prosperity.
    `,
});

const visualizeFutureDevelopmentFlow = ai.defineFlow(
  {
    name: 'visualizeFutureDevelopmentFlow',
    inputSchema: VisualizeFutureDevelopmentInputSchema,
    outputSchema: VisualizeFutureDevelopmentOutputSchema,
  },
  async ({ currentImageUrl, areaName }) => {
    const renderedPrompt = await generateImagePrompt.render({ areaName, currentImageUrl: '' });

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        { text: renderedPrompt.messages?.[0]?.content?.[0]?.text || 'Visualize future development' },
        { media: { url: currentImageUrl } }
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to produce a valid URL.');
    }

    return {
        futureImageUrl: media.url
    };
  }
);
