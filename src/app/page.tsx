import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CoffeeSteamSvg } from '@/components/coffee-steam-svg';

export default function LandingPage() {
  return (
    <main className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0 opacity-20">
        <CoffeeSteamSvg />
      </div>
      <div className="z-10 flex flex-col items-center text-center p-4">
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary">
          Coffee Campus
        </h1>
        <p className="mt-2 text-lg md:text-xl text-foreground">
          Brew Your College Life ☕
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-xs">
          <Button asChild className="w-full" size="lg">
            <Link href="/signin">Sign In</Link>
          </Button>
          <Button asChild className="w-full" variant="outline" size="lg">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
