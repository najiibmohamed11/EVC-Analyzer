import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PauseCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { metaDataType } from "@/components/Upload-card";
import { Spinner } from "@/components/ui/spinner";
import MerchantsChart from "./Merchants-chart";
import { transactionSchemaType } from "@/app/schema/transactions";

export function ProfileSidebar({
  transactions,
}: {
  transactions: transactionSchemaType;
}) {
  const [metaData, setMetaData] = useState<metaDataType>();
  useEffect(() => {
    const data = localStorage.getItem("metadata");
    if (!data) {
      return;
    }
    setMetaData(JSON.parse(data ?? "") as metaDataType);
  }, []);

  const generateProfileIcon = (fullName: string) => {
    return fullName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .slice(0, 2);
  };
  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Profile & Status Card */}
      <Card className="flex-1 rounded-[2.5rem] border-0 from-white to-red-50/50 shadow-sm">
        <CardContent className="p-8 flex flex-col h-full">
          {!metaData ? (
            <Spinner />
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-bold text-slate-900">
                  Your profile
                </h3>
                <div className="flex items-center gap-4 rounded-2xl bg-white/50 p-2">
                  <Avatar className="h-12 w-12 ">
                    <AvatarImage src="/avatar-woman-digital-artist.jpg" />
                    <AvatarFallback className="font-bold bg-gradient-to-b from-[#FF7A5F] to-[#FF6B58] text-white">
                      {generateProfileIcon(metaData.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-slate-900">
                      {metaData.name}
                    </div>
                    <div className="text-xs font-medium text-slate-500">
                      {metaData.mobile}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-6 text-lg font-bold text-slate-900">
                  Your collection status
                </h3>

                <MerchantsChart transactions={transactions} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Promo Card */}
      <div className="relative flex w-full max-w-[600px] overflow-hidden rounded-[3rem] bg-gradient-to-b from-[#FF7A5F] to-[#FF6B58] p-8 sm:p-12 shadow-2xl">
        {/* Left Content Section */}
        <div className="flex flex-1 flex-col items-start justify-center space-y-8 z-10">
          <h2 className="text-xl font-extrabold leading-tight text-white ">
            Comming Soon <br />
            our mobile <br />
            app?
          </h2>

          <button
            type="button"
            className="rounded-full bg-white px-10 py-3 text-lg font-bold text-[#FF6B58] shadow-sm transition-transform hover:scale-105 hover:bg-gray-50 active:scale-95"
          >
            Download Soon
          </button>
        </div>

        {/* Right Section - Avatar Wrapper 
            Using absolute positioning to allow the character to overhang 
            the bottom of the container slightly for depth effect.
        */}
        <div className="absolute bottom-[-15%] right-[-5%] h-[120%] w-[60%] flex items-end justify-end">
          <div className={`relative h-full w-full`}>
            {/* NOTE: I am using the cropped image from your prompt as the source.
         Replace this src with your actual asset file.
      */}
            <img
              src="/avater.png"
              alt="3D character holding a phone with 'S' logo"
              className="h-auto w-full object-contain drop-shadow-xl"
              // Adding pointer-events-none so the overlapping image doesn't block clicks on the container behind it if needed
              style={{ pointerEvents: "none" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
