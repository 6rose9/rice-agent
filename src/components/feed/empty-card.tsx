import { Sprout } from "lucide-react";

interface EmptyCardProps {
  message?: string;
  subtext?: string;
}

export function EmptyCard({
  message = "No posts yet",
  subtext = "Follow rice traders to see their posts here.",
}: EmptyCardProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="bg-muted rounded-full p-4 mb-4">
        <Sprout className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold mb-1">{message}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{subtext}</p>
    </div>
  );
}
