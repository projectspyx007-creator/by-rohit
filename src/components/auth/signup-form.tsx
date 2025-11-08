
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth, useFirestore, setDocumentNonBlocking } from "@/firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, User, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc } from "firebase/firestore";
import { Separator } from "../ui/separator";
import { Icons } from "../icons";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  rollNumber: z.string().regex(/^[a-zA-Z]{2}\d{2}[bB]\d{4}$/, { message: "Invalid roll number format (e.g., cs24b1001)." }),
});

export function SignUpForm() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      rollNumber: "",
    },
  });

  const handleUserCreation = async (user: User, details: { name: string; email: string; rollNumber?: string; }) => {
    if (!firestore) return;

    // Update Firebase Auth profile
    await updateProfile(user, { displayName: details.name });

    const userRef = doc(firestore, "users", user.uid);
    // Using setDoc directly here is fine as it's part of the sign-up transaction
    await setDocumentNonBlocking(userRef, {
      id: user.uid,
      name: details.name,
      email: details.email,
      rollNumber: details.rollNumber || "", 
      role: "student",
      createdAt: new Date().toISOString(),
      notifications: true,
    }, { merge: true });
    router.push("/home");
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth) return;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      if (user) {
        await handleUserCreation(user, {
            name: values.name,
            email: values.email,
            rollNumber: values.rollNumber
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign Up Error",
        description: error.code === 'auth/email-already-in-use' ? 'This email is already registered.' : error.message,
      });
      console.error(error);
    }
  }

  async function onGoogleSignIn() {
    if (!auth || !firestore) return;
    try {
      const userCredential = await signInWithPopup(auth, new GoogleAuthProvider());
      const user = userCredential.user;
       if (user) {
        // Check if user document already exists
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
           // If it's a new user, create their profile
           await handleUserCreation(user, {
               name: user.displayName || "New User",
               email: user.email || ""
           });
        } else {
            // If they exist, just log them in
            router.push("/home");
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign In Error",
        description: error.message,
      });
    }
  }


  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Alex Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@college.edu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rollNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Roll Number</FormLabel>
                <FormControl>
                  <Input placeholder="cs24b1001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" type="button" onClick={onGoogleSignIn}>
        <Icons.Google className="mr-2 h-4 w-4" />
        Google
      </Button>
    </div>
  );
}
