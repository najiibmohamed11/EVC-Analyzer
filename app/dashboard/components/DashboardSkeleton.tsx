// 1. Loading Skeleton
// Mimics the shape of your specific layout (Header, Chart, Contacts, Sidebar)
export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans md:p-8">
      <div className="mx-auto max-w-7xl animate-pulse space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 rounded-lg bg-slate-200"></div>
          <div className="h-10 w-10 rounded-full bg-slate-200"></div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <main className="flex-1 space-y-6">
            {/* Chart Area Skeleton */}
            <div className="h-[400px] w-full rounded-2xl bg-slate-200"></div>

            {/* Top Contacts Skeleton */}
            <div className="h-[200px] w-full rounded-2xl bg-slate-200"></div>
          </main>

          {/* Sidebar Skeleton */}
          <aside className="w-full lg:w-[350px]">
            <div className="h-[600px] rounded-2xl bg-slate-200"></div>
          </aside>
        </div>
      </div>
    </div>
  );
};
