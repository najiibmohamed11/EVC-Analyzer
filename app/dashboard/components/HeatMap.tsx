import { transactionSchemaType } from "@/app/schema/transactions";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import {
  ArrowLeftRight,
  Calendar,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React from "react";
const groupTransactions = (transactions: transactionSchemaType) => {
  //0 #FFE8E6
  // 1-2 #FFC0B8
  // 3-5 #FF6B58
  // 6-8#FF462E
  const groupedTransactions = new Map<
    string,
    { transactionCount: number; credit: number; debit: number; net: number }
  >();
  transactions.forEach((transaction) => {
    const date = transaction.date.split(" ")[0];
    if (groupedTransactions.has(date)) {
      const groupedTransactionsData = groupedTransactions.get(date);
      if (!groupedTransactionsData) return;
      const transactionCount = groupedTransactionsData.transactionCount + 1;
      const credit = groupedTransactionsData.credit + transaction.credit;
      const debit = groupedTransactionsData.debit + transaction.debit;
      const net = credit - debit;
      groupedTransactions.set(date, { transactionCount, credit, debit, net });
      return;
    }
    groupedTransactions.set(date, {
      transactionCount: 1,
      credit: transaction.credit,
      debit: transaction.debit,
      net: transaction.credit - transaction.debit,
    });
  });

  return groupedTransactions;
};
const getContainerColor = (date: Date, transactions: transactionSchemaType) => {
  const groupedTransactions = groupTransactions(transactions);
  const formatedDate = date.toISOString().split("T")[0];
  const thidDateTransaction = groupedTransactions.get(formatedDate);
  if (!thidDateTransaction) return "#f5f7fa ";
  if (thidDateTransaction.transactionCount <= 2) {
    return "#FFC0B8";
  } else if (thidDateTransaction.transactionCount <= 5) {
    return "#FF6B58";
  } else if (thidDateTransaction.transactionCount >= 6) {
    return "#FF462E";
  }
  return "#FFE8E6";
};
function HeatMap({ transactions }: { transactions: transactionSchemaType }) {
  const containers = Array.from({ length: 90 }, (_, index) => {
    const today = new Date();
    today.setDate(today.getDate() - index);

    return today;
  });
  containers.reverse();
  const daysInTheWeek = containers.slice(0, 7);

  return (
    <div className="grid grid-cols-7 gap-1 ">
      {daysInTheWeek.map((day, index) => (
        <div key={index} className="h-5 text-center">
          {day.toLocaleDateString("en-us", { weekday: "short" })}
        </div>
      ))}

      {containers.map((date, index) => (
        <HoverCard key={index}>
          <HoverCardTrigger asChild>
            <div
              className={`h-10`}
              style={{ backgroundColor: getContainerColor(date, transactions) }}
            ></div>
          </HoverCardTrigger>
          <HoverCardContentComponent transactions={transactions} date={date} />
        </HoverCard>
      ))}
    </div>
  );
}

export default HeatMap;

const HoverCardContentComponent = ({
  date,
  transactions,
}: {
  date: Date;
  transactions: transactionSchemaType;
}) => {
  const transactionsMap = groupTransactions(transactions);
  const formatedDate = date.toISOString().split("T")[0];
  const thidDateTransaction = transactionsMap.get(formatedDate);
  return (
    <HoverCardContent className="p-4 rounded-xl shadow-md bg-white space-y-4">
      <div className="flex justify-between items-center">
        <p className="flex items-center gap-2 text-sm text-gray-700">
          <Calendar className="w-4 h-4" /> {date.toLocaleDateString()}
        </p>
        <p className="flex items-center gap-2 text-sm font-semibold text-green-600">
          <TrendingUp className="w-4 h-4" /> ${thidDateTransaction?.credit ?? 0}
        </p>
      </div>

      <div className="flex justify-between items-center border-t pt-3">
        <p className="flex items-center gap-2 text-sm text-gray-700">
          <ArrowLeftRight className="w-4 h-4" />{" "}
          {thidDateTransaction?.transactionCount ?? "no transaction"}{" "}
          transactions
        </p>
        <p className="flex items-center gap-2 text-sm font-semibold text-red-600">
          <TrendingDown className="w-4 h-4" /> $
          {thidDateTransaction?.debit ?? 0}
        </p>
      </div>
    </HoverCardContent>
  );
};
