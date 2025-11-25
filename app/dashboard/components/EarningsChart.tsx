"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, LineChart, Line, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { transactionSchemaType } from "@/app/schema/transactions"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
export const description = "A multiple bar chart"

// const chartData = [
//   { month: "January", desktop: 186, mobile: 80 },
//   { month: "February", desktop: 305, mobile: 200 },
//   { month: "March", desktop: 237, mobile: 120 },
//   { month: "April", desktop: 73, mobile: 190 },
//   { month: "May", desktop: 209, mobile: 130 },
//   { month: "June", desktop: 214, mobile: 140 },
// ]

const chartConfig = {
  desktop: {
    label: "income",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "expense",
    color: "var(--chart-2)",
  },
  balance: {
    label: "balance",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig
const formatDate = (d: Date) =>
  d.toISOString().split("T")[0]
const getLastWeekTransactions=(transactions:transactionSchemaType)=>{
  const reversedTransactions=[...transactions]
  reversedTransactions.reverse()
    const today= new Date()
    const weekTransactionData:{day:string,income:number,expense:number}[]=[ ];
    for(let i=6; i>=0;i--){   
        const thisDate=new Date()
        thisDate.setDate(thisDate.getDate()-i)
        const dayNameOfTheTransactionDate=thisDate.toLocaleString('en-us',{weekday:"short"});
       const sameDateTransactions= transactions.filter((transaction)=>{
        const transactionDate=new Date(transaction.date.split(" ")[0])
        return formatDate(thisDate)===formatDate(transactionDate)
       })
       const credit= sameDateTransactions.reduce((total,transaction)=>total+transaction.credit,0)     
       const debit= sameDateTransactions.reduce((total,transaction)=>total+transaction.debit,0)     
       weekTransactionData.push({day:dayNameOfTheTransactionDate,income:credit,expense:debit})
       console.log('sameDateTransactions',sameDateTransactions,thisDate)
    }
    return weekTransactionData
}

  function getMonthAndDayName(date:Date){
     const d = date.getDate();
  const m = date.getMonth() + 1; // month is 0-based
  return `${d}/${m}`;
  }
  function normalize(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Helper function to get days into current week (Friday-based)
// Returns 0 for Friday, 1 for Saturday, ..., 6 for Thursday
function getDaysIntoWeek(date: Date): number {
  // JavaScript: Sunday=0, Monday=1, ..., Friday=5, Saturday=6
  // We want: Friday=0, Saturday=1, ..., Thursday=6
  // Formula: (getDay() + 2) % 7
  return (date.getDay() + 2) % 7;
}

// Helper function to get the start of the week (most recent Friday)
function getStartOfWeek(date: Date): Date {
  const normalized = normalize(date);
  const daysIntoWeek = getDaysIntoWeek(normalized);
  const startOfWeek = new Date(normalized);
  startOfWeek.setDate(startOfWeek.getDate() - daysIntoWeek);
  return startOfWeek;
}
function getLastMonthTransaction(transactions: transactionSchemaType) {
  const weekTransactionData: { day: string; income: number; expense: number }[] = [];

  // normalize today to midnight
  const today = normalize(new Date());
  const startOfCurrentWeek = getStartOfWeek(today);
  const daysIntoWeek = getDaysIntoWeek(today);
  
  // Calculate tomorrow for current week end
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  for (let i = 4; i > 0; i--) {
    // Calculate week boundaries
    // i=4: 3 weeks ago (oldest)
    // i=3: 2 weeks ago
    // i=2: 1 week ago (last week)
    // i=1: this week (newest)
    
    const weeksBack = i - 1;
    const startDay = new Date(startOfCurrentWeek);
    startDay.setDate(startDay.getDate() - (weeksBack * 7));
    
    let endDay: Date;
    if (i === 1) {
      // This week: end is tomorrow to include today
      endDay = tomorrow;
    } else {
      // Previous weeks: end is the start of the next week
      endDay = new Date(startDay);
      endDay.setDate(endDay.getDate() + 7);
    }

    // Normalize both
    const normalizedStart = normalize(startDay);
    const normalizedEnd = normalize(endDay);

    console.log("RANGE:", normalizedStart, "→", normalizedEnd, `(Week ${i}, days into week: ${daysIntoWeek})`);

    const sameRange = transactions.filter((t) => {
      const transactionDate = normalize(new Date(t.date.split(" ")[0]));
      return transactionDate >= normalizedStart && transactionDate < normalizedEnd;
    });

    const credit = sameRange.reduce((sum, t) => sum + t.credit, 0);
    const debit = sameRange.reduce((sum, t) => sum + t.debit, 0);
    
    // Create label
    let label: string;
    if (i === 1) {
      label = "This week";
    } else if (i === 2) {
      label = "Last week";
    } else {
      label = `${getMonthAndDayName(normalizedStart)} -- ${getMonthAndDayName(new Date(normalizedEnd.getTime() - 1))}`;
    }
    
    weekTransactionData.push({
      day: label,
      income: credit,
      expense: debit,
    });
  }

  return weekTransactionData;
}

// Get balance over time for week view (last 7 days)
function getBalanceOverTimeWeek(transactions: transactionSchemaType) {
  const balanceData: { day: string; balance: number }[] = [];
  const today = new Date();
  
  // Sort transactions by date to ensure we get the latest balance
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = new Date(a.date.split(" ")[0]).getTime();
    const dateB = new Date(b.date.split(" ")[0]).getTime();
    return dateA - dateB;
  });
  
  for (let i = 6; i >= 0; i--) {
    const thisDate = new Date();
    thisDate.setDate(thisDate.getDate() - i);
    const dayName = thisDate.toLocaleString('en-us', { weekday: "short" });
    
    // Find the latest transaction on or before this date
    const normalizedThisDate = normalize(thisDate);
    let latestTransaction = null;
    
    for (let j = sortedTransactions.length - 1; j >= 0; j--) {
      const transaction = sortedTransactions[j];
      const transactionDate = normalize(new Date(transaction.date.split(" ")[0]));
      if (transactionDate <= normalizedThisDate) {
        latestTransaction = transaction;
        break;
      }
    }
    
    const balance = latestTransaction ? latestTransaction.balance : 0;
    
    balanceData.push({
      day: dayName,
      balance: balance,
    });
  }
  
  return balanceData;
}

// Get balance over time for month view (last 4 weeks)
function getBalanceOverTimeMonth(transactions: transactionSchemaType) {
  const balanceData: { day: string; balance: number }[] = [];
  const today = normalize(new Date());
  const startOfCurrentWeek = getStartOfWeek(today);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Sort transactions by date to ensure we get the latest balance
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = new Date(a.date.split(" ")[0]).getTime();
    const dateB = new Date(b.date.split(" ")[0]).getTime();
    return dateA - dateB;
  });

  for (let i = 4; i > 0; i--) {
    const weeksBack = i - 1;
    const startDay = new Date(startOfCurrentWeek);
    startDay.setDate(startDay.getDate() - (weeksBack * 7));
    
    let endDay: Date;
    if (i === 1) {
      endDay = tomorrow;
    } else {
      endDay = new Date(startDay);
      endDay.setDate(endDay.getDate() + 7);
    }

    const normalizedEnd = normalize(endDay);
    
    // Find the latest transaction up to the end of this week
    let latestTransaction = null;
    for (let j = sortedTransactions.length - 1; j >= 0; j--) {
      const transaction = sortedTransactions[j];
      const transactionDate = normalize(new Date(transaction.date.split(" ")[0]));
      if (transactionDate < normalizedEnd) {
        latestTransaction = transaction;
        break;
      }
    }
    
    const balance = latestTransaction ? latestTransaction.balance : 0;
    
    // Create label
    let label: string;
    if (i === 1) {
      label = "This week";
    } else if (i === 2) {
      label = "Last week";
    } else {
      const normalizedStart = normalize(startDay);
      label = `${getMonthAndDayName(normalizedStart)} -- ${getMonthAndDayName(new Date(normalizedEnd.getTime() - 1))}`;
    }
    
    balanceData.push({
      day: label,
      balance: balance,
    });
  }

  return balanceData;
}

