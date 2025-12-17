// 1. Loading Skeleton
// Mimics the shape of your specific layout (Header, Chart, Contacts, Sidebar)
export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="mx-auto max-w-7xl space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
          <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <main className="flex-1 space-y-6">
            {/* Chart Area Skeleton */}
            <div className="h-[400px] w-full bg-slate-200 rounded-2xl"></div>

            {/* Top Contacts Skeleton */}
            <div className="h-[200px] w-full bg-slate-200 rounded-2xl"></div>
          </main>

          {/* Sidebar Skeleton */}
          <aside className="w-full lg:w-[350px]">
            <div className="h-[600px] bg-slate-200 rounded-2xl"></div>
          </aside>
        </div>
      </div>
    </div>
  );
};
