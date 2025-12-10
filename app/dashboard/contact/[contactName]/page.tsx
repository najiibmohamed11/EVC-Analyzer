"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  MoreHorizontal,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  transactionSchema,
  transactionSchemaType,
} from "@/app/schema/transactions";
import {
  getContactTransactions,
  getContactStats,
} from "../../utils/transactionUtils";
import { statSync } from "fs";
import ProfileAvatar from "../../components/ProfileAvatar";

// --- Theme Colors ---
const COLORS = {
  income: "#10b981", // Emerald 500
  expense: "#f43f5e", // Rose 500
  balance: "#3b82f6", // Blue 500
  grid: "#e2e8f0",
  text: "#64748b",
};
type SummaryStats = {
  netAmount: number;
  totalCredit: number;
  totalDebit: number;
  transactionCount: number;
  averageTransactionSize: number;
};
// --- Custom Chart Components ---

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-xl min-w-[200px]">
        <p className="text-sm font-medium text-slate-500 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 mb-1"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium text-slate-700 capitalize">
                {entry.name}
              </span>
            </div>
            <span className="text-sm font-bold font-mono">
              ${entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contactName = decodeURIComponent(params.contactName as string);

  const [transactions, setTransactions] =
    useState<transactionSchemaType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedTransactions = localStorage.getItem("transactions");
    if (!storedTransactions) {
      setLoading(false);
      return;
    }
    const result = transactionSchema.safeParse(JSON.parse(storedTransactions));
    if (result.success) {
      setTransactions(JSON.parse(storedTransactions) as transactionSchemaType);
    }
    setLoading(false);
  }, []);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    );
  if (!contactName)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        opps wrong place!
      </div>
    );
  if (!transactions)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        no transactions
      </div>
    );

  // --- Data Processing ---
  const contactTransactions = transactions.filter(
    (transaction) => transaction.otherParty === contactName,
  );

  const generateStats = () => {
    let statistics = contactTransactions.reduce(
      (acc, transaction) => {
        acc.totalCredit += transaction.credit;
        acc.totalDebit += transaction.debit;
        acc.transactionCount += 1;
        return acc;
      },
      { totalCredit: 0, totalDebit: 0, transactionCount: 0 },
    );

    return {
      ...statistics,
      averageTransactionSize:
        (statistics.totalDebit + statistics.totalCredit) /
        statistics.transactionCount,
      netAmount: statistics.totalCredit - statistics.totalDebit,
    };
  };

  const stats = generateStats();

  const generateChartData = () => {
    if (contactTransactions.length === 0) return [];

    const sorted = [...contactTransactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const monthlyMap = new Map<string, { income: number; expense: number }>();

    sorted.forEach((t) => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      const current = monthlyMap.get(key) || { income: 0, expense: 0 };
      monthlyMap.set(key, {
        income: current.income + t.credit,
        expense: current.expense + t.debit,
      });
    });

    return Array.from(monthlyMap.entries()).map(([key, data]) => ({
      date: new Date(key + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
      income: data.income,
      expense: data.expense,
    }));
  };
  const chartData = generateChartData();

  const pieData = [
    { name: "Income", value: stats.totalCredit, color: COLORS.income },
    { name: "Expense", value: stats.totalDebit, color: COLORS.expense },
  ].filter((i) => i.value > 0);

  // --- Render ---

  if (!stats || !contactName)
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <p className="text-slate-500">Contact not found</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-slate-500 hover:text-slate-900 -ml-4"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </div>

        {/* Header Profile Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <ProfileAvatar id={contactName} size="lg" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {contactName}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-slate-500">
                <Badge
                  variant="secondary"
                  className="font-normal bg-slate-100 text-slate-600"
                >
                  {stats.transactionCount} Transactions
                </Badge>
                <span>•</span>
                <span className="text-sm">
                  intraacting since{" "}
                  {
                    (contactTransactions[
                      contactTransactions.length - 1
                    ]?.date).split(" ")[0]
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end">
            <p className="text-sm font-medium text-slate-500 mb-1">
              Net Balance
            </p>
            <div
              className={`text-4xl font-bold tracking-tight ${stats.netAmount >= 0 ? "text-slate-900" : "text-rose-600"}`}
            >
              {stats.netAmount < 0 && "-"}$
              {Math.abs(stats.netAmount).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none shadow-sm ring-1 ring-slate-900/5 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <Badge
                  variant="outline"
                  className="text-emerald-600 bg-emerald-50 border-emerald-100"
                >
                  Income
                </Badge>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Total Received
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                ${stats.totalCredit.toLocaleString()}
              </h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-slate-900/5 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <Badge
                  variant="outline"
                  className="text-rose-600 bg-rose-50 border-rose-100"
                >
                  Expense
                </Badge>
              </div>
              <p className="text-sm text-slate-500 font-medium">Total Sent</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                ${stats.totalDebit.toLocaleString()}
              </h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-slate-900/5 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Wallet className="h-5 w-5" />
                </div>
                <Badge
                  variant="outline"
                  className="text-blue-600 bg-blue-50 border-blue-100"
                >
                  Avg
                </Badge>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Avg Transaction
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                $
                {(
                  (stats.totalCredit + stats.totalDebit) /
                  stats.transactionCount
                ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h3>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Large Area Chart */}
          <Card className="lg:col-span-2 border-none shadow-sm ring-1 ring-slate-900/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Cash Flow
                </CardTitle>
                <CardDescription>Income vs Expenses over time</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorIncome"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={COLORS.income}
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor={COLORS.income}
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorExpense"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={COLORS.expense}
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor={COLORS.expense}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={COLORS.grid}
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: COLORS.text, fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: COLORS.text, fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ stroke: COLORS.grid, strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke={COLORS.income}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorIncome)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      stroke={COLORS.expense}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorExpense)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Donut Chart Summary */}
          <Card className="border-none shadow-sm ring-1 ring-slate-900/5">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Allocation
              </CardTitle>
              <CardDescription>Total Volume Distribution</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          strokeWidth={0}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      formatter={(value: number) => [
                        `$${value.toLocaleString()}`,
                        "",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <span className="text-xs text-slate-400 block">
                      Total Vol
                    </span>
                    <span className="text-lg font-bold text-slate-700">
                      $
                      {(stats.totalCredit + stats.totalDebit).toLocaleString(
                        undefined,
                        { notation: "compact" },
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full space-y-3 mt-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-slate-600">Incoming</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    ${stats.totalCredit.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-slate-600">Outgoing</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    ${stats.totalDebit.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Transactions Table */}
        <Card className="border-none shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
          <CardHeader className="bg-white flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Transaction History
              </CardTitle>
              <CardDescription>
                A list of all payments and transfers.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" /> Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[150px]">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Running Balance</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...contactTransactions]
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime(),
                  )
                  .map((t) => {
                    const isIncome = t.credit > 0;
                    const amount = isIncome ? t.credit : t.debit;
                    return (
                      <TableRow key={t.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium text-slate-600">
                          {new Date(t.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-slate-900 font-medium truncate max-w-[300px]">
                              {t.description}
                            </span>
                            <span className="text-xs text-slate-500">
                              {isIncome ? "Received Payment" : "Sent Payment"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-bold ${isIncome ? "text-emerald-600" : "text-slate-900"}`}
                          >
                            {isIncome ? "+" : "-"}$
                            {amount.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-slate-500">
                          $
                          {t.balance.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4 text-slate-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>
                                Download Receipt
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
