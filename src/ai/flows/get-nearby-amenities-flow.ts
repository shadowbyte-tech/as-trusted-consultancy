'use server';
/**
 * @fileOverview An AI flow to find nearby amenities for a given location.
 *
 * - getNearbyAmenities - A function that handles finding nearby amenities.
 * - GetNearbyAmenitiesInput - The input type for the getNearbyAmenities function.
 * - Amenities - The output type for the getNearbyAmenities function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetNearbyAmenitiesInputSchema = z.object({
  location: z.string().describe('The location to search for amenities around, e.g., "Sunrise Valley, Greenwood".'),
});
export type GetNearbyAmenitiesInput = z.infer<typeof GetNearbyAmenitiesInputSchema>;

const AmenitiesSchema = z.object({
  schools: z.array(z.string()).describe("A list of up to 3 nearby schools."),
  hospitals: z.array(z.string()).describe("A list of up to 3 nearby hospitals or clinics."),
  markets: z.array(z.string()).describe("A list of up to 3 nearby markets or grocery stores."),
  transport: z.array(z.string()).describe("A list of up to 3 nearby public transport links, like bus stops or train stations."),
});
export type Amenities = z.infer<typeof AmenitiesSchema>;

export async function getNearbyAmenities(
  input: GetNearbyAmenitiesInput
): Promise<Amenities> {
  return getNearbyAmenitiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getNearbyAmenitiesPrompt',
  input: { schema: GetNearbyAmenitiesInputSchema },
  output: { schema: AmenitiesSchema },
  prompt: `You are a helpful local assistant for a real estate website.
Based on the provided location, identify the closest and most relevant amenities.
For each category (schools, hospitals, markets, transport), provide a list of up to 3 distinct and plausible-sounding examples. Do not invent distances, just provide the names.

Location: {{{location}}}

Generate the list of amenities in the structured format requested.
`,
});

const getNearbyAmenitiesFlow = ai.defineFlow(
  {
    name: 'getNearbyAmenitiesFlow',
    inputSchema: GetNearbyAmenitiesInputSchema,
    outputSchema: AmenitiesSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
