import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * LoadingCard
 * A reusable skeleton placeholder that mimics the shape of a typical result card.
 * - Accessible by default (screen readers will announce “Loading…”)
 */

export function LoadingCard() {
  return (
    <Card className="h-[260px] flex flex-col overflow-hidden rounded-xl border transition-shadow">
      <CardHeader className="p-6 pb-2">
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent className="flex-1 space-y-2 px-6 py-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      <CardFooter className="mt-auto px-6 py-4">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </CardFooter>
    </Card>
  );
}
