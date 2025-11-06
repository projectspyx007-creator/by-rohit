import { mockNotices } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pin, Plus } from "lucide-react";
import { format } from "date-fns";

export default function NoticesPage() {
  const pinnedNotices = mockNotices.filter((n) => n.pinned);
  const otherNotices = mockNotices.filter((n) => !n.pinned);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-primary font-headline">Notices</h1>
      
      {pinnedNotices.map((notice) => (
        <Card key={notice.id} className="rounded-xl shadow-md border-primary/50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="font-headline text-lg">{notice.title}</CardTitle>
              <Badge variant="secondary" className="bg-accent/30 text-accent-foreground flex items-center gap-1">
                <Pin className="h-3 w-3"/>
                Pinned
              </Badge>
            </div>
            <CardDescription>
              By {notice.author} on {format(new Date(notice.date), "PPP")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm text-foreground"
              dangerouslySetInnerHTML={{ __html: notice.content }}
            />
          </CardContent>
        </Card>
      ))}

      {otherNotices.map((notice) => (
        <Card key={notice.id} className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-lg">{notice.title}</CardTitle>
            <CardDescription>
              By {notice.author} on {format(new Date(notice.date), "PPP")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm text-foreground max-h-20 overflow-hidden relative"
            >
              <div dangerouslySetInnerHTML={{ __html: notice.content }}/>
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-cream to-transparent" />
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="link" className="p-0 h-auto">Read more</Button>
          </CardFooter>
        </Card>
      ))}
      
      {/* FAB for admin/editor */}
      <Button className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg">
        <Plus className="h-6 w-6" />
        <span className="sr-only">Add Notice</span>
      </Button>
    </div>
  );
}
