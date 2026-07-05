import { Skeleton } from "@/components/ui/skeleton";

function TaskSkeleton() {
  return (
    <div className="tf-card rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-[70%]" />
        <Skeleton className="h-2.5 w-full" />
        <Skeleton className="h-2.5 w-[55%]" />
        <div className="mt-3 flex items-center justify-between">
          <Skeleton className="h-5 w-[84px] rounded-full" />
          <Skeleton className="h-2.5 w-12" />
        </div>
      </div>
    </div>
  );
}

export default TaskSkeleton;
