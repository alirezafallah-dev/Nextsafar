/* ═══════════════════════════════════════════════════════
   NextSafar — Assistant Types (نسخه نهایی)
═══════════════════════════════════════════════════════ */
import type { TripEntity } from "./map";

/* ═══ آیتم تاریخچه گفتگو (ورودی بک‌اند) ═══ */
export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

/* ═══ پیام چت — مطابق ساختار AssistantDrawer ═══ */
export interface ChatMessageItem {
  id: string;
  role: "user" | "assistant";
  kind: string;              /* "text" | "plan" | ... */
  text: string;
  planId?: number;
  suggestions?: string[];
  entities?: TripEntity[];   /* ✅ جدید: موجودیت‌های هر پیام (دکمه نقشه) */
  panelTitle?: string;       /* ✅ جدید: عنوان پنل نتایج هر پیام */
}

/* alias برای سازگاری */
export type ChatMessage = ChatMessageItem;

/* ═══ ✅ جدید: جلسه چت برای هیستوری ═══ */
export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessageItem[];
}