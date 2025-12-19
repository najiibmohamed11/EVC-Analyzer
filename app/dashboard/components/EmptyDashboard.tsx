// 2. Empty State

import { WalletCards } from "lucide-react";
import { DashboardHeader } from "./Dashboard-header";

// A clean UI encouraging the user to take action
export const EmptyState = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans md:p-8">
      <div className="mx-auto flex h-full max-w-7xl flex-col">
        {/* We keep a simple header so they aren't trapped */}
        <DashboardHeader />

        <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center space-y-6 text-center">
          <div className="rounded-full bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <WalletCards className="h-16 w-16 text-slate-400" />
          </div>

          <div className="max-w-md space-y-2">
            <h2 className="text-2xl font-semibold text-slate-800">
              No Transactions Yet
            </h2>
            <p className="text-slate-500">
              It looks like you havent made any transactions yet. Go back and
              upload valid Pdf.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
