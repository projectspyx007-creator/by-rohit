'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Smile, Wrench, Code, Sigma } from 'lucide-react';
import { generateHourlyThought } from '@/ai/flows/generate-hourly-thought';

type Thought = {
  content: string;
  type: 'quote' | 'joke' | 'engineering' | 'coding' | 'math';
}

const thoughtIcons = {
    quote: <Lightbulb className="h-6 w-6 text-cream/80" />,
    joke: <Smile className="h-6 w-6 text-cream/80" />,
    engineering: <Wrench className="h-6 w-6 text-cream/80" />,
    coding: <Code className="h-6 w-6 text-cream/80" />,
    math: <Sigma className="h-6 w-6 text-cream/80" />,
}

export default function HomePage() {
  const userName = "Alex"; // This would come from user data
  const [greeting, setGreeting] = useState("");
  const [thought, setThought] = useState<Thought | null>(null);
  const [isLoadingThought, setIsLoadingThought] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }

    async function fetchThought() {
      try {
        setIsLoadingThought(true);
        const result = await generateHourlyThought();
        setThought(result);
      } catch (error) {
        console.error("Failed to fetch thought:", error);
        setThought({ content: "The best way to predict the future is to create it.", type: 'quote'});
      } finally {
        setIsLoadingThought(false);
      }
    }

    fetchThought();
    
    // Set an interval to fetch a new thought every hour
    const intervalId = setInterval(fetchThought, 3600000);

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
            Here&apos;s your campus brew for today.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-primary text-primary-foreground p-5 rounded-2xl shadow-md border-none">
        <CardContent className="p-0">
          <div className="flex justify-between items-start mb-3">
            <p className="text-sm font-bold font-headline tracking-wider uppercase">
              Thought of the Hour
            </p>
            {thought && thoughtIcons[thought.type]}
          </div>
          {isLoadingThought ? (
             <div className="space-y-2">
                <div className="w-full h-4 bg-cream/20 rounded-full animate-pulse"></div>
                <div className="w-3/4 h-4 bg-cream/20 rounded-full animate-pulse"></div>
             </div>
          ) : (
            <p className="italic text-lg text-cream">
              &ldquo;{thought?.content}&rdquo;
            </p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
