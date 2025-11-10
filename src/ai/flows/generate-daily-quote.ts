'use server';

/**
 * @fileOverview Generates a motivational quote.
 *
 * - generateDailyQuote - A function that returns a quote of the day.
 * - DailyQuoteOutput - The return type for the generateDailyQuote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailyQuoteOutputSchema = z.object({
  quote: z.string().describe('The motivational quote.'),
  author: z.string().describe('The author of the quote.'),
});
export type DailyQuoteOutput = z.infer<typeof DailyQuoteOutputSchema>;

export async function generateDailyQuote(): Promise<DailyQuoteOutput> {
  return generateDailyQuoteFlow();
}

const prompt = ai.definePrompt({
  name: 'dailyQuotePrompt',
  output: {schema: DailyQuoteOutputSchema},
  prompt: `You are an AI that provides a short, insightful, and motivational quote from a great historical figure, scientist, leader, or artist.
  
  Generate a new, concise, and engaging motivational quote suitable for a college student, and provide the name of the person who said it.
  Do not repeat yourself. Provide a different response each time.`,
});

const generateDailyQuoteFlow = ai.defineFlow(
  {
    name: 'generateDailyQuoteFlow',
    outputSchema: DailyQuoteOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
