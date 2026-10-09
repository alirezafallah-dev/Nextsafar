"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Loader2 } from "lucide-react";
import { buildApiUrl } from "@/lib/api/config";

/* ═══ ساختار نتیجه (دقیقاً مثل هدر) ═══ */
interface SearchResult {
  id: number;
  type: string;
  title: string;
  url: string;
  image?: string | null;
  address?: string | null;
}

/* ═══ حذف نتایج تکراری ═══ */
function dedupe(list: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  return list.filter((r) => {
    const key = `${r.type}-${r.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function ContentForm({
  postType,
  basePath,
  placeholder,
  icon: Icon = Search,
  typeLabel = "",
}: {
  postType: string;
  basePath: string;
  placeholder: string;
  icon?: any;
  typeLabel?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLFormElement>(null);

  /* ─── جستجو با debounce - همون endpoint هدر ─── */
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
          buildApiUrl(
            `nextsafar/v1/search?q=${encodeURIComponent(term)}&per_type=5&types=${postType}`,
          ),
        );
        if (res.ok) {
          const data = await res.json();
          setResults(dedupe(data.results || []));
        } else {
          setResults(dedupe(await fallbackSearch(term, postType, basePath)));
        }
      } catch {
        try {
          setResults(dedupe(await fallbackSearch(term, postType, basePath)));
        } catch {
          setResults([]);
        }
      }
      setLoading(false);
    }, 350);
    return () => clearTimeout(t);
  }, [q, postType, basePath]);

  /* ─── بستن با کلیک بیرون ─── */
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <form
      ref={ref}
      /* ✅ موبایل: ستونی (اینپوت بالا، دکمه پایین) / دسکتاپ: یک خط */
      className="relative flex flex-col md:flex-row gap-2 md:gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim())
          router.push(
            `/search?type=${postType}&q=${encodeURIComponent(q.trim())}`,
          );
      }}
    >
      <input
        className="ns-input w-full md:flex-1 min-w-0"
        placeholder={placeholder}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => results.length && setOpen(true)}
      />
      <button
        type="submit"
        className="ns-btn ns-btn-primary w-full md:w-auto shrink-0 h-12 md:h-auto"
      >
        <Search className="w-4 h-4" />
        جستجو
      </button>

      {/* ═══ پنل نتایج - دقیقاً سبک هدر ═══ */}
      {open && q.trim().length >= 2 && (
        <ul className="absolute top-full inset-x-0 mt-2 bg-white rounded-lg border border-border shadow-card-hover overflow-hidden z-40 max-h-[380px] overflow-y-auto py-1">
          {loading && (
            <li className="px-4 py-8 text-center text-sm text-text-muted flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              در حال جستجو...
            </li>
          )}
          {!loading && results.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-text-muted">
              نتیجه‌ای برای «{q}» یافت نشد
            </li>
          )}
          {!loading &&
            results.map((r) => (
              <li key={`${r.type}-${r.id}`}>
                <Link
                  href={r.url || `${basePath}/${r.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary-lightest/60 transition-colors"
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
                    <div className="text-sm font-semibold text-text truncate">
                      {r.title}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-text-muted mt-0.5">
                      {r.address ? (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate">{r.address}</span>
                        </>
                      ) : (
                        <span>{typeLabel}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
        </ul>
      )}
    </form>
  );
}

/* ═══ fallback بدون پلاگین ═══ */
async function fallbackSearch(
  term: string,
  postType: string,
  basePath: string,
): Promise<SearchResult[]> {
  const r = await fetch(
    buildApiUrl(
      `wp/v2/${postType}?search=${encodeURIComponent(term)}&per_page=5&_embed`,
    ),
  );
  if (!r.ok) return [];
  const data = await r.json();
  return data.map(
    (p: any): SearchResult => ({
      id: p.id,
      type: postType,
      title: (p.title?.rendered || "").replace(/<[^>]+>/g, " ").trim(),
      url: `${basePath}/${p.slug}`,
      image: p._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
      address: null,
    }),
  );
}