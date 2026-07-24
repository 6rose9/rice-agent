import { RiceSeedIcon } from "@/components/icons/rice-seed";

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
      <div className="bg-muted/80 rounded-full p-4 mb-4 ring-1 ring-border/50">
        <RiceSeedIcon size={36} className="text-muted-foreground/60" />
      </div>
      <h3 className="text-base font-semibold mb-1">{message}</h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{subtext}</p>
    </div>
  );
}
