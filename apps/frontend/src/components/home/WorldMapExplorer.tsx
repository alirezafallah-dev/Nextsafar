"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import Image from "next/image";
import { BedDouble, BookOpen, MapPin, Plane, Sparkles } from "lucide-react";
import { COUNTRY_MAP } from "@/lib/constants/countries";
import { formatNumber } from "@/lib/utils";
import type { WorldCountry } from "./WorldMapSection";
import WorldMapPanel from "./WorldMapPanel";

const WorldMapCanvas = dynamic(() => import("./WorldMapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[16/9] rounded-lg bg-bg-sec animate-pulse" />
  ),
});

export type PanelTab = "all" | "hotel" | "tour" | "destination" | "guide";

const TABS: {
  id: PanelTab;
  label: string;
  icon: any;
  metric: "all" | "dest" | "hotel" | "tour";
}[] = [
  { id: "all", label: "همه", icon: MapPin, metric: "all" },
  { id: "hotel", label: "هتل‌ها", icon: BedDouble, metric: "hotel" },
  { id: "tour", label: "تورها", icon: Plane, metric: "tour" },
  { id: "destination", label: "مقاصد", icon: Sparkles, metric: "dest" },
  { id: "guide", label: "راهنمای سفر", icon: BookOpen, metric: "all" },
];

export default function WorldMapExplorer({
  countries,
}: {
  countries: WorldCountry[];
}) {
  const [tab, setTab] = useState<PanelTab>("all");
  const [selectedFa, setSelectedFa] = useState<string | null>(null);
  const [hoveredFa, setHoveredFa] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    fa: string;
  } | null>(null);

  const currentMetric = TABS.find((t) => t.id === tab)?.metric ?? "all";

  const dataByEn = useMemo(() => {
    const out: Record<string, WorldCountry> = {};
    for (const c of countries) {
      const info = COUNTRY_MAP[c.name];
      if (info) out[info.en] = c;
    }
    return out;
  }, [countries]);

  const enToFa = useMemo(() => {
    const m: Record<string, string> = {};
    for (const [en, c] of Object.entries(dataByEn)) m[en] = c.name;
    return m;
  }, [dataByEn]);

  const sorted = useMemo(
    () => [...countries].sort((a, b) => b.score - a.score),
    [countries],
  );
  const top5 = sorted.slice(0, 5);

  const selected = selectedFa
    ? (countries.find((c) => c.name === selectedFa) ?? null)
    : null;
  const panel = selected ?? sorted[0] ?? null;
  const panelRank = panel ? sorted.indexOf(panel) + 1 : 1;

  const hoveredEn = hoveredFa ? (COUNTRY_MAP[hoveredFa]?.en ?? null) : null;
  const selectedEn = selectedFa ? (COUNTRY_MAP[selectedFa]?.en ?? null) : null;

  const tooltipCountry = tooltip
    ? (countries.find((c) => c.name === tooltip.fa) ?? null)
    : null;

  return (
    <div className="rounded-lg bg-white border border-border shadow-card p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="ns-section-title !mb-1">سفر بعدی در یک نگاه</h2>
          <p className="text-sm text-text-muted">
            روی هر کشور برو تا ببینی چه‌ها برایت داریم
          </p>
        </div>

        <div className="flex items-center gap-1 bg-bg-sec border border-border rounded-md p-1 flex-wrap">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                  tab === t.id
                    ? "bg-primary text-white shadow-md"
                    : "text-text-muted hover:text-primary-dark"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div onMouseLeave={() => setTooltip(null)}>
          <WorldMapCanvas
            dataByEn={dataByEn}
            metric={currentMetric}
            highlightEn={hoveredEn}
            selectedEn={selectedEn}
            onHover={(en, x, y) => {
              if (!en) {
                setTooltip(null);
                setHoveredFa(null);
                return;
              }
              const fa = enToFa[en];
              setHoveredFa(fa);
              if (x !== undefined && y !== undefined) setTooltip({ x, y, fa });
            }}
            onSelect={(en) => {
              const fa = en ? enToFa[en] : null;
              setSelectedFa(fa);
            }}
          />
        </div>

        {panel && <WorldMapPanel country={panel} rank={panelRank} tab={tab} />}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {top5.map((c) => (
          <button
            key={c.id}
            onMouseEnter={() => setHoveredFa(c.name)}
            onMouseLeave={() => setHoveredFa(null)}
            onClick={() => setSelectedFa(c.name)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-sm border text-xs font-bold transition-all duration-300 cursor-pointer ${
              selectedFa === c.name
                ? "bg-primary border-primary text-white shadow-md"
                : "bg-white border-border text-text-muted hover:border-primary-light hover:text-primary-dark"
            }`}
          >
            {c.flag && (
              <Image
                src={c.flag}
                alt=""
                width={20}
                height={14}
                className="rounded object-cover"
              />
            )}
            {c.name}
            <span className="opacity-50 font-medium">
              {formatNumber(c.score)}
            </span>
          </button>
        ))}
      </div>

      {tooltip && tooltipCountry && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
        >
          <div className="w-64 rounded-md overflow-hidden bg-white border border-border shadow-card-hover">
            {tooltipCountry.banner && (
              <div className="relative h-24">
                <Image
                  src={tooltipCountry.banner}
                  alt=""
                  fill
                  sizes="256px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-2 start-3 flex items-center gap-2">
                  {tooltipCountry.flag && (
                    <Image
                      src={tooltipCountry.flag}
                      alt=""
                      width={24}
                      height={16}
                      className="rounded object-cover shadow"
                    />
                  )}
                  <span className=" text-white drop-shadow">
                    {tooltipCountry.name}
                  </span>
                </div>
              </div>
            )}

            <div className="p-3 grid grid-cols-4 gap-1 text-center">
              {[
                {
                  v: tooltipCountry.totals.dest,
                  l: "مقصد",
                  c: "text-primary-dark",
                },
                {
                  v: tooltipCountry.totals.hotel,
                  l: "هتل",
                  c: "text-primary-dark",
                },
                {
                  v: tooltipCountry.totals.tour,
                  l: "تور",
                  c: "text-tour-hover",
                },
                {
                  v: tooltipCountry.cities.length,
                  l: "شهر",
                  c: "text-text-strong",
                },
              ].map((s, i) => (
                <div key={i}>
                  <div className={` text-sm ${s.c}`}>
                    {formatNumber(s.v)}
                  </div>
                  <div className="text-[10px] text-text-muted">{s.l}</div>
                </div>
              ))}
            </div>

            {tooltipCountry.cities[0] && (
              <div className="px-3 pb-3 flex items-center gap-2 text-[11px] text-text-muted">
                <Sparkles className="w-3 h-3 text-tour" />
                داغ‌ترین:{" "}
                <span className="font-bold text-text-strong">
                  {tooltipCountry.cities[0].name}
                </span>
              </div>
            )}

            <div className="px-3 pb-3 pt-1 border-t border-divider text-[10px] text-text-subtle text-center">
              برای جزئیات بیشتر کلیک کن
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
