"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Search } from "lucide-react";

interface CityItem {
  city: string;
  country: string;
}

export default function DestinationField({
  value,
  onChange,
  placeholder = "کجا می‌خوای بری؟",
}: {
  value: { destination: string; country: string };
  onChange: (v: { destination: string; country: string }) => void;
  placeholder?: string;
}) {
  const [items, setItems] = useState<CityItem[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value.destination);
  const wrapRef = useRef<HTMLDivElement>(null);

  /* دریافت لیست شهرها */
  useEffect(() => {
    fetch("/api/ai-trip/destinations")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {});
  }, []);

  /* بستن دراپ‌داون با کلیک بیرون */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => setQuery(value.destination), [value.destination]);

  const filtered = items.filter(
    (i) =>
      query.trim() === "" ||
      i.city.includes(query.trim()) ||
      i.country.includes(query.trim()),
  );

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange({ destination: e.target.value, country: "" });
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="w-full ps-9 pe-3 py-3 rounded-lg border border-border bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
        />
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-30 mt-2 w-full max-h-64 overflow-y-auto rounded-lg border border-border bg-white shadow-card-hover">
          {filtered.slice(0, 12).map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onChange({ destination: item.city, country: item.country });
                setQuery(item.city);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-start text-sm hover:bg-bg-sec transition"
            >
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="font-bold text-text-strong">{item.city}</span>
              <span className="text-xs text-text-muted">• {item.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
