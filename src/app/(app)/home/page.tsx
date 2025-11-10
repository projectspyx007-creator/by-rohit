'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, BrainCircuit } from 'lucide-react';
import { generateDailyQuote } from '@/ai/flows/generate-daily-quote';
import { generateHourlyQuestion } from '@/ai/flows/generate-hourly-question';
import { useUser } from '@/firebase';

type Quote = {
  quote: string;
}

type Question = {
  question: string;
  category: 'engineering' | 'coding' | 'math';
}

export default function HomePage() {
  const { user } = useUser();
  const userName = user?.displayName?.split(' ')[0] || "Friend";
  const [greeting, setGreeting] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }

    async function fetchContent() {
      try {
        setIsLoading(true);
        const [quoteResult, questionResult] = await Promise.all([
          generateDailyQuote(),
          generateHourlyQuestion()
        ]);
        setQuote(quoteResult);
        setQuestion(questionResult);
      } catch (error) {
        console.error("Failed to fetch content:", error);
        setQuote({ quote: "The best way to predict the future is to create it."});
        setQuestion({ question: "What is the powerhouse of the cell?", category: 'engineering' });
      } finally {
        setIsLoading(false);
      }
    }

    fetchContent();
    
    // Set an interval to fetch a new question every hour
    const intervalId = setInterval(async () => {
        try {
            const questionResult = await generateHourlyQuestion();
            setQuestion(questionResult);
        } catch (error) {
            console.error("Failed to fetch hourly question:", error);
        }
    }, 3600000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);

  }, []);


  return (
    <div className="p-4 space-y-5">
      <Card className="bg-background p-5 rounded-2xl shadow-lg border-none">
        <CardContent className="p-0">
          <h2 className="text-2xl font-bold text-primary font-headline">
            {greeting}, {userName}!
          </h2>
          <p className="text-sm text-muted-foreground">
            Here's your daily briefing.
          </p>
        </CardContent>
      </Card>

      {isLoading ? (
        <>
          <Card className="bg-background p-5 rounded-2xl shadow-md border-primary border-2">
            <CardContent className="p-0">
              <div className="flex justify-between items-start mb-3">
                <p className="text-sm font-bold font-headline tracking-wider uppercase">
                  Quote of the Day
                </p>
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                  <div className="w-full h-4 bg-muted rounded-full animate-pulse"></div>
                  <div className="w-3/4 h-4 bg-muted rounded-full animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-background p-5 rounded-2xl shadow-md border-primary/50 border-2">
            <CardContent className="p-0">
              <div className="flex justify-between items-start mb-3">
                <p className="text-sm font-bold font-headline tracking-wider uppercase">
                  Question of the Hour
                </p>
                <BrainCircuit className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                  <div className="w-full h-4 bg-muted rounded-full animate-pulse"></div>
                  <div className="w-3/4 h-4 bg-muted rounded-full animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {quote && (
            <Card className="bg-background p-5 rounded-2xl shadow-md border-primary border-2">
              <CardContent className="p-0">
                <div className="flex justify-between items-start mb-3">
                  <p className="text-sm font-bold font-headline tracking-wider uppercase text-primary">
                    Quote of the Day
                  </p>
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                  <p className="italic text-lg text-foreground">
                    &ldquo;{quote.quote}&rdquo;
                  </p>
              </CardContent>
            </Card>
          )}
          {question && (
             <Card className="bg-background p-5 rounded-2xl shadow-md border-primary/50 border-2">
                <CardContent className="p-0">
                    <div className="flex justify-between items-start mb-3">
                        <p className="text-sm font-bold font-headline tracking-wider uppercase text-primary">
                        Question of the Hour
                        </p>
                        <BrainCircuit className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-lg text-foreground">
                        {question.question}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">{question.category}</p>
                </CardContent>
            </Card>
          )}
        </>
      )}

    </div>
  );
}
