"use client"
import React, { useEffect, useState } from 'react'
import { transactionSchema, transactionSchemaType } from '../schema/transactions'
import { DashboardHeader } from './components/Dashboard-header'
import { ChartBarMultiple } from './components/EarningsChart'
import { SummaryCards } from './components/SummaryCards'
import { TopContacts } from './components/TopContacts'
import { TransactionInsights } from './components/TransactionInsights'

function page() {
  const [allTransactions,setAllTransactions]=useState<transactionSchemaType|null|undefined>(null)

  useEffect(()=>{
    const transactions=localStorage.getItem("transactions")
    if(!transactions){
      setAllTransactions(undefined)
      return
    }
    const result=transactionSchema.safeParse(JSON.parse(transactions))
    console.log("helllllllllllllllllllllllllllllll")
    console.log(result)
    if(!result.success){
      setAllTransactions(undefined)
      return
    }
    setAllTransactions(JSON.parse(transactions) as transactionSchemaType)

  },[])


  if(allTransactions===null){
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading transactions...</p>
        </div>
      </div>
    )
  }
  if(allTransactions===undefined){
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 text-lg">No transactions found</p>
          <p className="text-slate-500 text-sm mt-2">Upload a PDF to get started</p>
        </div>
      </div>
    )
  }
  console.log("transactions",allTransactions)

  return(
     <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader/>
        
        {/* Summary Cards */}
        <div className="mb-8">
          <SummaryCards transactions={allTransactions} />
        </div>

         <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            {/* Earnings Chart */}
            <ChartBarMultiple transactions={allTransactions}/>
            
            {/* Transaction Insights */}
            <TransactionInsights transactions={allTransactions} />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Top Contacts */}
            <TopContacts 
              transactions={allTransactions} 
            />
          </div>
        </div>
      </div>
     </div>

  )
}

export default page