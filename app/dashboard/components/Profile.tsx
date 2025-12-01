import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PauseCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { metaDataType } from "@/components/Upload-card"
import { Spinner } from "@/components/ui/spinner"
import MerchantsChart from "./Merchants-chart"
import { transactionSchemaType } from "@/app/schema/transactions"

export function ProfileSidebar({transactions}:{transactions:transactionSchemaType}) {
    const [metaData,setMetaData]=useState<metaDataType>()
    useEffect(()=>{
       const data= localStorage.getItem('metadata')
        setMetaData(JSON.parse(data??'') as metaDataType )
    },[])

    const generateProfileIcon=(fullName:string)=>{
        return fullName.split(" ").map((name)=>name[0]).join("")
    }
  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Profile & Status Card */}
      <Card className="flex-1 rounded-[2.5rem] border-0 bg-gradient-to-b from-white to-red-50/50 shadow-sm">
        <CardContent className="p-8 flex flex-col h-full">
         {!metaData?<Spinner/>: <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-bold text-slate-900">Your profile</h3>
              <div className="flex items-center gap-4 rounded-2xl bg-white/50 p-2">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/avatar-woman-digital-artist.jpg" />
                  <AvatarFallback>{generateProfileIcon(metaData.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold text-slate-900">{metaData.name}</div>
                  <div className="text-xs font-medium text-slate-500">{metaData.mobile}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-6 text-lg font-bold text-slate-900">Your collection status</h3>

              <MerchantsChart transactions={transactions}/>

             
            </div>
          </div>}
        </CardContent>
      </Card>

      {/* Promo Card */}
      <Card className="relative overflow-hidden rounded-[2.5rem] border-0 bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg">
        <CardContent className="p-8">
          <div className="relative z-10 max-w-[60%]">
            <h3 className="mb-6 text-2xl font-bold leading-tight">Do you have our mobile app?</h3>
            <Button className="rounded-full bg-white px-6 font-bold text-orange-500 hover:bg-orange-50">
              Download
            </Button>
          </div>
          <div className="absolute -right-4 bottom-0 h-48 w-48">
            <Image
              src="/3d-illustration-woman-holding-phone-orange-shirt.jpg"
              alt="Mobile app promo"
              width={200}
              height={200}
              className="object-contain object-bottom"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
