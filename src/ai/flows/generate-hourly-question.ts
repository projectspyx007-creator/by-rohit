'use server';

/**
 * @fileOverview Generates an educational question.
 *
 * - generateHourlyQuestion - A function that returns a question of the hour.
 * - HourlyQuestionOutput - The return type for the generateHourlyQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const HourlyQuestionOutputSchema = z.object({
  question: z.string().describe('The educational question.'),
  category: z.enum(['engineering', 'coding', 'math']).describe('The category of the question generated.'),
});
export type HourlyQuestionOutput = z.infer<typeof HourlyQuestionOutputSchema>;

export async function generateHourlyQuestion(): Promise<HourlyQuestionOutput> {
  return generateHourlyQuestionFlow();
}

const prompt = ai.definePrompt({
  name: 'hourlyQuestionPrompt',
  output: {schema: HourlyQuestionOutputSchema},
  prompt: `You are an AI that provides a simple, engaging educational question for a college student.
  
  Randomly choose to generate one of the following:
  1. A simple engineering question (e.g., "What is the difference between stress and strain?").
  2. A simple coding question or a fun fact about programming (e.g., "What does API stand for?").
  3. A simple math problem or a fun fact about mathematics (e.g., "What is the next number in the Fibonacci sequence: 0, 1, 1, 2, 3, 5, ...?").
  
  Ensure the content is concise and engaging. Do not repeat yourself. Provide a different response each time.`,
});

const generateHourlyQuestionFlow = ai.defineFlow(
  {
    name: 'generateHourlyQuestionFlow',
    outputSchema: HourlyQuestionOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
