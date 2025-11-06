"use client";

import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Bell, Paintbrush, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userRef);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    if (userProfile) {
      setNotificationsEnabled(userProfile.notifications && Notification.permission === 'granted');
    }
  }, [userProfile]);

  const handleNotificationToggle = async (checked: boolean) => {
    if (!userRef) return;

    if (!('Notification' in window)) {
      toast({
        variant: "destructive",
        title: "Unsupported Browser",
        description: "Your browser does not support notifications.",
      });
      return;
    }

    if (checked) {
      if (Notification.permission === 'granted') {
        setDocumentNonBlocking(userRef, { notifications: true }, { merge: true });
        setNotificationsEnabled(true);
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === 'granted') {
          setDocumentNonBlocking(userRef, { notifications: true }, { merge: true });
          setNotificationsEnabled(true);
          toast({
            title: "Notifications Enabled",
            description: "You will now receive reminders for your classes.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Notifications Blocked",
            description: "Please enable notifications in your browser settings.",
          });
          setNotificationsEnabled(false);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Notifications are Blocked",
          description: "You need to manually enable notifications for this site in your browser settings.",
        });
        setNotificationsEnabled(false);
      }
    } else {
      setDocumentNonBlocking(userRef, { notifications: false }, { merge: true });
      setNotificationsEnabled(false);
    }
  };
  
  const userName = userProfile?.name || "Guest User";
  const userEmail = userProfile?.email || "guest@example.com";
  const userRoll = userProfile?.rollNumber || "N/A";

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col items-center space-y-2">
        <Avatar className="h-24 w-24 border-4 border-background shadow-md">
          {userAvatar && (
            <AvatarImage src={userAvatar.imageUrl} alt="User avatar" data-ai-hint={userAvatar.imageHint} />
          )}
          <AvatarFallback>{userName.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold text-primary font-headline">{userName}</h1>
        <p className="text-sm text-muted-foreground">{userEmail}</p>
        <div className="flex gap-2">
            <Badge variant="outline">Roll: {userRoll}</Badge>
            <Badge variant="secondary">Role: {userProfile?.role || 'Student'}</Badge>
        </div>
      </div>

      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Notifications</span>
            </div>
            <Switch 
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationToggle}
              disabled={notificationPermission === 'denied' || isProfileLoading}
            />
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <Paintbrush className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Dark Mode</span>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Account & Security</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
