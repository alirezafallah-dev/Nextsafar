import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth/session";
import AccountShell from "@/components/account/AccountShell";

/* ✅ FIX: گارد احراز هویت داینامیک است */
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "پنل کاربری | سفر بعدی" };

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/");
  return <AccountShell user={user}>{children}</AccountShell>;
}