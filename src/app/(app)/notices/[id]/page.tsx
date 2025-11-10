'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pin, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase, useUser, deleteDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function NoticeDetailPage() {
  const params = useParams();
  const noticeId = params.id as string;
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  
  const noticeRef = useMemoFirebase(() => {
    if (!firestore || !noticeId) return null;
    return doc(firestore, 'notices', noticeId);
  }, [firestore, noticeId]);

  const { data: notice, isLoading } = useDoc(noticeRef);

  const handleDelete = () => {
    if (!noticeRef) return;
    deleteDocumentNonBlocking(noticeRef);
    router.push('/notices');
  }

  const isAuthor = user && notice && user.uid === notice.authorId;

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }
  
  if (!notice) {
    return (
      <div className="p-4 text-center">
        <h1 className="text-2xl font-bold text-primary">Notice not found</h1>
        <p className="text-muted-foreground">
          The notice you are looking for does not exist.
        </p>
        <Button asChild className="mt-4">
            <Link href="/notices">Back to Notices</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" asChild>
          <Link href="/notices" className="flex items-center gap-2 text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Notices
          </Link>
        </Button>
        {isAuthor && (
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this notice.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      <Card className="rounded-xl shadow-md">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-xl">{notice.title}</CardTitle>
            {notice.pinned && (
              <Badge
                variant="secondary"
                className="bg-accent/30 text-accent-foreground flex items-center gap-1"
              >
                <Pin className="h-3 w-3" />
                Pinned
              </Badge>
            )}
          </div>
          <CardDescription>
            By {notice.authorName} on {format(new Date(notice.createdAt), 'PPP')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="prose text-foreground"
            dangerouslySetInnerHTML={{ __html: notice.body }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
