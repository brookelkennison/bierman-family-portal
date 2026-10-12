import { Skeleton } from "@/components/ui/Skeleton";

/** Dashboard shape while data loads, so nothing jumps when it arrives. */
export function DashboardSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-7">
      <span role="status" className="sr-only">
        Loading your dashboard
      </span>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-5 w-60 max-w-full" />
      </div>
      <Skeleton className="h-31 rounded-card" />
      <div className="grid gap-7 lg:grid-cols-12">
        <div className="flex flex-col gap-7 lg:col-span-8">
          <Skeleton className="h-62 rounded-card" />
          <Skeleton className="h-80 rounded-card" />
          <Skeleton className="h-96 rounded-card" />
        </div>
        <div className="flex flex-col gap-7 lg:col-span-4">
          <Skeleton className="h-96 rounded-card" />
          <Skeleton className="h-60 rounded-card" />
        </div>
      </div>
    </div>
  );
}
