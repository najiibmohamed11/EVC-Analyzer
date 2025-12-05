import { transactionSchemaType } from '@/app/schema/transactions'
import React from 'react'
const groupTransactions=(transactions:transactionSchemaType)=>{
  //0 #FFE8E6
  // 1-2 #FFC0B8
  // 3-5 #FF6B58
  // 6-8#FF462E
  const groupedTransactions=new Map<string,{transactionCount:number,credit:number,debit:number,net:number}>()
  transactions.forEach((transaction)=>{
    const date=transaction.date.split(" ")[0]
    if(groupedTransactions.has(date)){
      const groupedTransactionsData=groupedTransactions.get(date)
      if(!groupedTransactionsData)return 
      const transactionCount=groupedTransactionsData.transactionCount+1
      console.log(";;;;;;;;;;;;;;;;;;;",transactionCount)
      const credit=groupedTransactionsData.credit+transaction.credit
      const debit=groupedTransactionsData.debit+transaction.debit
      const net =credit-debit
      groupedTransactions.set(date,{transactionCount,credit,debit,net})
      return
    }
    groupedTransactions.set(date,{transactionCount:1,credit:transaction.credit,debit:transaction.debit,net:transaction.credit-transaction.debit})
  })

  return groupedTransactions
}
const getContainerColor=(date:Date,transactions:transactionSchemaType)=>{
    const groupedTransactions=groupTransactions(transactions)
    const formatedDate=date.toISOString().split("T")[0]
    console.log("grouped///////////")
    console.log(groupedTransactions)
    const thidDateTransaction=groupedTransactions.get(formatedDate)
    const myObject = Object.fromEntries(groupedTransactions);
    console.log("mmmmmmmmmmmmmm",myObject)
    if(!thidDateTransaction)return '#fff'
    console.log("transaction count",thidDateTransaction?.transactionCount)
    if(thidDateTransaction.transactionCount<=2)return '#FFC0B8'
    if(thidDateTransaction.transactionCount>=5)return '#FF6B58'
    if(thidDateTransaction.transactionCount>=6)return '#FF462E'
    return '#FFE8E6'
}
function HeatMap({transactions}:{transactions:transactionSchemaType}) {
    const containers=Array.from({length:90},(_,index)=>{
      const today=new Date()
      today.setDate(today.getDate()-index)
      
      return today
    })
    containers.reverse()
     const daysInTheWeek=['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  return (
    <div className='grid grid-cols-7 gap-1 '>
        {daysInTheWeek.map((day)=><div className='h-5 text-center'>{day}</div>)}
        {containers.map((i)=><div className={`  h-10`} style={{backgroundColor:getContainerColor(i,transactions)}}></div>)}
    </div>
  
  )
}

export default HeatMap