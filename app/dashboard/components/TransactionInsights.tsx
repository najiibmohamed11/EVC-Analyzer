"use client";

import { Calendar, TrendingUp, DollarSign, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { transactionSchemaType } from "@/app/schema/transactions";
import {
  getTransactionInsights,
  getMonthlyTrends,
} from "../utils/transactionUtils";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(142, 76%, 36%)",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(0, 84%, 60%)",
  },
} satisfies ChartConfig;

export function TransactionInsights({
  transactions,
}: {
  transactions: transactionSchemaType;
}) {
  const insights = getTransactionInsights(transactions);
  const monthlyTrends = getMonthlyTrends(transactions);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            Transaction Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50">
              <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Most Active Day</p>
                <p className="text-sm font-semibold text-slate-900">
                  {insights.mostActiveDay || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50">
              <div className="bg-green-50 text-green-600 p-2 rounded-lg">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Avg Transaction</p>
                <p className="text-sm font-semibold text-slate-900">
                  $
                  {insights.averageTransactionSize.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            {insights.largestTransaction && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50">
                <div className="bg-purple-50 text-purple-600 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Largest Transaction</p>
                  <p className="text-sm font-semibold text-slate-900">
                    $
                    {(
                      insights.largestTransaction.credit +
                      insights.largestTransaction.debit
                    ).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            )}

            {insights.smallestTransaction && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50">
                <div className="bg-orange-50 text-orange-600 p-2 rounded-lg">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Smallest Transaction</p>
                  <p className="text-sm font-semibold text-slate-900">
                    $
                    {(
                      insights.smallestTransaction.credit +
                      insights.smallestTransaction.debit
                    ).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {monthlyTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip
                  cursor={true}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar
                  dataKey="income"
                  fill="hsl(142, 76%, 36%)"
                  radius={4}
                  name="Income"
                />
                <Bar
                  dataKey="expenses"
                  fill="hsl(0, 84%, 60%)"
                  radius={4}
                  name="Expenses"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
