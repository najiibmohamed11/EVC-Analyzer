"use client";

import { Wallet, TrendingUp, TrendingDown, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { transactionSchemaType } from "@/app/schema/transactions";
import { getSummaryStats } from "../utils/transactionUtils";

export function SummaryCards({
  transactions,
}: {
  transactions: transactionSchemaType;
}) {
  const stats = getSummaryStats(transactions);

  const cards = [
    {
      title: "Total Balance",
      value: `$${stats.totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Wallet,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: stats.totalBalance >= 0 ? "positive" : "negative",
    },
    {
      title: "Total Income",
      value: `$${stats.totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "positive",
    },
    {
      title: "Total Expenses",
      value: `$${stats.totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
      trend: "negative",
    },
    {
      title: "Transactions",
      value: stats.transactionCount.toLocaleString(),
      icon: Receipt,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "neutral",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={index}
            className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {card.value}
                  </p>
                </div>
                <div className={`${card.bgColor} ${card.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
