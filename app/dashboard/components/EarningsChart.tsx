"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
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
import HeatMap from "./HeatMap"
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
/**
 * Gets the start of the week (Monday) for a given date
 * @param date - The date to get the week start for
 * @returns A normalized date representing Monday of that week
 */
function getWeekStart(date: Date): Date {
  const normalized = normalize(date);
  const dayOfWeek = normalized.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // Calculate days to subtract to get to Monday (0 = Monday)
  // If Sunday (0), subtract 6 days; if Monday (1), subtract 0 days; etc.
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(normalized);
  weekStart.setDate(weekStart.getDate() - daysToSubtract);
  return normalize(weekStart);
}

const getTransactionsWeNeed = (
  transactions: transactionSchemaType,
  lastDayOfTheTransaction: Date
) => {
  const lastDay = normalize(lastDayOfTheTransaction).getTime();

  return transactions.filter((transaction) => {
    const transactionDate = normalize(new Date(transaction.date)).getTime();
    return transactionDate <= lastDay;
  });
};

const getDaysIntoWeek=(today:Date)=>{

  return (today.getDay()+1)%7
}

const getStartOfWeek=(today:Date)=>{
  const daysIntoWeek=getDaysIntoWeek(today)
  const weekStarted=new Date(today)
  weekStarted.setDate(weekStarted.getDate()-daysIntoWeek)
  return weekStarted
}



function getLastMonthTransaction(transactions: transactionSchemaType) {
  const weekTransactionData: { day: string; income: number; expense: number }[] = [];
  console.log(transactions)

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
    // console.log("the start day",startDay,endDay)

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


export function ChartBarMultiple({transactions}:{transactions:transactionSchemaType}) {
  const [transactionsDateType,setTransactionsDateType]=useState<'week'|'month'>('month')
  const lastweekTransactions=getLastWeekTransactions(transactions)
  const lastMonthTransactions=getLastMonthTransaction(transactions)
  return (
    <div className="min-w-3xl ">
      <div className="flex justify-between w-full items-center">
        <h2>title</h2>
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
      </div>
       {/* <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={transactionsDateType==="week"?lastweekTransactions:lastMonthTransactions}>
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
        </ChartContainer> */}
        <HeatMap transactions={transactions}/>
    </div>
  )
}
