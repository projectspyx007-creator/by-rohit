import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, FileText, MessageCircle } from "lucide-react";

export default function HomePage() {
  const userName = "Alex"; // This would come from user data

  return (
    <div className="p-4 space-y-5">
      <Card className="bg-background p-5 rounded-2xl shadow-lg border-none">
        <CardContent className="p-0">
          <h2 className="text-2xl font-bold text-primary font-headline">
            Good Morning, {userName}!
          </h2>
          <p className="text-sm text-muted-foreground">
            Here&apos;s your campus brew for today.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-primary text-primary-foreground p-5 rounded-2xl shadow-md border-none">
          <CardContent className="p-0">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">New Notices</p>
                <p className="text-3xl font-bold">4</p>
                <p className="text-xs opacity-80">+2 since yesterday</p>
              </div>
              <FileText size={36} className="opacity-80" />
            </div>
            <Button asChild className="mt-4 w-full bg-cream text-coffee-700 font-medium hover:bg-cream/90">
              <Link href="/notices">View Notices</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground p-5 rounded-2xl shadow-md border-none">
          <CardContent className="p-0">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">Today&apos;s Classes</p>
                <p className="text-3xl font-bold">3</p>
                <p className="text-xs opacity-80">CS101 in 2 hrs</p>
              </div>
              <Calendar size={36} className="opacity-80" />
            </div>
            <Button asChild className="mt-4 w-full bg-cream text-coffee-700 font-medium hover:bg-cream/90">
              <Link href="/timetable">View Timetable</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-background p-5 rounded-2xl border-2 border-primary/50 shadow-md">
        <CardContent className="p-0">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="font-bold text-primary text-lg font-headline">
                Coffee Coach ☕
              </p>
              <p className="text-sm text-muted-foreground">
                Ask me about classes, notices, or life.
              </p>
            </div>
            <MessageCircle size={32} className="text-primary" />
          </div>
          <Button asChild className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-xl hover:bg-primary/90">
            <Link href="/chat">Start Chat</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
