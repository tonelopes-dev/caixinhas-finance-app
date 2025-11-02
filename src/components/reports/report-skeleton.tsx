'use client';

import { Skeleton } from "@/components/ui/skeleton";

export function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <ul className="space-y-2 pl-4">
            <li><Skeleton className="h-4 w-3/4" /></li>
            <li><Skeleton className="h-4 w-2/3" /></li>
            <li><Skeleton className="h-4 w-3/5" /></li>
            <li><Skeleton className="h-4 w-4/5" /></li>
        </ul>
      </div>

       <div className="space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <ul className="space-y-2 pl-4">
            <li><Skeleton className="h-4 w-2/4" /></li>
            <li><Skeleton className="h-4 w-1/3" /></li>
        </ul>
      </div>
      
       <div className="space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-6 w-2/5" />
        <ol className="space-y-3 list-decimal pl-5">
          <li>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12 mt-1" />
          </li>
          <li>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-10/12 mt-1" />
          </li>
        </ol>
      </div>
    </div>
  );
}