export function ChartBarMultiple({transactions}:{transactions:transactionSchemaType}) {
  const [transactionsDateType,setTransactionsDateType]=useState<'week'|'month'>('week')
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  const lastweekTransactions=getLastWeekTransactions(transactions)
  const lastMonthTransactions=getLastMonthTransaction(transactions)
  const balanceWeekData = getBalanceOverTimeWeek(transactions)
  const balanceMonthData = getBalanceOverTimeMonth(transactions)
  
  const chartTitle = chartType === 'line' ? 'Balance' : 'Earnings'
  const balanceData = transactionsDateType === 'week' ? balanceWeekData : balanceMonthData
  const earningsData = transactionsDateType === 'week' ? lastweekTransactions : lastMonthTransactions
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-lg font-bold">{chartTitle}</CardTitle>
        <div className="flex gap-4">
          <Tabs className="w-auto" defaultValue={transactionsDateType} value={transactionsDateType} onValueChange={(value)=>setTransactionsDateType(value as 'week'|'month')}>
            <TabsList className="bg-transparent p-0 gap-4" >
              <TabsTrigger
                value="week"
                className="bg-transparent p-0 text-xs font-bold uppercase text-slate-400 data-[state=active]:bg-transparent data-[state=active]:text-slate-900 data-[state=active]:shadow-none data-[state=active]:underline data-[state=active]:decoration-2 data-[state=active]:underline-offset-4 data-[state=active]:decoration-slate-900">
                Week
              </TabsTrigger>
              <TabsTrigger
                value="month"
                className="bg-transparent p-0 text-xs font-bold uppercase text-slate-400 data-[state=active]:bg-transparent data-[state=active]:text-slate-900 data-[state=active]:shadow-none  data-[state=active]:underline data-[state=active]:decoration-2 data-[state=active]:underline-offset-4 data-[state=active]:decoration-slate-900"
              >
                Month
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs className="w-auto" defaultValue={chartType} value={chartType} onValueChange={(value)=>setChartType(value as 'line'|'bar')}>
            <TabsList className="bg-transparent p-0 gap-4" >
              <TabsTrigger
                value="line"
                className="bg-transparent p-0 text-xs font-bold uppercase text-slate-400 data-[state=active]:bg-transparent data-[state=active]:text-slate-900 data-[state=active]:shadow-none data-[state=active]:underline data-[state=active]:decoration-2 data-[state=active]:underline-offset-4 data-[state=active]:decoration-slate-900">
                Line
              </TabsTrigger>
              <TabsTrigger
                value="bar"
                className="bg-transparent p-0 text-xs font-bold uppercase text-slate-400 data-[state=active]:bg-transparent data-[state=active]:text-slate-900 data-[state=active]:shadow-none  data-[state=active]:underline data-[state=active]:decoration-2 data-[state=active]:underline-offset-4 data-[state=active]:decoration-slate-900"
              >
                Bar
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          {chartType === 'line' ? (
            <LineChart accessibilityLayer data={balanceData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <ChartTooltip
                cursor={true}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="var(--color-balance)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-balance)", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart accessibilityLayer data={earningsData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={true}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar dataKey="expense" fill="var(--color-desktop)" radius={4} />
              <Bar dataKey="income" fill="var(--color-mobile)" radius={4} />
            </BarChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
