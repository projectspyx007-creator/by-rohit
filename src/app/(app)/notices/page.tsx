
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pin, Plus, MoreVertical, Trash2, Pencil, Calendar as CalendarIcon } from 'lucide-react';
import { format, isBefore, isAfter } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirestore, useCollection, addDocumentNonBlocking, setDocumentNonBlocking, useMemoFirebase, useUser, deleteDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const noticeSchema = z.object({
  title: z.string().min(1, { message: 'Title is required.' }),
  content: z.string().min(1, { message: 'Content is required.' }),
  startDate: z.date({ required_error: "A start date is required." }),
  endDate: z.date({ required_error: "An end date is required." }),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date.",
  path: ["endDate"],
});


// Notice type based on our data structure
type Notice = {
  id: string;
  title: string;
  body: string;
  authorName: string;
  authorId?: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  pinned: boolean;
  tags: string[];
  attachments: string[];
}

type UserProfile = {
    role?: 'student' | 'admin';
}

type NoticeStatus = 'Running' | 'Upcoming' | 'Completed';


function NoticeForm({ setDialogOpen, noticeToEdit }: { setDialogOpen: (open: boolean) => void, noticeToEdit?: Notice | null }) {
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<z.infer<typeof noticeSchema>>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      title: noticeToEdit?.title || '',
      content: noticeToEdit?.body || '',
      startDate: noticeToEdit ? new Date(noticeToEdit.startDate) : new Date(),
      endDate: noticeToEdit ? new Date(noticeToEdit.endDate) : new Date(new Date().setDate(new Date().getDate() + 1)),
    },
  });

  const onSubmit = async (values: z.infer<typeof noticeSchema>) => {
    if (!firestore || !user) return;

    const noticeData = {
      title: values.title,
      body: values.content,
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
    };

    if (noticeToEdit) {
      // Update existing notice
      const noticeRef = doc(firestore, 'notices', noticeToEdit.id);
      setDocumentNonBlocking(noticeRef, noticeData, { merge: true });
    } else {
      // Create new notice
      const noticesCollection = collection(firestore, 'notices');
      addDocumentNonBlocking(noticesCollection, {
        ...noticeData,
        authorName: user.displayName || 'Anonymous',
        authorId: user.uid,
        createdAt: new Date().toISOString(),
        pinned: false,
        tags: [],
        attachments: [],
      });
    }
    
    form.reset();
    setDialogOpen(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="title">Title</Label>
              <FormControl>
                <Input id="title" placeholder="Enter notice title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="content">Content</Label>
              <FormControl>
                <Textarea id="content" placeholder="Enter notice content" {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting 
            ? (noticeToEdit ? 'Saving...' : 'Adding...')
            : (noticeToEdit ? 'Save Changes' : 'Add Notice')
          }
        </Button>
      </form>
    </Form>
  );
}

export default function NoticesPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);
  const isAdmin = userProfile?.role === 'admin';

  const noticesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'notices'), orderBy('startDate', 'desc'));
  }, [firestore]);

  const { data: notices, isLoading } = useCollection<Notice>(noticesQuery);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  const handleDelete = () => {
    if (!firestore || !selectedNoticeId) return;
    const noticeRef = doc(firestore, 'notices', selectedNoticeId);
    deleteDocumentNonBlocking(noticeRef);
    setIsAlertOpen(false);
    setSelectedNoticeId(null);
  };
  
  const openDeleteConfirm = (noticeId: string) => {
    setSelectedNoticeId(noticeId);
    setIsAlertOpen(true);
  }

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setIsDialogOpen(true);
  }

  const handleAddNew = () => {
    setEditingNotice(null);
    setIsDialogOpen(true);
  }

  const getNoticeStatus = (notice: Notice): NoticeStatus => {
    const now = new Date();
    const startDate = new Date(notice.startDate);
    const endDate = new Date(notice.endDate);
    
    if (isBefore(now, startDate)) return 'Upcoming';
    if (isAfter(now, endDate)) return 'Completed';
    return 'Running';
  };
  
  const categorizedNotices = useMemo(() => {
    if (!notices) return { running: [], upcoming: [], completed: [] };

    return notices.reduce((acc, notice) => {
        const status = getNoticeStatus(notice);
        if (status === 'Running') acc.running.push(notice);
        else if (status === 'Upcoming') acc.upcoming.push(notice);
        else acc.completed.push(notice);
        return acc;
    }, { running: [] as Notice[], upcoming: [] as Notice[], completed: [] as Notice[] });
  }, [notices]);


  const NoticeCard = ({ notice }: { notice: Notice }) => {
    const isAuthor = user && (user.uid === notice.authorId);
    const status = getNoticeStatus(notice);
    const statusColor = {
        Running: 'bg-green-500/20 text-green-500',
        Upcoming: 'bg-yellow-500/20 text-yellow-500',
        Completed: 'bg-red-500/20 text-red-500',
    };

    return (
      <Card
        key={notice.id}
        className={`rounded-xl shadow-sm ${notice.pinned ? 'border-primary/50' : ''}`}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className='flex-1'>
               <Link href={`/notices/${notice.id}`}>
                <CardTitle className="font-headline text-lg hover:underline">
                  {notice.title}
                </CardTitle>
              </Link>
              <CardDescription>
                By {notice.authorName || 'Campus Admin'} on {format(new Date(notice.createdAt), 'PPP')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={cn("font-semibold", statusColor[status])}>
                {status}
              </Badge>
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                     <DropdownMenuItem onSelect={() => handleEdit(notice)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => openDeleteConfirm(notice.id)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm text-foreground max-h-20 overflow-hidden relative">
            <div dangerouslySetInnerHTML={{ __html: notice.body }} />
            {notice.body.length > 200 && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent" />
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="link" asChild className="p-0 h-auto">
            <Link href={`/notices/${notice.id}`}>Read more</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const NoticeSection = ({ title, notices }: { title: string, notices: Notice[] }) => {
    if (notices.length === 0) return null;
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-muted-foreground font-headline tracking-wide">{title}</h2>
            {notices.map((notice) => (
                <NoticeCard key={notice.id} notice={notice} />
            ))}
        </div>
    );
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary font-headline">Notices</h1>
        {isAdmin && (
            <Button onClick={handleAddNew} className="shadow-md">
                <Plus className="h-4 w-4 mr-2" /> Add Notice
            </Button>
        )}
      </div>
      
      {isLoading && <p>Loading notices...</p>}

      <div className="space-y-8">
        <NoticeSection title="Running" notices={categorizedNotices.running} />
        <NoticeSection title="Upcoming" notices={categorizedNotices.upcoming} />
        <NoticeSection title="Completed" notices={categorizedNotices.completed} />
      </div>
      
      {!notices?.length && !isLoading && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No notices yet.</p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingNotice(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingNotice ? 'Edit Notice' : 'Create a New Notice'}</DialogTitle>
          </DialogHeader>
          <NoticeForm setDialogOpen={setIsDialogOpen} noticeToEdit={editingNotice} />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this notice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedNoticeId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
