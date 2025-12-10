"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight, ArrowDownRight, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { transactionSchemaType } from "@/app/schema/transactions";
// import { getTopContacts } from "../utils/transactionUtils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import ProfileAvatar from "./ProfileAvatar";

interface TopContactsProps {
  transactions: transactionSchemaType;
}

const getTopContacts = (
  transactions: transactionSchemaType,
  limit: number = 10,
) => {
  const toptTransaction = new Map<
    string,
    {
      otherParty: string;
      credit: number;
      debit: number;
      net: number;
      numberOfTransactions: number;
    }
  >();
  transactions.forEach((transaction) => {
    if (toptTransaction.has(transaction.otherParty)) {
      const otherPartInfo = toptTransaction.get(transaction.otherParty);
      if (otherPartInfo === undefined) return;
      const credit = otherPartInfo.credit + transaction.credit;
      const debit = otherPartInfo.debit + transaction.debit;
      const otherParty = transaction.otherParty;
      const newData = {
        otherParty,
        credit,
        debit,
        net: credit - debit,
        numberOfTransactions: otherPartInfo.numberOfTransactions + 1,
      };
      toptTransaction.set(transaction.otherParty, newData);
      return;
    }
    const credit = transaction.credit;
    const debit = transaction.debit;
    const otherParty = transaction.otherParty;
    toptTransaction.set(transaction.otherParty, {
      otherParty,
      credit,
      debit,
      net: credit - debit,
      numberOfTransactions: 1,
    });
  });
  console.log(toptTransaction);

  const topContacts = [...toptTransaction.values()];
  topContacts.sort((a, b) => {
    if (b.numberOfTransactions !== a.numberOfTransactions) {
      return b.numberOfTransactions - a.numberOfTransactions;
    }
    return Math.abs(b.net) - Math.abs(a.net);
  });
  return topContacts;
};
export function TopContacts({ transactions }: TopContactsProps) {
  const router = useRouter();
  const topContacts = getTopContacts(transactions, 5);

  const handleContactClick = (contactName: string) => {
    const encodedName = encodeURIComponent(contactName);
    router.push(`/dashboard/contact/${encodedName}`);
  };

  if (topContacts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 text-center py-8">
            No contacts found
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Top Contacts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topContacts.map((contact, index) => (
            <Link
              href={`/dashboard/contact/${contact.otherParty}`}
              key={contact.otherParty}
              onClick={() => handleContactClick(contact.otherParty)}
              className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all group"
            >
              <ProfileAvatar
                id={contact.otherParty}
                size="md"
                pattern="rings"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate flex gap-1">
                  {contact.otherParty}
                  {index == 0 && <Crown className="text-orange-600" />}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-slate-500">
                    {contact.numberOfTransactions}{" "}
                    {contact.numberOfTransactions === 1
                      ? "transaction"
                      : "transactions"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                {contact.net >= 0 ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <ArrowUpRight className="h-4 w-4" />
                    <span className="font-semibold text-sm">
                      $
                      {Math.abs(contact.net).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <ArrowDownRight className="h-4 w-4" />
                    <span className="font-semibold text-sm">
                      $
                      {Math.abs(contact.net).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
                <span className="text-xs text-slate-500 mt-1">Net</span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
