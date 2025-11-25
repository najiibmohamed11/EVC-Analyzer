"use client"

import { useRouter } from "next/navigation"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { transactionSchemaType } from "@/app/schema/transactions"
import { getTopContacts } from "../utils/transactionUtils"

interface TopContactsProps {
  transactions: transactionSchemaType
}

export function TopContacts({ transactions }: TopContactsProps) {
  const router = useRouter()
  const topContacts = getTopContacts(transactions, 10)

  const handleContactClick = (contactName: string) => {
    const encodedName = encodeURIComponent(contactName)
    router.push(`/dashboard/contact/${encodedName}`)
  }

  if (topContacts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 text-center py-8">No contacts found</p>
        </CardContent>
      </Card>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getContactColor = (index: number) => {
    const colors = [
      "bg-blue-100 text-blue-700",
      "bg-green-100 text-green-700",
      "bg-purple-100 text-purple-700",
      "bg-pink-100 text-pink-700",
      "bg-yellow-100 text-yellow-700",
      "bg-indigo-100 text-indigo-700",
      "bg-red-100 text-red-700",
      "bg-teal-100 text-teal-700",
      "bg-orange-100 text-orange-700",
      "bg-cyan-100 text-cyan-700",
    ]
    return colors[index % colors.length]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Top Contacts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topContacts.map((contact, index) => (
            <div
              key={contact.name}
              onClick={() => handleContactClick(contact.name)}
              className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all group"
            >
              <div className={`${getContactColor(index)} w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0`}>
                {getInitials(contact.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{contact.name}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-slate-500">
                    {contact.transactionCount} {contact.transactionCount === 1 ? 'transaction' : 'transactions'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                {contact.netAmount >= 0 ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <ArrowUpRight className="h-4 w-4" />
                    <span className="font-semibold text-sm">
                      ${Math.abs(contact.netAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <ArrowDownRight className="h-4 w-4" />
                    <span className="font-semibold text-sm">
                      ${Math.abs(contact.netAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <span className="text-xs text-slate-500 mt-1">Net</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

