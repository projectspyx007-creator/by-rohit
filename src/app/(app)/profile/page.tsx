
"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Bell, Paintbrush, ShieldCheck, LogOut, GraduationCap, Code2, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, useUser, useAuth } from "@/firebase";
import { doc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const branchMap: Record<string, string> = {
  ad: "Artificial Intelligence",
  cs: "Computer Science",
  mc: "Mathematics and Computing",
};

export default function ProfilePage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const userRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userRef);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setNotificationsEnabled(userProfile.notifications ?? false);
    }
  }, [userProfile]);

  const handleNotificationToggle = async (checked: boolean) => {
    if (!userRef) return;

    // This logic runs when the user tries to turn the toggle ON
    if (checked) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        // If permissions are already denied, show an error and DON'T turn on the toggle.
        if (Notification.permission === 'denied') {
          toast({
            variant: "destructive",
            title: "Notifications are Blocked",
            description: "To receive alerts, please enable notifications for this site in your browser settings.",
          });
          // Explicitly keep the UI state as false because we can't enable them.
          setNotificationsEnabled(false); 
          return;
        }

        // If permissions haven't been asked, ask now.
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      }
      
      // If we get here, permissions are 'granted' or were just granted.
      // Update UI state and save to database.
      setNotificationsEnabled(true);
      setDocumentNonBlocking(userRef, { notifications: true }, { merge: true });
    
    // This logic runs when the user turns the toggle OFF
    } else {
      setNotificationsEnabled(false);
      setDocumentNonBlocking(userRef, { notifications: false }, { merge: true });
    }
  };
  
  const handleSignOut = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      router.push('/signin');
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({
        variant: 'destructive',
        title: 'Sign Out Error',
        description: 'There was a problem signing you out. Please try again.'
      })
    }
  }
  
  const getAcademicInfo = (rollNumber: string | undefined) => {
    if (!rollNumber || rollNumber.length < 4) return { branch: 'N/A', batch: 'N/A' };
    const branchCode = rollNumber.substring(0, 2).toLowerCase();
    const yearCode = rollNumber.substring(2, 4);
    
    const branch = branchMap[branchCode] || 'Unknown Branch';
    
    const startYear = parseInt(`20${yearCode}`);
    const endYear = startYear + 4;
    const batch = `${startYear}-${endYear}`;

    return { branch, batch };
  }

  if (isUserLoading || isProfileLoading) {
    return <div className="p-4 text-center">Loading profile...</div>;
  }
  
  if (!user || !userProfile) {
     return (
        <div className="p-4 text-center">
            <p>Could not load user profile.</p>
            <Button onClick={handleSignOut}>Sign In</Button>
        </div>
    );
  }

  const { name: userName, email: userEmail, rollNumber: userRoll, role: userRole, semester: userSemester } = userProfile;
  const { branch, batch } = getAcademicInfo(userRoll);


  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col items-center space-y-2">
        <Avatar className="h-24 w-24 border-4 border-background shadow-md">
          <AvatarFallback className="text-4xl font-headline">{userName?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold text-primary font-headline">{userName}</h1>
        <p className="text-sm text-muted-foreground">{userEmail}</p>
        <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Code2 className="h-4 w-4" />
            <span>{branch}</span>
          </div>
          <div className="flex items-center gap-1">
             <GraduationCap className="h-4 w-4" />
             <span>{batch}</span>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
            <Badge variant="secondary">Roll: {userRoll || 'N/A'}</Badge>
            <Badge variant="secondary">Role: {userRole}</Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              Sem: {userSemester}
            </Badge>
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
            />
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <Paintbrush className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Dark Mode</span>
            </div>
            <Switch 
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
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
      
       <Card className="rounded-xl shadow-sm">
        <CardContent className="p-2">
           <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleSignOut}>
            <LogOut className="mr-2 h-5 w-5" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
