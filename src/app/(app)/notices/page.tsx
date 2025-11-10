'use client';

import { useState } from 'react';
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
import { Pin, Plus, MoreVertical, Trash2, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useFirestore, useCollection, addDocumentNonBlocking, setDocumentNonBlocking, useMemoFirebase, useUser, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const noticeSchema = z.object({
  title: z.string().min(1, { message: 'Title is required.' }),
  content: z.string().min(1, { message: 'Content is required.' }),
});

// Notice type based on our data structure
type Notice = {
  id: string;
  title: string;
  body: string;
  authorName: string;
  authorId?: string;
  createdAt: string;
  pinned: boolean;
  tags: string[];
  attachments: string[];
}

function NoticeForm({ setDialogOpen, noticeToEdit }: { setDialogOpen: (open: boolean) => void, noticeToEdit?: Notice | null }) {
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<z.infer<typeof noticeSchema>>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      title: noticeToEdit?.title || '',
      content: noticeToEdit?.body || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof noticeSchema>) => {
    if (!firestore || !user) return;

    if (noticeToEdit) {
      // Update existing notice
      const noticeRef = doc(firestore, 'notices', noticeToEdit.id);
      setDocumentNonBlocking(noticeRef, {
        title: values.title,
        body: values.content,
      }, { merge: true });
    } else {
      // Create new notice
      const noticesCollection = collection(firestore, 'notices');
      addDocumentNonBlocking(noticesCollection, {
        title: values.title,
        body: values.content,
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

  const noticesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'notices'), orderBy('createdAt', 'desc'));
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

  const pinnedNotices = notices?.filter((n) => n.pinned) || [];
  const otherNotices = notices?.filter((n) => !n.pinned) || [];

  const NoticeCard = ({ notice }: { notice: Notice }) => {
    // Show actions if user is the author OR if authorId is missing OR if author is 'Campus Admin'
    const isAuthor = user && (user.uid === notice.authorId || !notice.authorId || notice.authorName === 'Campus Admin');

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
            <div className="flex items-center gap-1">
              {notice.pinned && (
                <Badge
                  variant="secondary"
                  className="bg-accent/30 text-accent-foreground flex items-center gap-1"
                >
                  <Pin className="h-3 w-3" />
                  Pinned
                </Badge>
              )}
              {isAuthor && (
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
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-cream to-transparent" />
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

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-primary font-headline">Notices</h1>
      
      {isLoading && <p>Loading notices...</p>}

      {pinnedNotices.map((notice) => (
        <NoticeCard key={notice.id} notice={notice} />
      ))}

      {otherNotices.map((notice) => (
        <NoticeCard key={notice.id} notice={notice} />
      ))}
      
      {(notices?.length || 0) === 0 && !isLoading && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No notices yet.</p>
        </div>
      )}

      <Button onClick={handleAddNew} className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg">
        <Plus className="h-6 w-6" />
        <span className="sr-only">Add Notice</span>
      </Button>

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
