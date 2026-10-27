import type { Metadata } from "next"
import { Vazirmatn } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const vazirmatn = Vazirmatn({ subsets: ["arabic", "latin"] })

export const metadata: Metadata = {
  title: "NextSafar - پنل مدیریت",
  description: "پنل مدیریت پلتفرم سفر NextSafar",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className={vazirmatn.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
