import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RiceSeedIcon } from "@/components/icons/rice-seed";
import { FileQuestion } from "lucide-react";

export default function MainNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="h-20 w-20 rounded-full bg-muted/80 ring-1 ring-border/50 flex items-center justify-center mb-4">
        <FileQuestion className="h-8 w-8 text-muted-foreground absolute" />
        <RiceSeedIcon size={28} className="text-muted-foreground/20 translate-x-3 translate-y-3" />
      </div>
      <h1 className="text-xl font-semibold tracking-tight mb-2">Page not found</h1>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/feed">
        <Button>← Back to Feed</Button>
      </Link>
    </div>
  );
}
