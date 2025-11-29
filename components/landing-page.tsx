"use client"

import { motion } from "framer-motion"
import { ConnectedUpload } from "./connected-upload"
import { Toaster } from "sonner"


export function LandingPage() {
  return (
    <main className="min-h-screen w-full bg-[#FDFDFD] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-gray-200">
      <Toaster position="top-center" />
      {/* Background decorative blobs */}
      <div className="relative bg-red z-10 flex flex-col items-center max-w-5xl w-full">
        {/* Heading */}
        <div className="text-center mb-4 relative">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl font-serif font-medium text-gray-900 tracking-tight mb-4"
          >
            Make a tailored
            <br />
            course for you
          </motion.h1>
        </div>
        {/* Upload Zone */}
        <ConnectedUpload />
      </div>
    </main>
  )
}
