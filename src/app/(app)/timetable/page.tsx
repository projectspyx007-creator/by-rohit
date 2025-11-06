import { mockTimetable, TimetableEntry } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

const daysOfWeek = Object.keys(mockTimetable);

const TimetableCard = ({ entry }: { entry: TimetableEntry }) => (
  <Card className={`rounded-xl shadow-sm border-l-4 ${entry.color.replace('bg-', 'border-')}`} style={{ borderLeftColor: entry.color.startsWith('#') ? entry.color : undefined }}>
    <CardContent className="p-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-sm text-primary">{entry.subject}</p>
          <p className="text-xs text-muted-foreground">{entry.room} &bull; {entry.teacher}</p>
          <p className="text-xs text-muted-foreground mt-1">{entry.start} - {entry.end}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default function TimetablePage() {
  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary font-headline">My Timetable</h1>
        <Button>Share</Button>
      </div>
      <div className="space-y-4">
        {daysOfWeek.map((day) => (
          <div key={day}>
            <h2 className="font-bold text-lg text-primary mb-2">{day}</h2>
            <div className="space-y-2">
              {mockTimetable[day].length > 0 ? (
                mockTimetable[day].map((entry) => (
                  <TimetableCard key={entry.id} entry={entry} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">No classes today. Enjoy your day!</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
