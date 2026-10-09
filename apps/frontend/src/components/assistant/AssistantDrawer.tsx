"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  History,
  MapPin,
  Maximize2,
  Plus,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { sendChatMessage } from "@/lib/api/assistant";
import { getPlanEntities } from "@/lib/api/map";
import { getTripPlanStatus } from "@/lib/api/ai-trip";
import type { ChatHistoryItem, ChatMessageItem, ChatSession } from "@/types/assistant";
import type { TripEntity } from "@/types/map";
import type { TripPlan } from "@/types/ai-trip";
import PlanCard from "./PlanCard";
import TripResultsView from "./TripResultsView";
import TripFormCard from "./TripFormCard";

let msgSeq = 0;
const nextId = () => `m${++msgSeq}_${Date.now()}`;

const LS_KEY = "ns_assistant_state_v1";
const LS_FAVS = "ns_assistant_favs_v1";
const LS_HISTORY = "ns_assistant_history_v1";
const MAX_SESSIONS = 30;

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function AssistantDrawer({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activePlan, setActivePlan] = useState<TripPlan | null>(null);
  const [entities, setEntities] = useState<TripEntity[]>([]);
  const [lastQuery, setLastQuery] = useState("");
  const [resultsOpen, setResultsOpen] = useState(true);
  const [hiddenSlugs, setHiddenSlugs] = useState<string[]>([]);
  const [favs, setFavs] = useState<string[]>([]);
  const [restored, setRestored] = useState(false);

  /* ✅ جدید: هیستوری گفتگوها */
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [entered, setEntered] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const autoOpened = useRef<Set<number>>(new Set());

  /* ═══ ✅ بازیابی از localStorage هنگام باز شدن ═══ */
  useEffect(() => {
    const s = loadJSON<any>(LS_KEY, null);
    setFavs(loadJSON<string[]>(LS_FAVS, []));
    setSessions(loadJSON<ChatSession[]>(LS_HISTORY, []));
    if (s) {
      if (Array.isArray(s.messages)) setMessages(s.messages);
      if (typeof s.lastQuery === "string") setLastQuery(s.lastQuery);
      if (Array.isArray(s.hiddenSlugs)) setHiddenSlugs(s.hiddenSlugs);
      if (typeof s.resultsOpen === "boolean") setResultsOpen(s.resultsOpen);
      if (typeof s.sessionId === "string") setSessionId(s.sessionId);
      if (s.planId) {
        (async () => {
          try {
            const plan = await getTripPlanStatus(Number(s.planId));
            if (plan && plan.status === "completed") {
              setActivePlan(plan);
              autoOpened.current.add(plan.id);
              setEntities((await getPlanEntities(plan.id)) as TripEntity[]);
            }
          } catch {}
        })();
      }
    }
    setRestored(true);
  }, []);

  /* ═══ ✅ ذخیره خودکار وضعیت فعلی ═══ */
  useEffect(() => {
    if (!restored) return;
    const lastPlan = [...messages].reverse().find((m) => m.kind === "plan" && m.planId);
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({
          messages,
          lastQuery,
          hiddenSlugs,
          resultsOpen,
          planId: lastPlan?.planId ?? null,
          sessionId,
        }),
      );
    } catch {}
  }, [messages, lastQuery, hiddenSlugs, resultsOpen, restored, sessionId]);

    /* ═══ ✅ انیمیشن ورود بدون فلش: دو فریم صبر، بعد transition ═══ */
  useEffect(() => {
    if (!showHistory) {
      setEntered(false);
      return;
    }
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [showHistory]);

  /* ═══ ✅ جدید: ثبت/بروزرسانی جلسه فعلی در هیستوری ═══ */
  useEffect(() => {
    if (!restored || messages.length === 0) return;
    let sid = sessionId;
    if (!sid) {
      sid = `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setSessionId(sid);
    }
    const firstUser = messages.find((m) => m.role === "user");
    const title =
      (firstUser?.text ?? "").replace(/[؟?!.،,]/g, "").trim().slice(0, 40) || "گفتگو";
    const now = Date.now();
    const current = sid;
    setSessions((prev) => {
      const exists = prev.some((s) => s.id === current);
      const next = exists
        ? prev.map((s) => (s.id === current ? { ...s, title, messages, updatedAt: now } : s))
        : [{ id: current, title, createdAt: now, updatedAt: now, messages }, ...prev];
      next.sort((a, b) => b.updatedAt - a.updatedAt);
      return next.slice(0, MAX_SESSIONS);
    });
  }, [messages, restored, sessionId]);

  /* ═══ ✅ جدید: ذخیره هیستوری ═══ */
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(LS_HISTORY, JSON.stringify(sessions));
    } catch {}
  }, [sessions, restored]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_FAVS, JSON.stringify(favs));
    } catch {}
  }, [favs]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  const history = useCallback((): ChatHistoryItem[] => {
    return messages
      .filter((m) => m.kind === "text")
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.text }));
  }, [messages]);

  const autoOpen = useCallback(async (plan: TripPlan) => {
    if (autoOpened.current.has(plan.id)) return;
    autoOpened.current.add(plan.id);
    setActivePlan(plan);
    setResultsOpen(true);
    setEntities((await getPlanEntities(plan.id)) as TripEntity[]);
  }, []);

  /* ═══ ✅ جدید: باز کردن نتایج مربوط به یک پیام خاص ═══ */
  const openMessageResults = useCallback(async (m: ChatMessageItem) => {
    /* پیام برنامه سفر: موجودیت‌ها رو از سرور بگیر */
    if (m.kind === "plan" && m.planId) {
      try {
        const plan = await getTripPlanStatus(m.planId);
        if (plan && plan.status === "completed") {
          autoOpened.current.add(plan.id);
          setActivePlan(plan);
          setEntities((await getPlanEntities(m.planId)) as TripEntity[]);
          setResultsOpen(true);
        }
      } catch {}
      return;
    }
    /* پیام متنی با موجودیت: از خود پیام بخون */
    if (m.entities && m.entities.length > 0) {
      setActivePlan({
        id: 0,
        status: "completed",
        title: m.panelTitle ?? "پیشهادها",
        summary: "",
        days: [],
        tips: [],
        total_budget_min: null,
        total_budget_max: null,
        currency: "",
        recommended_hotel: null,
      } as unknown as TripPlan);
      setEntities(m.entities);
      setResultsOpen(true);
    }
  }, []);

  const deleteEntity = useCallback((slug: string) => {
    setHiddenSlugs((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
  }, []);

  const toggleFav = useCallback((slug: string) => {
    setFavs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }, []);

  /* ═══ ✅ جدید: مدیریت هیستوری ═══ */
  const loadSession = useCallback((s: ChatSession) => {
    setMessages(s.messages);
    setSessionId(s.id);
    setShowHistory(false);
    setActivePlan(null);
    setEntities([]);
    setResultsOpen(true);
  }, []);

  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (sessionId === id) {
        setMessages([]);
        setSessionId(null);
        setActivePlan(null);
        setEntities([]);
        try {
          localStorage.removeItem(LS_KEY);
        } catch {}
      }
    },
    [sessionId],
  );

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || typing) return;
      setInput("");
      setMessages((prev) => [...prev, { id: nextId(), role: "user", kind: "text", text: clean }]);
      setTyping(true);
      try {
        const res = await sendChatMessage(clean, history());
        if (res.type === "plan" && res.plan_id) {
          setLastQuery(clean);
          setMessages((prev) => [
            ...prev,
            { id: nextId(), role: "assistant", kind: "plan", text: res.text, planId: res.plan_id },
          ]);
        } else {
          const ents = (res.entities ?? []) as TripEntity[];
          setMessages((prev) => [
            ...prev,
            {
              id: nextId(),
              role: "assistant",
              kind: "text",
              text: res.text,
              suggestions: res.suggestions,
              /* ✅ جدید: موجودیت‌ها به خود پیام چسبیدن تا دکمه‌شون همیشه بمونه */
              entities: ents.length > 0 ? ents : undefined,
              panelTitle: res.panel_title,
            },
          ]);
          /* ✅ نیت recommend: موجودیت‌ها را در پنل راست نشان بده */
          if (ents.length > 0) {
            setEntities(ents);
            setActivePlan({
              id: 0,
              status: "completed",
              title: res.panel_title ?? "پیشهادها",
              summary: "",
              days: [],
              tips: [],
              total_budget_min: null,
              total_budget_max: null,
              currency: "",
              recommended_hotel: null,
            } as unknown as TripPlan);
            setResultsOpen(true);
          }
        }
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "assistant",
            kind: "text",
            text: e instanceof Error ? e.message : "خطا در ارتباط با دستیار",
          },
        ]);
      } finally {
        setTyping(false);
      }
    },
    [typing, history],
  );

  const reset = () => {
    setMessages([]);
    setActivePlan(null);
    setEntities([]);
    setLastQuery("");
    setHiddenSlugs([]);
    setResultsOpen(true);
    setSessionId(null);
    autoOpened.current.clear();
    try {
      localStorage.removeItem(LS_KEY);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-[500] flex">
      {/* ═══ سمت راست: پنل نتایج یا backdrop ═══ */}
      <div className="flex-1 min-w-0">
        {activePlan && resultsOpen ? (
          <TripResultsView
            plan={activePlan}
            entities={entities}
            query={lastQuery}
            hiddenSlugs={hiddenSlugs}
            favs={favs}
            onDelete={deleteEntity}
            onToggleFav={toggleFav}
            onClose={() => setResultsOpen(false)}
          />
        ) : (
          <div className="w-full h-full bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
        )}
      </div>

      {/* ═══ ریل چت — سمت چپ ═══ */}
      <aside className="relative w-full max-w-[420px] h-full bg-white shadow-2xl flex flex-col">
        {/* ═══ ✅ هدر جدید: راست = بستن + چت جدید | چپ = تیتر + هیستوری ═══ */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-divider">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-bg-sec transition"
              title="بستن"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-border text-[10px] font-bold text-text-muted hover:border-primary hover:text-primary transition cursor-pointer"
              title="شروع گفتگوی جدید"
            >
              <Plus className="w-3.5 h-3.5" />
              گفتگوی جدید
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </span>
            <h2 className="text-sm">دستیار سفر</h2>
            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="relative p-2 rounded-lg hover:bg-bg-sec transition"
              title="تاریخچه گفتگوها"
            >
              <History className="w-4 h-4" />
              {sessions.length > 0 && (
                <span className="absolute -top-1 -left-1 min-w-4 h-4 px-0.5 rounded-full bg-primary text-white text-[8px] font-bold flex items-center justify-center">
                  {formatCount(sessions.length)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ═══ ✅ سایدبار هیستوری — از سمت چپ، با انیمیشن ═══ */}
        {showHistory && (
          <div className="absolute inset-0 z-30 overflow-hidden">
            {/* بک‌دراپ — سمت راست */}
            <button
              type="button"
              aria-label="بستن تاریخچه"
              onClick={() => setShowHistory(false)}
              className={`absolute inset-0 bg-black/25 backdrop-blur-[1px] cursor-default transition-opacity duration-300 ${
                entered ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* پنل تاریخچه — سمت چپ */}
            <div className={`absolute inset-y-0 left-0 w-[72%] max-w-[280px] bg-white shadow-2xl border-s border-divider/70 flex flex-col transition-transform duration-[380ms] ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform ${
              entered ? "translate-x-0" : "-translate-x-full"
            }`}>
              {/* ── هدر ── */}
              <div className="px-3 pt-3 pb-2.5 border-b border-divider/70">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                      <History className="w-3.5 h-3.5 text-primary" />
                    </span>
                    تاریخچه گفتگوها
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowHistory(false)}
                    className="p-1.5 rounded-lg text-text-muted hover:bg-bg-sec hover:text-text transition"
                    title="بستن"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[9px] text-text-muted mt-2">
                  {formatCount(sessions.length)} گفتگو • حداکثر ۳۰ مورد ذخیره می‌شه
                </p>
              </div>

              {/* ── لیست گفتگوها ── */}
              <div className="flex-1 overflow-y-auto px-1.5 py-1">
                {sessions.length === 0 ? (
                  <div className="text-center pt-10 px-4">
                    <div className="w-10 h-10 mx-auto rounded-lg bg-bg-sec flex items-center justify-center mb-3">
                      <History className="w-4 h-4 text-text-muted" />
                    </div>
                    <p className="text-[10px] font-bold text-text-muted">هنوز گفتگویی نداری</p>
                    <p className="text-[9px] text-text-subtle mt-1 leading-5">
                      با اولین پیام، گفتگو اینجا ذخیره می‌شه
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-divider/60">
                    {sessions.map((s) => (
                      <li key={s.id} className="group relative">
                        <button
                          type="button"
                          onClick={() => loadSession(s)}
                          className={`w-full text-start px-2.5 py-2.5 rounded-lg transition-colors cursor-pointer ${
                            s.id === sessionId ? "bg-primary/10" : "hover:bg-bg-sec"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {/* نشانگر کنار آیتم فعال */}
                            <span
                              className={`w-1 h-6 rounded-full shrink-0 transition-colors ${
                                s.id === sessionId ? "bg-primary" : "bg-transparent"
                              }`}
                            />
                            <span className="flex-1 min-w-0">
                              <span
                                className={`block text-[10.5px] font-bold truncate ${
                                  s.id === sessionId ? "text-primary" : "text-text-strong"
                                }`}
                              >
                                {s.title}
                              </span>
                              <span className="block text-[9px] text-text-muted mt-0.5">
                                {timeAgo(s.updatedAt)} • {formatCount(s.messages.length)} پیام
                              </span>
                            </span>
                          </span>
                        </button>

                        {/* دکمه حذف — فقط با هاور روی آیتم */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(s.id);
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-text-muted opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                          title="حذف گفتگو"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* ── پاورقی ── */}
              {sessions.length > 0 && (
                <div className="px-3 py-2 border-t border-divider/70">
                  <p className="text-[9px] text-text-subtle text-center">
                    برای حذف، نشانگر را روی هر گفتگو ببرید
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ لیست پیام‌ها ═══ */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center pt-8">
              <div className="w-14 h-14 mx-auto rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-sm mb-2">سلام! من دستیار سفرتم 👋</h3>
              <p className="text-xs text-text-muted leading-6 mb-5">
                هر سوال سفری داری بپرس، یا بگو چه برنامه‌ای می‌خوای تا برات بچینم.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-3">
                {["برنامه ۳ روزه استانبول", "هتل ارزان در دبی", "ویزای ترکیه چه مدارکی می‌خواد؟"].map(
                  (s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="px-3 py-1.5 rounded-full border border-border text-[11px] font-bold text-text-muted hover:border-primary hover:text-primary transition cursor-pointer"
                    >
                      {s}
                    </button>
                  ),
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-[11px] font-bold hover:bg-primary/20 transition cursor-pointer"
              >
                📋 ساخت برنامه با فرم
              </button>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[85%] ${m.role === "user" ? "" : "w-full"}`}>
                {m.kind === "text" && (
                  <div
                    className={`px-4 py-2.5 rounded-lg text-xs leading-6 whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-primary text-white rounded-es-sm"
                        : "bg-bg-sec text-text rounded-ee-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                )}
                {m.kind === "plan" && (
                  <>
                    <div className="px-4 py-2.5 rounded-lg rounded-bs-sm bg-bg-sec text-xs leading-6 mb-1">
                      {m.text}
                    </div>
                    {m.planId && (
                      <PlanCard planId={m.planId} onReady={autoOpen} hiddenSlugs={hiddenSlugs} />
                    )}
                  </>
                )}
                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {m.suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className="px-2.5 py-1 rounded-full border border-border text-[10px] font-bold text-text-muted hover:border-primary hover:text-primary transition cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                {/* ✅ جدید: دکمه ثابت نتایج زیر هر پیام — هیچ‌وقت حذف نمی‌شه */}
                {m.role === "assistant" &&
                  ((m.entities && m.entities.length > 0) || (m.kind === "plan" && !!m.planId)) && (
                    <button
                      type="button"
                      onClick={() => openMessageResults(m)}
                      className="mt-2 flex items-center gap-1.5 rounded-lg border border-border bg-bg-sec px-2.5 py-1.5 text-[10px] font-bold text-text-muted hover:border-primary hover:text-primary transition cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      {m.kind === "plan"
                        ? "نمایش برنامه روی نقشه"
                        : `مشاهده ${formatCount(m.entities?.length ?? 0)} مکان روی نقشه`}
                    </button>
                  )}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-lg rounded-bs-sm bg-bg-sec flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:120ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:240ms]" />
              </div>
            </div>
          )}
        </div>

        {/* ═══ نوار بازکردن نتایج (وقتی بسته است) ═══ */}
        {activePlan && !resultsOpen && (
          <button
            type="button"
            onClick={() => setResultsOpen(true)}
            className="mx-3 mb-2 flex items-center gap-2.5 rounded-lg border border-border bg-bg-sec px-3 py-2.5 text-start hover:border-primary/50 hover:bg-primary/5 transition cursor-pointer"
          >
            <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Maximize2 className="w-4 h-4 text-primary" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[11px] font-bold truncate">
                باز کردن نتایج «{lastQuery || activePlan.title}»
              </span>
              <span className="block text-[10px] text-text-muted">
                {formatCount(visibleCount(entities, hiddenSlugs))} مکان • نقشه و لیست
              </span>
            </span>
          </button>
        )}

        {showForm && (
          <TripFormCard
            onClose={() => setShowForm(false)}
            onCreated={(planId) => {
              setMessages((prev) => [
                ...prev,
                {
                  id: nextId(),
                  role: "assistant",
                  kind: "plan",
                  text: "برنامه‌ات از طریق فرم ثبت شد؛ دارم می‌سازمش 🗺️",
                  planId,
                },
              ]);
            }}
          />
        )}

        {/* ═══ ورودی ═══ */}
        <div className="p-3 border-t border-divider">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2"
          >
            <button
              type="button"
              onClick={() => setShowForm((s) => !s)}
              title="ساخت برنامه با فرم"
              className={`w-11 h-11 rounded-lg border flex items-center justify-center shrink-0 transition cursor-pointer ${
                showForm
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-text-muted hover:border-primary hover:text-primary"
              }`}
            >
              <CalendarDays className="w-4 h-4" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="بنویس: برنامه ۴ روزه استانبول با بودجه متوسط..."
              className="flex-1 resize-none rounded-lg border border-border bg-bg-sec px-4 py-3 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition max-h-28"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="w-11 h-11 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 hover:opacity-95 transition disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-4 h-4 -scale-x-100" />
            </button>
          </form>
          <p className="text-[10px] text-text-subtle mt-2 text-center">
            Enter برای ارسال • Shift+Enter برای خط جدید
          </p>
        </div>
      </aside>
    </div>
  );
}

/* تعداد مکان‌های قابل نمایش */
function visibleCount(entities: TripEntity[], hidden: string[]): number {
  return entities.filter((e) => !hidden.includes(e.slug)).length;
}
function formatCount(n: number): string {
  return new Intl.NumberFormat("fa-IR").format(n);
}
function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "همین الان";
  if (m < 60) return `${formatCount(m)} دقیقه پیش`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${formatCount(h)} ساعت پیش`;
  return `${formatCount(Math.floor(h / 24))} روز پیش`;
}