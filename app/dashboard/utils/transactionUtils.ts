import { transactionSchemaType } from "@/app/schema/transactions";

export interface ContactSummary {
  name: string;
  transactionCount: number;
  totalCredit: number;
  totalDebit: number;
  netAmount: number;
  lastTransactionDate: string;
}

export interface SummaryStats {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  transactionCount: number;
  averageTransactionSize: number;
}

export interface ContactStats {
  name: string;
  totalCredit: number;
  totalDebit: number;
  netAmount: number;
  transactionCount: number;
  firstTransactionDate: string;
  lastTransactionDate: string;
  averageCredit: number;
  averageDebit: number;
}

// Get summary statistics for all transactions
export function getSummaryStats(
  transactions: transactionSchemaType,
): SummaryStats {
  if (transactions.length === 0) {
    return {
      totalBalance: 0,
      totalIncome: 0,
      totalExpenses: 0,
      transactionCount: 0,
      averageTransactionSize: 0,
    };
  }

  const totalIncome = transactions.reduce((sum, t) => sum + t.credit, 0);
  const totalExpenses = transactions.reduce((sum, t) => sum + t.debit, 0);
  const latestTransaction = transactions[transactions.length - 1];
  const totalBalance = latestTransaction ? latestTransaction.balance : 0;

  const allAmounts = transactions.map((t) => t.credit + t.debit);
  const averageTransactionSize =
    allAmounts.length > 0
      ? allAmounts.reduce((sum, amt) => sum + amt, 0) / allAmounts.length
      : 0;

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    transactionCount: transactions.length,
    averageTransactionSize,
  };
}

// Get top contacts by transaction volume or amount
export function getTopContacts(
  transactions: transactionSchemaType,
  limit: number = 10,
): ContactSummary[] {
  const contactMap = new Map<string, ContactSummary>();

  transactions.forEach((transaction) => {
    const name = transaction.otherParty;
    const existing = contactMap.get(name);

    if (existing) {
      existing.transactionCount += 1;
      existing.totalCredit += transaction.credit;
      existing.totalDebit += transaction.debit;
      existing.netAmount = existing.totalCredit - existing.totalDebit;
      if (new Date(transaction.date) > new Date(existing.lastTransactionDate)) {
        existing.lastTransactionDate = transaction.date;
      }
    } else {
      contactMap.set(name, {
        name,
        transactionCount: 1,
        totalCredit: transaction.credit,
        totalDebit: transaction.debit,
        netAmount: transaction.credit - transaction.debit,
        lastTransactionDate: transaction.date,
      });
    }
  });

  const contacts = Array.from(contactMap.values());

  // Sort by transaction count first, then by absolute net amount
  contacts.sort((a, b) => {
    if (b.transactionCount !== a.transactionCount) {
      return b.transactionCount - a.transactionCount;
    }
    return Math.abs(b.netAmount) - Math.abs(a.netAmount);
  });

  return contacts.slice(0, limit);
}

// Get all transactions for a specific contact
export function getContactTransactions(
  transactions: transactionSchemaType,
  contactName: string,
): transactionSchemaType {
  return transactions.filter((t) => t.otherParty === contactName);
}

// Get detailed stats for a specific contact
export function getContactStats(
  transactions: transactionSchemaType,
  contactName: string,
): ContactStats | null {
  const contactTransactions = getContactTransactions(transactions, contactName);

  if (contactTransactions.length === 0) {
    return null;
  }

  const totalCredit = contactTransactions.reduce((sum, t) => sum + t.credit, 0);
  const totalDebit = contactTransactions.reduce((sum, t) => sum + t.debit, 0);
  const netAmount = totalCredit - totalDebit;

  const dates = contactTransactions.map((t) => new Date(t.date));
  const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());

  const creditTransactions = contactTransactions.filter((t) => t.credit > 0);
  const debitTransactions = contactTransactions.filter((t) => t.debit > 0);

  const averageCredit =
    creditTransactions.length > 0
      ? creditTransactions.reduce((sum, t) => sum + t.credit, 0) /
        creditTransactions.length
      : 0;

  const averageDebit =
    debitTransactions.length > 0
      ? debitTransactions.reduce((sum, t) => sum + t.debit, 0) /
        debitTransactions.length
      : 0;

  return {
    name: contactName,
    totalCredit,
    totalDebit,
    netAmount,
    transactionCount: contactTransactions.length,
    firstTransactionDate: sortedDates[0].toISOString(),
    lastTransactionDate: sortedDates[sortedDates.length - 1].toISOString(),
    averageCredit,
    averageDebit,
  };
}

// Get monthly trends
export function getMonthlyTrends(transactions: transactionSchemaType) {
  const monthlyMap = new Map<
    string,
    { income: number; expenses: number; count: number }
  >();

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    const existing = monthlyMap.get(monthKey);
    if (existing) {
      existing.income += transaction.credit;
      existing.expenses += transaction.debit;
      existing.count += 1;
    } else {
      monthlyMap.set(monthKey, {
        income: transaction.credit,
        expenses: transaction.debit,
        count: 1,
      });
    }
  });

  return Array.from(monthlyMap.entries())
    .map(([key, data]) => ({
      month: new Date(key + "-01").toLocaleString("default", {
        month: "short",
        year: "numeric",
      }),
      income: data.income,
      expenses: data.expenses,
      count: data.count,
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
}

// Get transaction insights
export function getTransactionInsights(transactions: transactionSchemaType) {
  if (transactions.length === 0) {
    return {
      mostActiveDay: null,
      averageTransactionSize: 0,
      largestTransaction: null,
      smallestTransaction: null,
    };
  }

  // Most active day of week
  const dayCounts = new Map<number, number>();
  transactions.forEach((t) => {
    const day = new Date(t.date).getDay();
    dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
  });

  const mostActiveDayIndex = Array.from(dayCounts.entries()).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0];

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const mostActiveDay =
    mostActiveDayIndex !== undefined ? dayNames[mostActiveDayIndex] : null;

  // Average transaction size
  const allAmounts = transactions.map((t) => t.credit + t.debit);
  const averageTransactionSize =
    allAmounts.reduce((sum, amt) => sum + amt, 0) / allAmounts.length;

  // Largest and smallest transactions
  const allTransactions = transactions
    .map((t) => ({
      amount: t.credit + t.debit,
      transaction: t,
    }))
    .filter((t) => t.amount > 0);

  const sortedByAmount = [...allTransactions].sort(
    (a, b) => b.amount - a.amount,
  );
  const largestTransaction = sortedByAmount[0]?.transaction || null;
  const smallestTransaction =
    sortedByAmount[sortedByAmount.length - 1]?.transaction || null;

  return {
    mostActiveDay,
    averageTransactionSize,
    largestTransaction,
    smallestTransaction,
  };
}
