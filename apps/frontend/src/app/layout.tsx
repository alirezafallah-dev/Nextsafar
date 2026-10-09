import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getMenus } from "@/lib/api/menu";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { AuthModalProvider } from "@/lib/auth/AuthModalProvider";
import { getSessionUser } from "@/lib/auth/session";
import AuthModal from "@/components/auth/AuthModal";

/* ✅ FIX: صراحتاً به Next 16 بگو این لایوت داینامیک است (به‌خاطر cookies) */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "سفر بعدی | رزرو هتل، تور، ویزا و بلیط",
    template: "%s | سفر بعدی ایرانیان",
  },
  description: "بهترین قیمت هتل، تور، ویزا و بلیط پرواز در سفر بعدی ایرانیان.",
  keywords: ["هتل", "تور", "ویزا", "بلیط پرواز", "سفر", "گردشگری"],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mainMenuItems, secMenuItems, mobileMenuItems, user] = await Promise.all([
    getMenus("mainmenu"),
    getMenus("secmenu"),
    getMenus("mobilemenu"),
    getSessionUser(),
  ]);

  return (
    <html lang="fa" dir="rtl">
      <body className="antialiased bg-white text-text min-h-screen flex flex-col" suppressHydrationWarning>
        <AuthProvider initial={user}>
          <AuthModalProvider>
            <Header
              mainMenuItems={mainMenuItems}
              secMenuItems={secMenuItems}
              mobileMenuItems={mobileMenuItems}
            />
            <main className="flex-1">{children}</main>
            <Footer />
            <AuthModal />
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}