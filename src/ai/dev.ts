import { config } from 'dotenv';
config();

import '@/ai/flows/ai-chatbot-assistance.ts';
import '@/ai/flows/summarize-latest-notices.ts';
import '@/ai/flows/generate-hourly-question.ts';
import '@/ai/flows/generate-daily-quote.ts';
