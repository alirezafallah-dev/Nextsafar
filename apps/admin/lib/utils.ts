import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "IRR"): string {
  return new Intl.NumberFormat("fa-IR").format(amount) + " " + currency
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric", month: "long", day: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(date))
}
