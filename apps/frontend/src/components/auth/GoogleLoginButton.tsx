"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import GoogleIcon from "@/components/ui/GoogleIcon";

export default function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  const handleClick = () => {
    setLoading(true);
    window.location.href = `/api/auth/google/start?next=${encodeURIComponent(
      pathname || "/",
    )}`;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex items-center justify-center gap-3 w-full h-12 rounded-lg border border-border bg-white text-sm font-extrabold text-text-strong hover:bg-bg-sec hover:shadow-sm transition disabled:opacity-60 cursor-pointer"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      ) : (
        <GoogleIcon />
      )}
      ادامه با حساب گوگل
    </button>
  );
}