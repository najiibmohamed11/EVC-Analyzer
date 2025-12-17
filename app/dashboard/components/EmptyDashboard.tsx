// 2. Empty State

import { WalletCards } from "lucide-react";
import { DashboardHeader } from "./Dashboard-header";

// A clean UI encouraging the user to take action
export const EmptyState = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="mx-auto max-w-7xl h-full flex flex-col">
        {/* We keep a simple header so they aren't trapped */}
        <DashboardHeader />

        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="bg-white p-6 rounded-full shadow-sm ring-1 ring-slate-100">
            <WalletCards className="w-16 h-16 text-slate-400" />
          </div>

          <div className="space-y-2 max-w-md">
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
