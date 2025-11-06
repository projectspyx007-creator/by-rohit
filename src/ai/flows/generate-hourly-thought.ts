'use server';

/**
 * @fileOverview Generates a motivational quote, a light-hearted joke, or an educational question.
 *
 * - generateHourlyThought - A function that returns a thought of the hour.
 * - HourlyThoughtOutput - The return type for the generateHourlyThought function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const HourlyThoughtOutputSchema = z.object({
  content: z.string().describe('The motivational quote, funny joke, or educational question.'),
  type: z.enum(['quote', 'joke', 'engineering', 'coding', 'math']).describe('The type of content generated.'),
});
export type HourlyThoughtOutput = z.infer<typeof HourlyThoughtOutputSchema>;

export async function generateHourlyThought(): Promise<HourlyThoughtOutput> {
  return generateHourlyThoughtFlow();
}

const prompt = ai.definePrompt({
  name: 'hourlyThoughtPrompt',
  output: {schema: HourlyThoughtOutputSchema},
  prompt: `You are an AI that provides a short, insightful piece of content.
  
  Randomly choose to generate one of the following:
  1. A motivational quote.
  2. A clean, family-friendly, genuinely funny joke.
  3. A simple engineering question (e.g., "What is the difference between stress and strain?").
  4. A simple coding question or a fun fact about programming (e.g., "What does API stand for?").
  5. A simple math problem or a fun fact about mathematics (e.g., "What is the next number in the Fibonacci sequence: 0, 1, 1, 2, 3, 5, ...?").
  
  Ensure the content is concise and engaging. Do not repeat yourself. Provide a different response each time.`,
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
