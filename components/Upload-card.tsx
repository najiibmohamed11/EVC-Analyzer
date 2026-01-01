import React, { useCallback, useRef, useState } from 'react'
import { CloudUpload } from "lucide-react"
import { motion } from "framer-motion"
import {useDropzone} from 'react-dropzone'
import { toast } from 'sonner'
import { Spinner } from './ui/spinner'
import { useRouter } from 'next/navigation'
import { transactionSchemaType } from '@/app/schema/transactions'
import * as Sentry from "@sentry/nextjs"; // 1. Import Sentry
export type metaDataType=  { 
  period: string;
  name: string;
  mobile: string;
  balance: string;
}
type parsedPdfResult={
  success:boolean,
  data:{
       results: transactionSchemaType
       arangedMetaData:metaDataType
    },
   error: string,
   details: string
}
function UploadCard() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isLoading,setIsLoading]=useState(false)
    const onDrop = useCallback(async(acceptedFiles:File[]) => {
       setIsLoading(true) 
       await processFiles(acceptedFiles[0])
       setIsLoading(false) 
  }, [])
  const {getRootProps, getInputProps,isDragActive,} = useDropzone({onDrop,disabled:isLoading,noClick:true})
  const navigator=useRouter()



      const handleFileInput = async(e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files) {
          setIsLoading(true)
          await processFiles(files[0])
          setIsLoading(false)
        }
      }

      const processFiles = async (file: File) => {
        if(file.type !== "application/pdf"){
            toast.error("Only PDF files are accepted")
            return;
        }
        const vercelLimitSize=4
        //converting bytes to MB
        const fileSize=file.size/(1024*1024)
        if(fileSize>=vercelLimitSize){
          toast.error("too large file, you can't upload more then 5MB pdf")
          return 
        }

        try {
          const formData = new FormData()
          formData.append("pdf-file", file)

          const response = await fetch('/api/upload-pdf', {
            method: "POST",
            body: formData
          })

          const result = await response.json() as parsedPdfResult

          if (result.success) {
            toast.success("PDF uploaded and parsed successfully")
            localStorage.setItem("transactions",JSON.stringify(result.data.results))
            localStorage.setItem("metadata",JSON.stringify(result.data.arangedMetaData))
            navigator.push("/dashboard")
          } else {
            Sentry.captureException(result.error);
            toast.error(result.error)
          }
        } catch (error) {
          Sentry.captureException(error);
          toast.error("Failed to upload PDF")
        }
      }

      const handleButtonClick = () => {
        fileInputRef.current?.click()
      }
    
  return (
    
         <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl p-2"
          >
           <div
            {...getRootProps()}
              className={`
                relative rounded-2xl border-2 border-dashed transition-colors duration-200
                flex flex-col items-center justify-center p-12 text-center min-h-[320px]
                ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50/50"}
              `}
        
            >
              {isLoading?<Spinner/>:<>
              
                <input {...getInputProps()} type='file' />
              <div className="pointer-events-none flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                  <CloudUpload className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">Drag & drop your files here</h3>
                <p className="text-gray-500 mb-8">Or click to browse from your computer</p>
              </div>
    
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                className="hidden"
                multiple
                accept='application/pdf'
              />
              <button 
                onClick={handleButtonClick}
                className="bg-[#1a1b2e] text-white px-8 py-3 rounded-full font-medium hover:bg-opacity-90 transition-all transform hover:scale-105 active:scale-95 shadow-lg z-20">
                Upload Files
              </button>
    
         
              </>}
            </div>
    
          
          </motion.div>
  )
}

export default UploadCard