'use server';

/**
 * @fileOverview Generates a motivational quote or a light-hearted joke.
 *
 * - generateHourlyThought - A function that returns a thought of the hour.
 * - HourlyThoughtOutput - The return type for the generateHourlyThought function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const HourlyThoughtOutputSchema = z.object({
  content: z.string().describe('The motivational quote or funny joke.'),
  type: z.enum(['quote', 'joke']).describe('The type of content generated.'),
});
export type HourlyThoughtOutput = z.infer<typeof HourlyThoughtOutputSchema>;

export async function generateHourlyThought(): Promise<HourlyThoughtOutput> {
  return generateHourlyThoughtFlow();
}

const prompt = ai.definePrompt({
  name: 'hourlyThoughtPrompt',
  output: {schema: HourlyThoughtOutputSchema},
  prompt: `You are an AI that provides either a short, insightful motivational quote OR a short, clean, family-friendly, genuinely funny joke.
  
  Randomly choose to generate either a quote or a joke. Ensure it is concise and impactful.
  
  Do not repeat yourself. Provide a different response each time.`,
});

const generateHourlyThoughtFlow = ai.defineFlow(
  {
    name: 'generateHourlyThoughtFlow',
    outputSchema: HourlyThoughtOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
