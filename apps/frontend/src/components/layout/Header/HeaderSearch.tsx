"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  MapPin,
  Plane,
  BedDouble,
  UtensilsCrossed,
  Stamp,
  Backpack,
  BookOpen,
  Newspaper,
  ArrowLeft,
  Stethoscope,
  Shield,
  Sparkles,
  X,
} from "lucide-react";

const WP =
  process.env.NEXT_PUBLIC_WP_API_URL || "http://nextsafar.local/wp-json";

/* ═══ متادیتای پست‌تایپ‌ها ═══ */
const TYPE_META: Record<string, { label: string; icon: any; base: string }> = {
  hotel: { label: "هتل", icon: BedDouble, base: "/hotels" },
  destination: { label: "مقاصد", icon: MapPin, base: "/destinations" },
  restaurant: { label: "رستوران", icon: UtensilsCrossed, base: "/restaurants" },
  airport: { label: "فرودگاه", icon: Plane, base: "/airports" },
  visa: { label: "ویزا", icon: Stamp, base: "/visa" },
  tour: { label: "تور", icon: Backpack, base: "/tours" },
  travelguide: { label: "راهنمای سفر", icon: BookOpen, base: "/travelguide" },
  travelnews: { label: "اخبار", icon: Newspaper, base: "/news" },
  hospital: { label: "بیمارستان", icon: Stethoscope, base: "/hospitals" },
  insurance: { label: "بیمه مسافرتی", icon: Shield, base: "/insurance" },
  cip: { label: "خدمات CIP", icon: Sparkles, base: "/cip" },
};

interface SearchResult {
  id: number;
  type: string;
  title: string;
  url: string;
  image?: string | null;
  address?: string | null;
}

