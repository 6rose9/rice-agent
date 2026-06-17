import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <Card className="border-b border-border/50 rounded-none shadow-none">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>

        {/* Images placeholder */}
        <div className="flex gap-1.5">
          <Skeleton className="h-24 w-32 rounded-md" />
          <Skeleton className="h-24 w-32 rounded-md" />
        </div>

        {/* Meta */}
        <div className="flex gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-1 border-t">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-10" />
        </div>
      </CardContent>
    </Card>
  );
}
