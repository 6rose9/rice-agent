import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="text-xl font-semibold mb-2">Page not found</h1>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/feed">
        <Button>← Back to Feed</Button>
      </Link>
    </div>
  );
}
