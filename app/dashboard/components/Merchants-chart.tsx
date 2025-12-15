"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { transactionSchemaType } from "@/app/schema/transactions";

export const description = "A donut chart with text";

const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 287, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 190, fill: "var(--color-other)" },
];

const chartConfig = {
  amount: {
    label: "Visitors",
    color: "#fff",
  },
} satisfies ChartConfig;
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
const getMerChantOwnerName = (description: string) => {
  const regex = /merchant:\s*([\s\S]*?)\s*\(\d+\)/;
  const regexData = description.match(regex);
  return regexData?.[1] ?? "";
};
const getChartConfig = (transaction: transactionSchemaType) => {
  const merchantTransactions = transaction.filter(
    (transaction) => transaction.type === "merchant",
  );
  merchantTransactions.reverse();
  const groupedMerchantTransaction = merchantTransactions.reduce(
    (accumulator, transaction) => {
      const indexOfTransaction = accumulator.findIndex(
        (trans) => trans.merchant === transaction.otherParty,
      );
      if (indexOfTransaction === -1) {
        accumulator.push({
          merchant: transaction.otherParty,
          amount: transaction.debit,
          fill: `#${transaction.otherParty}`,
          ownerName: getMerChantOwnerName(transaction.description),
        });
        return accumulator;
      }
      accumulator[indexOfTransaction] = {
        merchant: transaction.otherParty,
        amount: accumulator[indexOfTransaction].amount + transaction.debit,
        fill: getRandomColor(),
        ownerName: getMerChantOwnerName(transaction.description),
      };
      return accumulator;
    },
    [] as {
      merchant: string;
      amount: number;
      fill: string;
      ownerName: string;
    }[],
  );
  console.log(groupedMerchantTransaction);
  groupedMerchantTransaction.sort((a, b) => b.amount - a.amount);
  return groupedMerchantTransaction;
};

export default function MerchantsChart({
  transactions,
}: {
  transactions: transactionSchemaType;
}) {
  const chartConf = getChartConfig(transactions);
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, []);

  return (
    <div className="flex items-center flex-col gap-4 j">
      <ChartContainer config={chartConfig} className="w-[180px] h-[180px] ">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartConf}
            dataKey="amount"
            nameKey="merchant"
            innerRadius={60}
            strokeWidth={5}
            paddingAngle={4}
            cornerRadius={8}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {totalVisitors.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                      >
                        amount
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="flex flex-col gap-2 w-full">
        {chartConf.map((chart) => (
          <div className="flex items-center w-full gap-3" key={chart.merchant}>
            {/* Color Square */}
            <div
              className="w-4 h-4 rounded-xl"
              style={{ backgroundColor: chart.fill }}
            />

            {/* Merchant Name wide to take space */}
            <div className="flex-1 text-left">{chart.ownerName}</div>

            {/* Amount aligned to far right */}
            <div className="text-right font-medium">{chart.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
