'use client';

import { useState } from 'react';
import { useFirestore, useDoc, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { MoreVertical, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const timetableEntrySchema = z.object({
  id: z.string().optional(),
  subject: z.string().min(1, 'Subject is required.'),
  room: z.string().min(1, 'Room is required.'),
  teacher: z.string().min(1, 'Teacher is required.'),
  day: z.string().min(1, 'Day is required.'),
  start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM).'),
  end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM).'),
  color: z.string().optional(),
});

type TimetableEntry = z.infer<typeof timetableEntrySchema>;
type TimetableDoc = { entries: TimetableEntry[] };

function TimetableForm({
  setDialogOpen,
  timetable,
  timetableRef,
  entry,
}: {
  setDialogOpen: (open: boolean) => void;
  timetable: TimetableDoc;
  timetableRef: any;
  entry?: TimetableEntry;
}) {
  const form = useForm<TimetableEntry>({
    resolver: zodResolver(timetableEntrySchema),
    defaultValues: entry || {
      subject: '',
      room: '',
      teacher: '',
      day: 'Monday',
      start: '',
      end: '',
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
    },
  });

  const onSubmit = (values: TimetableEntry) => {
    const newEntry = { ...values, id: entry?.id || `entry-${Date.now()}` };
    const existingEntries = timetable?.entries || [];
    let updatedEntries;

    if (entry) {
      // Update existing entry
      updatedEntries = existingEntries.map((e) => (e.id === entry.id ? newEntry : e));
    } else {
      // Add new entry
      updatedEntries = [...existingEntries, newEntry];
    }
    
    setDocumentNonBlocking(timetableRef, { entries: updatedEntries }, { merge: true });

    form.reset();
    setDialogOpen(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl><Input placeholder="e.g., CS101" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="room"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Room</FormLabel>
                <FormControl><Input placeholder="e.g., A-101" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="teacher"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Teacher</FormLabel>
                <FormControl><Input placeholder="e.g., Dr. Smith" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="day"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Day of Week</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select a day" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {daysOfWeek.map((day) => (<SelectItem key={day} value={day}>{day}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="start"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="end"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        <Button type="submit" className="w-full">
          {entry ? 'Save Changes' : 'Add Entry'}
        </Button>
      </form>
    </Form>
  );
}


const TimetableCard = ({
  entry,
  onEdit,
  onDelete
}: {
  entry: TimetableEntry;
  onEdit: () => void;
  onDelete: () => void;
}) => (
    <Card className="rounded-xl shadow-sm" style={{ borderLeft: `4px solid ${entry.color || '#6B4226'}`}}>
    <CardContent className="p-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-sm text-primary">{entry.subject}</p>
          <p className="text-xs text-muted-foreground">{entry.room} &bull; {entry.teacher}</p>
          <p className="text-xs text-muted-foreground mt-1">{entry.start} - {entry.end}</p>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onSelect={onEdit}>Edit</DropdownMenuItem>
                <DropdownMenuItem onSelect={onDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardContent>
  </Card>
);

export default function TimetablePage() {
  const firestore = useFirestore();
  const timetableRef = useMemoFirebase(() => {
      if (!firestore) return null;
      return doc(firestore, 'timetables', 'guest-timetable');
  }, [firestore]);
  const { data: timetable, isLoading } = useDoc<TimetableDoc>(timetableRef);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | undefined>(undefined);

  const handleEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };
  
  const handleAdd = () => {
    setEditingEntry(undefined);
    setIsFormOpen(true);
  };

  const handleDelete = (entryToDelete: TimetableEntry) => {
    if (!timetableRef) return;
    const updatedEntries = timetable?.entries.filter(entry => entry.id !== entryToDelete.id) || [];
    setDocumentNonBlocking(timetableRef, { entries: updatedEntries }, { merge: true });
  }

  const entriesByDay = daysOfWeek.reduce((acc, day) => {
    acc[day] = timetable?.entries?.filter((e) => e.day === day).sort((a, b) => a.start.localeCompare(b.start)) || [];
    return acc;
  }, {} as Record<string, TimetableEntry[]>);

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary font-headline">My Timetable</h1>
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
            setIsFormOpen(isOpen);
            if (!isOpen) setEditingEntry(undefined);
        }}>
            <DialogTrigger asChild>
                <Button onClick={handleAdd}>Add Entry</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingEntry ? 'Edit Entry' : 'Add New Entry'}</DialogTitle>
                </DialogHeader>
                {timetableRef && (
                    <TimetableForm 
                        setDialogOpen={setIsFormOpen}
                        timetable={timetable || { entries: [] }}
                        timetableRef={timetableRef}
                        entry={editingEntry}
                    />
                )}
            </DialogContent>
        </Dialog>
      </div>

      {isLoading && <p>Loading timetable...</p>}
      
      <div className="space-y-4">
        {daysOfWeek.map((day) => (
          entriesByDay[day] && entriesByDay[day].length > 0 && (
          <div key={day}>
            <h2 className="font-bold text-lg text-primary mb-2">{day}</h2>
            <div className="space-y-2">
              {entriesByDay[day].map((entry) => (
                  <TimetableCard 
                    key={entry.id} 
                    entry={entry} 
                    onEdit={() => handleEdit(entry)}
                    onDelete={() => handleDelete(entry)}
                    />
                ))
              }
            </div>
          </div>
          )
        ))}
      </div>
       {(timetable?.entries?.length || 0) === 0 && !isLoading && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Your timetable is empty.</p>
          <p className="text-muted-foreground">Click "Add Entry" to get started.</p>
        </div>
      )}
    </div>
  );
}

    