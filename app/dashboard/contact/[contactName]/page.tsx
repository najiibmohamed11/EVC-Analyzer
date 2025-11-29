"use client"

import { useEffect, useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { transactionSchema, transactionSchemaType } from "@/app/schema/transactions"
import {
  getContactTransactions,
  getContactStats,
} from "../../utils/transactionUtils"
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
} from "recharts"

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
} satisfies ChartConfig

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b']

export default function ContactDetailPage() {
  const router = useRouter()
  const params = useParams()
  const contactName = decodeURIComponent(params.contactName as string)
  
  const [transactions, setTransactions] = useState<transactionSchemaType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedTransactions = localStorage.getItem("transactions")
    if (!storedTransactions) {
      setLoading(false)
      return
    }
    
    const result = transactionSchema.safeParse(JSON.parse(storedTransactions))
    if (result.success) {
      setTransactions(JSON.parse(storedTransactions) as transactionSchemaType)
    }
    setLoading(false)
  }, [])

  const contactTransactions = useMemo(() => {
    if (!transactions || !contactName) return []
    return getContactTransactions(transactions, contactName)
  }, [transactions, contactName])

  const stats = useMemo(() => {
    if (!transactions || !contactName) return null
    return getContactStats(transactions, contactName)
  }, [transactions, contactName])

  // Prepare timeline data (balance changes over time)
  const timelineData = useMemo(() => {
    if (contactTransactions.length === 0) return []
    
    const sorted = [...contactTransactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    let runningBalance = 0
    return sorted.map((t) => {
      runningBalance += t.credit - t.debit
      return {
        date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance: runningBalance,
        credit: t.credit,
        debit: t.debit,
      }
    })
  }, [contactTransactions])

  // Prepare pie chart data (credit vs debit)
  const pieData = useMemo(() => {
    if (!stats) return []
    return [
      { name: 'Received', value: stats.totalCredit },
      { name: 'Sent', value: stats.totalDebit },
    ].filter(item => item.value > 0)
  }, [stats])

  // Prepare frequency data (transactions by month)
  const frequencyData = useMemo(() => {
    if (contactTransactions.length === 0) return []
    
    const monthlyMap = new Map<string, number>()
    contactTransactions.forEach((t) => {
      const date = new Date(t.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1)
    })

    return Array.from(monthlyMap.entries())
      .map(([key, count]) => ({
        month: new Date(key + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
  }, [contactTransactions])

  // Prepare area chart data (amount flow over time)
  const areaData = useMemo(() => {
    if (contactTransactions.length === 0) return []
    
    const sorted = [...contactTransactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    const monthlyMap = new Map<string, { credit: number; debit: number }>()
    sorted.forEach((t) => {
      const date = new Date(t.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      const existing = monthlyMap.get(monthKey)
      if (existing) {
        existing.credit += t.credit
        existing.debit += t.debit
      } else {
        monthlyMap.set(monthKey, { credit: t.credit, debit: t.debit })
      }
    })

    return Array.from(monthlyMap.entries())
      .map(([key, data]) => ({
        month: new Date(key + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        received: data.credit,
        sent: data.debit,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
  }, [contactTransactions])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading contact details...</p>
        </div>
      </div>
    )
  }

  if (!stats || !contactName) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 text-lg mb-4">Contact not found</p>
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-6 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="bg-white/20 backdrop-blur-sm w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-lg">
              {getInitials(contactName)}
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{contactName}</h1>
              <p className="text-blue-100 text-sm sm:text-base">
                {stats.transactionCount} {stats.transactionCount === 1 ? 'transaction' : 'transactions'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-50 text-green-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Total Received</p>
                  <p className="text-lg sm:text-xl font-bold text-green-600 truncate">
                    ${stats.totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="bg-red-50 text-red-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Total Sent</p>
                  <p className="text-lg sm:text-xl font-bold text-red-600 truncate">
                    ${stats.totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 text-blue-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Net Amount</p>
                  <p className={`text-lg sm:text-xl font-bold truncate ${stats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(stats.netAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="bg-purple-50 text-purple-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Avg Transaction</p>
                  <p className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    ${((stats.totalCredit + stats.totalDebit) / stats.transactionCount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart - Credit vs Debit */}
          {pieData.length > 0 && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Money Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Transaction Frequency</CardTitle>
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
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Balance Timeline</CardTitle>
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
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Amount Flow Over Time</CardTitle>
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
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Date</TableHead>
                      <TableHead className="whitespace-nowrap">Description</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Received</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Sent</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...contactTransactions]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(transaction.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {transaction.description}
                          </TableCell>
                          <TableCell className="text-right text-green-600 whitespace-nowrap">
                            {transaction.credit > 0
                              ? `$${transaction.credit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right text-red-600 whitespace-nowrap">
                            {transaction.debit > 0
                              ? `$${transaction.debit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right font-semibold whitespace-nowrap">
                            ${transaction.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

