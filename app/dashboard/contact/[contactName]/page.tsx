"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
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
  TooltipProps,
} from "recharts";

import {
  transactionSchema,
  transactionSchemaType,
} from "@/app/schema/transactions";

import ProfileAvatar from "../../components/ProfileAvatar";

// --- Theme Colors ---
const COLORS = {
  income: "#10b981", // Emerald 500
  expense: "#f43f5e", // Rose 500
  balance: "#3b82f6", // Blue 500
  grid: "#e2e8f0",
  text: "#64748b",
};

// --- Custom Chart Components ---

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="min-w-[200px] rounded-xl border border-slate-100 bg-white p-4 shadow-xl">
        <p className="mb-2 text-sm font-medium text-slate-500">{label}</p>
        {payload.map((entry, index) => (
          <div
            key={index}
            className="mb-1 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium text-slate-700 capitalize">
                {entry.name}
              </span>
            </div>
            <span className="font-mono text-sm font-bold">
              ${entry.value?.toLocaleString() ?? "0"}
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
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-900" />
      </div>
    );
  if (!contactName)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        opps wrong place!
      </div>
    );
  if (!transactions)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        no transactions
      </div>
    );

  // --- Data Processing ---
  const contactTransactions = transactions.filter(
    (transaction) => transaction.otherParty === contactName,
  );

  const generateStats = () => {
    const statistics = contactTransactions.reduce(
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
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <p className="text-slate-500">Contact not found</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 font-sans text-slate-900 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="-ml-4 text-slate-500 hover:text-slate-900"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </div>

        {/* Header Profile Section */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-5">
            <ProfileAvatar id={contactName} size="lg" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {contactName}
              </h1>
              <div className="mt-1 flex items-center gap-2 text-slate-500">
                <Badge
                  variant="secondary"
                  className="bg-slate-100 font-normal text-slate-600"
                >
                  {stats.transactionCount} Transactions
                </Badge>
                <span>•</span>
                <span className="text-sm">
                  intraacting since{" "}
                  {
                    (
                      contactTransactions[contactTransactions.length - 1]
                        ?.date ?? ""
                    ).split(" ")[0]
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end">
            <p className="mb-1 text-sm font-medium text-slate-500">
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="border-none bg-white shadow-sm ring-1 ring-slate-900/5">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <Badge
                  variant="outline"
                  className="border-emerald-100 bg-emerald-50 text-emerald-600"
                >
                  Income
                </Badge>
              </div>
              <p className="text-sm font-medium text-slate-500">
                Total Received
              </p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                ${stats.totalCredit.toLocaleString()}
              </h3>
            </CardContent>
          </Card>

          <Card className="border-none bg-white shadow-sm ring-1 ring-slate-900/5">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <Badge
                  variant="outline"
                  className="border-rose-100 bg-rose-50 text-rose-600"
                >
                  Expense
                </Badge>
              </div>
              <p className="text-sm font-medium text-slate-500">Total Sent</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                ${stats.totalDebit.toLocaleString()}
              </h3>
            </CardContent>
          </Card>

          <Card className="border-none bg-white shadow-sm ring-1 ring-slate-900/5">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Wallet className="h-5 w-5" />
                </div>
                <Badge
                  variant="outline"
                  className="border-blue-100 bg-blue-50 text-blue-600"
                >
                  Avg
                </Badge>
              </div>
              <p className="text-sm font-medium text-slate-500">
                Avg Transaction
              </p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Large Area Chart */}
          <Card className="border-none shadow-sm ring-1 ring-slate-900/5 lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Cash Flow
                </CardTitle>
                <CardDescription>Income vs Expenses over time</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4 h-[300px] w-full">
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
              <div className="relative h-[200px] w-full">
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
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="block text-xs text-slate-400">
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
              <div className="mt-4 w-full space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="text-slate-600">Incoming</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    ${stats.totalCredit.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-rose-500" />
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
        <Card className="overflow-hidden border-none shadow-sm ring-1 ring-slate-900/5">
          <CardHeader className="flex flex-row items-center justify-between bg-white">
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
                <Filter className="mr-2 h-4 w-4" /> Filter
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
                            <span className="max-w-[300px] truncate font-medium text-slate-900">
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