function dedupe(list: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  return list.filter((r) => {
    const key = `${r.type}-${r.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const QUICK_SUGGESTIONS = ["دبی", "استانبول", "هتل آنتالیا", "ویزای دبی", "تور ترکیه"];

async function res2json(r: Response) {
  return r.json();
}

async function fallbackSearch(term: string): Promise<SearchResult[]> {
  const all = await Promise.all(
    Object.entries(TYPE_META).map(async ([type, meta]) => {
      try {
        const r = await fetch(
          `${WP}/wp/v2/${type}?search=${encodeURIComponent(term)}&per_page=3&_embed`,
        );
        if (!r.ok) return [] as SearchResult[];
        const data = await res2json(r);
        return data.map(
          (p: any): SearchResult => ({
            id: p.id,
            type,
            title: (p.title?.rendered || "").replace(/<[^>]+>/g, "").trim(),
            url: `${meta.base}/${p.slug}`,
            image: p._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
            address: null,
          }),
        );
      } catch {
        return [] as SearchResult[];
      }
    }),
  );
  return dedupe(all.flat()).slice(0, 12);
}

export default function HeaderSearch({
  desktopBoxVisible = true,
}: {
  desktopBoxVisible?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ─── تشخیص موبایل ─── */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* ─── دسکتاپ: بستن با کلیک بیرون ─── */
  useEffect(() => {
    if (!open || isMobile) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open, isMobile]);

  /* ─── موبایل: قفل اسکرول + فوکوس خودکار ─── */
  useEffect(() => {
    if (!open || !isMobile) return;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 280);
    return () => {
      document.body.style.overflow = "";
      clearTimeout(t);
    };
  }, [open, isMobile]);

  /* ─── دسکتاپ: فوکوس روی اینپوت ─── */
  useEffect(() => {
    if (open && !isMobile) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open, isMobile]);

  /* ─── ESC ─── */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  /* ─── موبایل: Back button مرورگر ─── */
  useEffect(() => {
    if (!open || !isMobile) return;
    window.history.pushState({ searchOpen: true }, "");
    const onPop = () => setOpen(false);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [open, isMobile]);

  /* ─── جستجو با debounce ─── */
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `${WP}/nextsafar/v1/search?q=${encodeURIComponent(term)}&per_type=3`,
        );
        if (res.ok) {
          const data = await res.json();
          setResults(dedupe(data.results || []));
        } else {
          setResults(dedupe(await fallbackSearch(term)));
        }
      } catch {
        try {
          setResults(dedupe(await fallbackSearch(term)));
        } catch {
          setResults([]);
        }
      }
      setLoading(false);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const submitAll = () => {
    const term = q.trim();
    if (!term) return;
    setOpen(false);
    setQ("");
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const closeAndReset = () => {
    setOpen(false);
    setQ("");
  };

  /* ═══ لیست نتایج (مشترک) ═══ */
  const renderResults = () => (
    <ul className="max-h-[380px] overflow-y-auto py-1">
      {results.length === 0 && !loading && (
        <li className="px-4 py-8 text-center text-sm text-text-muted">
          نتیجه‌ای برای «{q}» یافت نشد
        </li>
      )}
      {results.map((r) => {
        const meta = TYPE_META[r.type];
        const Icon = meta?.icon || Search;
        return (
          <li key={`${r.type}-${r.id}`}>
            <Link
              href={r.url}
              onClick={closeAndReset}
              className="flex items-center gap-3 px-4 py-2.5 transition-colors"
            >
              {r.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={r.image}
                  alt=""
                  className="w-12 h-12 rounded-md object-cover border border-border shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-md bg-primary-lightest text-primary-dark flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-text truncate">{r.title}</div>
                <div className="flex items-center gap-1 text-xs text-text-muted mt-0.5">
                  {r.address ? (
                    <>
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{r.address}</span>
                    </>
                  ) : (
                    <span>{meta?.label || ""}</span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  /* ═══ پیشنهادهای سریع (مشترک) ═══ */
  const renderSuggestions = () => (
    <div className="p-4">
      <div className="text-xs font-bold text-text-muted mb-2.5">جستجوهای پرطرفدار:</div>
      <div className="flex flex-wrap gap-2">
        {QUICK_SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setQ(s)}
            className="ns-chip !py-1.5 !text-xs hover:!border-primary hover:!text-primary-dark cursor-pointer"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div ref={ref} className="relative flex items-center gap-2">
      {/* ═══ دسکتاپ: باکس جستجو (فقط وقتی desktopBoxVisible=true) ═══ */}
      {desktopBoxVisible && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`hidden md:flex items-center gap-2 h-11 w-40 md:w-52 px-3 rounded-sm border text-sm transition-all cursor-pointer ${
            open && !isMobile
              ? "opacity-0 pointer-events-none"
              : "border-border bg-surface hover:border-primary-light hover:bg-white"
          }`}
          aria-label="جستجو در سایت"
        >
          <Search className="w-4 h-4 text-primary shrink-0" />
          <span className="text-text-subtle truncate">جستجو در سفر بعدی...</span>
        </button>
      )}

      {/* ═══ موبایل: فقط آیکون (همیشه) ═══ */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-text-strong transition cursor-pointer"
        aria-label="جستجو"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* ═══ دسکتاپ: پنل درجا (دقیقاً مثل قبل) ═══ */}
      <AnimatePresence>
        {open && !isMobile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "top left" }}
            className="absolute top-0 end-0 w-[min(92vw,600px)] bg-white rounded-md border border-border shadow-card-hover overflow-hidden z-50"
          >
            <div className="flex items-center gap-2.5 px-3 h-10 border-b border-divider">
              <Search className="w-4 h-4 text-primary shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitAll();
                  if (e.key === "Escape") setOpen(false);
                }}
                placeholder="جستجو در هتل، تور، ویزا، مقاصد، فرودگاه..."
                className="flex-1 bg-transparent outline-none text-sm text-text placeholder:text-text-subtle"
              />
              {loading && (
                <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
              )}
            </div>
            {q.trim().length < 2 ? renderSuggestions() : renderResults()}
            <div className="border-t border-divider bg-surface/60">
              <button
                type="button"
                onClick={submitAll}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-primary-dark transition-colors cursor-pointer"
              >
                مشاهده همه نتایج برای «{q || "..."}»
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ موبایل: overlay تمام‌صفحه ═══ */}
      <AnimatePresence>
        {open && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[700] bg-white overflow-y-auto"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="min-h-full"
            >
              {/* هدر overlay */}
              <div className="sticky top-0 bg-white border-b border-border z-10">
                <div className="ns-container flex items-center gap-3 h-14">
                  <button
                    type="button"
                    onClick={closeAndReset}
                    className="flex items-center justify-center w-10 h-10 rounded-lg text-text-strong hover:bg-bg-sec transition cursor-pointer"
                    aria-label="بستن"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-bold text-text-strong">جستجو در سفر بعدی</span>
                </div>
              </div>

              <div className="ns-container py-4 pb-24">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitAll();
                  }}
                  className="rounded-lg border-2 border-border focus-within:border-primary transition overflow-hidden mb-4"
                >
                  <div className="flex items-center gap-2.5 px-3 h-14">
                    <Search className="w-5 h-5 text-primary shrink-0" />
                    <input
                      type="text"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="هتل، تور، ویزا، مقصد..."
                      className="flex-1 bg-transparent outline-none text-base text-text placeholder:text-text-subtle"
                    />
                    {loading && (
                      <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                    )}
                    {q && !loading && (
                      <button
                        type="button"
                        onClick={() => setQ("")}
                        className="p-1 hover:bg-bg-sec rounded-full transition cursor-pointer"
                        aria-label="پاک کردن"
                      >
                        <X className="w-4 h-4 text-text-muted" />
                      </button>
                    )}
                  </div>
                </form>

                {q.trim().length < 2 ? (
                  renderSuggestions()
                ) : (
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-text-muted mb-2 px-1">
                      <Search className="w-3.5 h-3.5" />
                      نتایج برای «{q}»
                    </div>
                    {renderResults()}
                    {!loading && results.length > 0 && (
                      <button
                        type="button"
                        onClick={submitAll}
                        className="w-full mt-3 py-3 rounded-lg bg-primary text-white font-bold text-sm transition cursor-pointer"
                      >
                        مشاهده همه نتایج برای «{q}»
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}