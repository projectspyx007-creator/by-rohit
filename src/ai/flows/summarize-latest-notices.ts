'use server';

/**
 * @fileOverview Summarizes the latest notices for the Coffee Coach.
 *
 * - summarizeLatestNotices - A function that summarizes the latest notices.
 * - SummarizeLatestNoticesInput - The input type for the summarizeLatestNotices function.
 * - SummarizeLatestNoticesOutput - The return type for the summarizeLatestNotices function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeLatestNoticesInputSchema = z.object({
  notices: z.array(z.string()).describe('The latest notices to summarize.'),
});
export type SummarizeLatestNoticesInput = z.infer<typeof SummarizeLatestNoticesInputSchema>;

const SummarizeLatestNoticesOutputSchema = z.object({
  summary: z.string().describe('A summary of the latest notices.'),
});
export type SummarizeLatestNoticesOutput = z.infer<typeof SummarizeLatestNoticesOutputSchema>;

export async function summarizeLatestNotices(input: SummarizeLatestNoticesInput): Promise<SummarizeLatestNoticesOutput> {
  return summarizeLatestNoticesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeLatestNoticesPrompt',
  input: {schema: SummarizeLatestNoticesInputSchema},
  output: {schema: SummarizeLatestNoticesOutputSchema},
  prompt: `You are Coffee Coach ☕, providing summaries of the latest notices to students.

Summarize the following notices in under 100 words, being helpful and concise:

{% each notices %}
- {{{this}}}
{% endeach %}`,
});

const summarizeLatestNoticesFlow = ai.defineFlow(
  {
    name: 'summarizeLatestNoticesFlow',
    inputSchema: SummarizeLatestNoticesInputSchema,
    outputSchema: SummarizeLatestNoticesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
