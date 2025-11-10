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
  prompt: `You are an AI that provides a challenging and engaging educational question for a university-level engineering or computer science student. Your task is to generate one question from one of the specified categories.

Choose one of the following categories and create a suitable question:
1.  **Engineering**: A challenging conceptual or applied problem in a core engineering discipline (e.g., "Explain the principles of a cantilever beam and how to calculate its deflection under a point load.").
2.  **Coding**: A difficult algorithm or data structure problem, similar to those found in technical interviews (e.g., "Given an array of n non-negative integers representing an elevation map where the width of each bar is 1, compute how much rainwater it can trap after a rain.").
3.  **Math**: A complex problem involving calculus, linear algebra, or discrete mathematics (e.g., "Find the eigenvalues and eigenvectors of the matrix A = [[4, 1], [2, 3]].").

Ensure the content is concise but challenging. Do not repeat yourself. Provide a different response each time.`,
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
