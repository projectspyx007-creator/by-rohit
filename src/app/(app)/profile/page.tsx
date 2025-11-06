import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, LogOut, Bell, Paintbrush, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col items-center space-y-2">
        <Avatar className="h-24 w-24 border-4 border-background shadow-md">
          {userAvatar && (
            <AvatarImage src={userAvatar.imageUrl} alt="User avatar" data-ai-hint={userAvatar.imageHint} />
          )}
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold text-primary font-headline">Alex Doe</h1>
        <p className="text-sm text-muted-foreground">alex.doe@college.edu</p>
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
            <Switch defaultChecked />
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
      
      <Button asChild variant="destructive" className="w-full">
        <Link href="/signin">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Link>
      </Button>
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
