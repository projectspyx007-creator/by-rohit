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

export default function ProfilePage() {
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');
  const userName = "Guest User";
  const userEmail = "guest@example.com";
  const { toast } = useToast();

  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleNotificationToggle = async (checked: boolean) => {
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
        setNotificationPermission('granted');
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === 'granted') {
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
        }
      } else {
        // Permission is denied
        toast({
            variant: "destructive",
            title: "Notifications are Blocked",
            description: "You need to manually enable notifications for this site in your browser settings.",
        });
      }
    } else {
        // Toggling off doesn't require browser permissions, just reflects an app setting.
        // For this demo, we'll just update the visual state.
        // In a real app, you would save this preference to the user's profile.
    }
  };
  
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
            <Badge variant="outline">Roll: CS-24-001</Badge>
            <Badge variant="secondary">Role: Student</Badge>
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
              checked={notificationPermission === 'granted'}
              onCheckedChange={handleNotificationToggle}
              disabled={notificationPermission === 'denied'}
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

// Minimal Badge component for this page as it's not in the base shadcn export
function Badge({ variant, ...props }: { variant: 'outline' | 'secondary' } & React.HTMLAttributes<HTMLDivElement>) {
    const baseClasses = "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors";
    const variants = {
        outline: "text-foreground",
        secondary: "bg-secondary text-secondary-foreground"
    };
    return <div className={`${baseClasses} ${variants[variant]}`} {...props} />;
}
