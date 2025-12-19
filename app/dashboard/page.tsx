"use client";
import React, { useEffect, useState } from "react";
import {
  transactionSchema,
  transactionSchemaType,
} from "../schema/transactions";
import { DashboardHeader } from "./components/Dashboard-header";
import { ChartBarMultiple } from "./components/EarningsChart";
import { ProfileSidebar } from "./components/Profile";
import { Contacts } from "./components/Contacts";
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import { EmptyState } from "./components/EmptyDashboard";
function page() {
  const [allTransactions, setAllTransactions] = useState<
    transactionSchemaType | null | undefined
  >(null);
  useEffect(() => {
    const transactions = localStorage.getItem("transactions");
    if (!transactions) {
      setAllTransactions(undefined);
      return;
    }
    const result = transactionSchema.safeParse(JSON.parse(transactions));
    if (!result.success) {
      setAllTransactions(undefined);
      return;
    }
    setAllTransactions(JSON.parse(transactions) as transactionSchemaType);
  }, []);
  if (allTransactions === null) {
    return <DashboardSkeleton />;
  }
  if (allTransactions === undefined) {
    return <EmptyState />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans md:p-8">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader />
        <div className="flex justify-between">
          <main className="space-y-6">
            <ChartBarMultiple transactions={allTransactions} />
            <Contacts transactions={allTransactions} />
          </main>

          <ProfileSidebar transactions={allTransactions} />
        </div>
      </div>
    </div>
  );
}

export default page;
