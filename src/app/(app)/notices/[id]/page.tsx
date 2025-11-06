'use client';

import { useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pin } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function NoticeDetailPage() {
  const params = useParams();
  const noticeId = params.id as string;
  const firestore = useFirestore();
  
  const noticeRef = useMemoFirebase(() => {
    if (!firestore || !noticeId) return null;
    return doc(firestore, 'notices', noticeId);
  }, [firestore, noticeId]);

  const { data: notice, isLoading } = useDoc(noticeRef);

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
      <div className="mb-4">
        <Button variant="ghost" asChild>
          <Link href="/notices" className="flex items-center gap-2 text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Notices
          </Link>
        </Button>
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
            By {notice.author} on {format(new Date(notice.date || notice.createdAt), 'PPP')}
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
