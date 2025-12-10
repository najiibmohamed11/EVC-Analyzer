"use client";
import React, { useEffect, useState } from "react";
import {
  transactionSchema,
  transactionSchemaType,
} from "../schema/transactions";
import { DashboardHeader } from "./components/Dashboard-header";
import { ChartBarMultiple } from "./components/EarningsChart";
import { ProfileSidebar } from "./components/Profile";
import { TopContacts } from "./components/TopContacts";
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
    console.log("helllllllllllllllllllllllllllllll");
    console.log(result);
    if (!result.success) {
      setAllTransactions(undefined);
      return;
    }
    setAllTransactions(JSON.parse(transactions) as transactionSchemaType);
  }, []);
  if (allTransactions === null) {
    return <div>loading....</div>;
  }
  if (allTransactions === undefined) {
    return <div>no transaction fund</div>;
  }
  console.log("transactions", allTransactions);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader />
        <div className="flex justify-between">
          <main className="space-y-6">
            <ChartBarMultiple transactions={allTransactions} />
            <TopContacts transactions={allTransactions} />
          </main>

          <ProfileSidebar transactions={allTransactions} />
        </div>
      </div>
    </div>
  );
}

export default page;
