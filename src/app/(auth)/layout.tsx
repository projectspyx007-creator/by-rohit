import Link from "next/link";
import { Icons } from "@/components/icons";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <Icons.Coffee className="h-8 w-8" />
            <span className="font-headline text-3xl font-bold">Coffee Campus</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
