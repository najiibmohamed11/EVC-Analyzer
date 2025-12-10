"use client";

import {
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { transactionSchemaType } from "@/app/schema/transactions";
import {
  getContactTransactions,
  getContactStats,
} from "../utils/transactionUtils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { useMemo } from "react";

interface ContactDetailProps {
  contactName: string | null;
  transactions: transactionSchemaType;
  open: boolean;
  onClose: () => void;
}

const chartConfig = {
  credit: {
    label: "Received",
    color: "hsl(142, 76%, 36%)",
  },
  debit: {
    label: "Sent",
    color: "hsl(0, 84%, 60%)",
  },
  balance: {
    label: "Balance",
    color: "hsl(217, 91%, 60%)",
  },
} satisfies ChartConfig;

const COLORS = ["#10b981", "#ef4444", "#3b82f6", "#8b5cf6", "#f59e0b"];

export function ContactDetail({
  contactName,
  transactions,
  open,
  onClose,
}: ContactDetailProps) {
  const contactTransactions = useMemo(() => {
    if (!contactName) return [];
    return getContactTransactions(transactions, contactName);
  }, [contactName, transactions]);

  const stats = useMemo(() => {
    if (!contactName) return null;
    return getContactStats(transactions, contactName);
  }, [contactName, transactions]);

  // Prepare timeline data (balance changes over time)
  const timelineData = useMemo(() => {
    if (contactTransactions.length === 0) return [];

    const sorted = [...contactTransactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    let runningBalance = 0;
    return sorted.map((t) => {
      runningBalance += t.credit - t.debit;
      return {
        date: new Date(t.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        balance: runningBalance,
        credit: t.credit,
        debit: t.debit,
      };
    });
  }, [contactTransactions]);

  // Prepare pie chart data (credit vs debit)
  const pieData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Received", value: stats.totalCredit },
      { name: "Sent", value: stats.totalDebit },
    ].filter((item) => item.value > 0);
  }, [stats]);

  // Prepare frequency data (transactions by month)
  const frequencyData = useMemo(() => {
    if (contactTransactions.length === 0) return [];

    const monthlyMap = new Map<string, number>();
    contactTransactions.forEach((t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);
    });

    return Array.from(monthlyMap.entries())
      .map(([key, count]) => ({
        month: new Date(key + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        count,
      }))
      .sort(
        (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime(),
      );
  }, [contactTransactions]);

  // Prepare area chart data (amount flow over time)
  const areaData = useMemo(() => {
    if (contactTransactions.length === 0) return [];

    const sorted = [...contactTransactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const monthlyMap = new Map<string, { credit: number; debit: number }>();
    sorted.forEach((t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      const existing = monthlyMap.get(monthKey);
      if (existing) {
        existing.credit += t.credit;
        existing.debit += t.debit;
      } else {
        monthlyMap.set(monthKey, { credit: t.credit, debit: t.debit });
      }
    });

    return Array.from(monthlyMap.entries())
      .map(([key, data]) => ({
        month: new Date(key + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        received: data.credit,
        sent: data.debit,
      }))
      .sort(
        (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime(),
      );
  }, [contactTransactions]);

  if (!contactName || !stats) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 text-blue-700 w-16 h-16 rounded-full flex items-center justify-center font-semibold text-xl">
              {getInitials(contactName)}
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                {contactName}
              </DialogTitle>
              <p className="text-sm text-slate-500 mt-1">
                {stats.transactionCount}{" "}
                {stats.transactionCount === 1 ? "transaction" : "transactions"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-50 text-green-600 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Received</p>
                  <p className="text-lg font-bold text-green-600">
                    $
                    {stats.totalCredit.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-50 text-red-600 p-2 rounded-lg">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Sent</p>
                  <p className="text-lg font-bold text-red-600">
                    $
                    {stats.totalDebit.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Net Amount</p>
                  <p
                    className={`text-lg font-bold ${stats.netAmount >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    $
                    {Math.abs(stats.netAmount).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-50 text-purple-600 p-2 rounded-lg">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Avg Transaction</p>
                  <p className="text-lg font-bold text-slate-900">
                    $
                    {(
                      (stats.totalCredit + stats.totalDebit) /
                      stats.transactionCount
                    ).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Pie Chart - Credit vs Debit */}
          {pieData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Money Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Bar Chart - Transaction Frequency */}
          {frequencyData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Transaction Frequency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <BarChart data={frequencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Line Chart - Balance Timeline */}
          {timelineData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Balance Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Area Chart - Amount Flow */}
          {areaData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Amount Flow Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <AreaChart data={areaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip />
                    <Area
                      type="monotone"
                      dataKey="received"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="sent"
                      stackId="1"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.6}
                    />
                    <Legend />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Transaction List */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Received</TableHead>
                    <TableHead className="text-right">Sent</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...contactTransactions]
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime(),
                    )
                    .map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {transaction.description}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {transaction.credit > 0
                            ? `$${transaction.credit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          {transaction.debit > 0
                            ? `$${transaction.debit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          $
                          {transaction.balance.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
