'use server';

/**
 * @fileOverview This file defines the Genkit flow for the AI-powered Coffee Coach chatbot.
 *
 * The chatbot assists students with information about classes, notices, and campus life.
 * - generateChatResponse - A function that generates a chat response based on user input.
 * - AIChatbotAssistanceInput - The input type for the generateChatResponse function.
 * - AIChatbotAssistanceOutput - The return type for the generateChatResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIChatbotAssistanceInputSchema = z.object({
  message: z.string().describe('The user message to be processed.'),
  timetable: z.string().describe('The user timetable in JSON string format.'),
  notices: z.string().describe('The latest notices in JSON string format.'),
});
export type AIChatbotAssistanceInput = z.infer<typeof AIChatbotAssistanceInputSchema>;

const AIChatbotAssistanceOutputSchema = z.object({
  reply: z.string().describe('The chatbot reply to the user message.'),
});
export type AIChatbotAssistanceOutput = z.infer<typeof AIChatbotAssistanceOutputSchema>;

export async function generateChatResponse(input: AIChatbotAssistanceInput): Promise<AIChatbotAssistanceOutput> {
  return aiChatbotAssistanceFlow(input);
}

const aiChatbotAssistancePrompt = ai.definePrompt({
  name: 'aiChatbotAssistancePrompt',
  input: {schema: AIChatbotAssistanceInputSchema},
  output: {schema: AIChatbotAssistanceOutputSchema},
  prompt: `You are Coffee Coach ☕ — warm, fun, concise.\nUser's timetable: {{{timetable}}}\nLatest notices: {{{notices}}}\n\nReply in under 100 words. Be helpful.\n\nUser: {{{message}}}\nCoach:`,
});

const aiChatbotAssistanceFlow = ai.defineFlow(
  {
    name: 'aiChatbotAssistanceFlow',
    inputSchema: AIChatbotAssistanceInputSchema,
    outputSchema: AIChatbotAssistanceOutputSchema,
  },
  async input => {
    const {output} = await aiChatbotAssistancePrompt(input);
    return output!;
  }
);
