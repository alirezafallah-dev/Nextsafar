"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import { Minus, Plus, RotateCcw } from "lucide-react";
import type { WorldCountry } from "./WorldMapSection";

interface Props {
  dataByEn: Record<string, WorldCountry>;
  metric: "all" | "dest" | "hotel" | "tour";
  highlightEn: string | null;
  selectedEn: string | null;
  onHover: (en: string | null, x?: number, y?: number) => void;
  onSelect: (en: string | null) => void;
}

const LOW = [100, 180, 240];
const HIGH = [20, 120, 220];
const NO_DATA = "#e9eff7";
const HIGHLIGHT = "#3384c6";
const SELECTED = "#1e6fb8";

function lerp(a: number[], b: number[], t: number) {
  return `rgb(${a.map((av, i) => Math.round(av + (b[i] - av) * t)).join(",")})`;
}

export default function WorldMapCanvas({
  dataByEn,
  metric,
  highlightEn,
  selectedEn,
  onHover,
  onSelect,
}: Props) {
  const [topo, setTopo] = useState<any>(null);
  const [box, setBox] = useState({ w: 960, h: 520 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{
    x: number;
    y: number;
    px: number;
    py: number;
  } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let alive = true;
    fetch("/data/countries-110m.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => alive && setTopo(j))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      setBox({ w, h: Math.max(320, Math.round(w * 0.56)) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      setZoom((z) => Math.min(6, Math.max(1, z * factor)));
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  useEffect(() => {
    if (zoom <= 1.001) setPan({ x: 0, y: 0 });
  }, [zoom]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (zoom <= 1) return;
      const target = e.target as SVGElement;
      if (target.tagName === "path" && target.dataset.country === "1") return;
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragStart.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPan({ x: dragStart.current.px + dx, y: dragStart.current.py + dy });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      dragStart.current = null;
    };

    svg.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      svg.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, zoom, pan]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as SVGElement;
      if (target.tagName !== "path") onSelect(null);
    };
    svg.addEventListener("click", handleClick);
    return () => svg.removeEventListener("click", handleClick);
  }, [onSelect]);

  const features = useMemo(() => {
    if (!topo) return [] as any[];
    return (feature(topo, topo.objects.countries) as any).features.filter(
      (f: any) => f.properties?.name !== "Antarctica",
    );
  }, [topo]);

  const projection = useMemo(() => {
    if (!features.length) return null;
    return geoMercator().fitSize([box.w, box.h], {
      type: "FeatureCollection",
      features,
    } as any);
  }, [features, box]);

  const pathGen = useMemo(
    () => (projection ? geoPath(projection) : null),
    [projection],
  );

  const valueOf = (en: string): number => {
    const c = dataByEn[en];
    if (!c) return 0;
    if (metric === "dest") return c.totals?.dest ?? 0;
    if (metric === "hotel") return c.totals?.hotel ?? 0;
    if (metric === "tour") return c.totals?.tour ?? 0;
    return c.score ?? 0;
  };

  const maxVal = useMemo(() => {
    let m = 10;
    for (const en of Object.keys(dataByEn)) m = Math.max(m, valueOf(en));
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataByEn, metric]);

  const fillFor = (en: string) => {
    const v = valueOf(en);
    if (!v) return NO_DATA;

    const t = Math.pow(v / maxVal, 0.6);
    const minT = 0.4;
    const finalT = Math.max(t, minT);

    return lerp(LOW, HIGH, finalT);
  };

  const btn =
    "w-9 h-9 rounded-md bg-white border border-border shadow-sm text-text-muted hover:text-primary hover:border-primary-light transition flex items-center justify-center cursor-pointer";

  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      ref={wrapRef}
      className={`relative rounded-lg overflow-hidden bg-[#f5f9ff] border border-border select-none ${
        isDragging ? "cursor-grabbing" : zoom > 1 ? "cursor-grab" : ""
      }`}
    >
      <div className="absolute top-3 end-3 z-20 flex flex-col gap-1.5">
        <button
          onClick={() => setZoom((z) => Math.min(6, z * 1.4))}
          aria-label="بزرگ‌نمایی"
          className={btn}
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(1, z / 1.4))}
          aria-label="کوچک‌نمایی"
          className={btn}
        >
          <Minus className="w-4 h-4" />
        </button>
        <button onClick={resetZoom} aria-label="بازنشانی" className={btn}>
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {zoom > 1 && (
        <div className="absolute top-3 start-3 z-20 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur border border-border text-[11px] font-bold text-text-muted">
          {zoom.toFixed(1)}×
        </div>
      )}

      {!topo && (
        <div className="w-full aspect-[16/9] animate-pulse bg-bg-sec" />
      )}

      {topo && pathGen && (
        <svg
          ref={svgRef}
          viewBox={`0 0 ${box.w} ${box.h}`}
          className="w-full h-auto block select-none"
          role="img"
          aria-label="نقشه جهانی مقاصد"
        >
          <g
            transform={`translate(${pan.x},${pan.y}) translate(${box.w / 2},${box.h / 2}) scale(${zoom}) translate(${-box.w / 2},${-box.h / 2})`}
          >
            {features.map((f: any) => {
              const en = f.properties?.name as string;
              const has = !!dataByEn[en];
              const isHi = highlightEn === en;
              const isSelect = selectedEn === en;
              const pathD = pathGen(f) || "";

              const centroid = pathGen.centroid(f) || [box.w / 2, box.h / 2];
              const [cx, cy] = centroid;

              const fill = fillFor(en);
              const strokeColor = isSelect
                ? SELECTED
                : isHi
                  ? HIGHLIGHT
                  : "#ffffff";
              const strokeW = isSelect
                ? 2.5 / zoom
                : isHi
                  ? 2 / zoom
                  : 0.7 / zoom;

              return (
                <path
                  key={f.id ?? en}
                  d={pathD}
                  fill={fill}
                  stroke={strokeColor}
                  strokeWidth={strokeW}
                  data-country={has ? "1" : "0"}
                  style={{
                    transformOrigin: `${cx}px ${cy}px`,
                    transform: isHi && !isSelect ? "scale(1.04)" : "scale(1)",
                    zIndex: isHi || isSelect ? 2 : 1,
                    transition:
                      "transform 600ms cubic-bezier(0.22,1,0.36,1), stroke 400ms ease, stroke-width 400ms ease",
                    cursor: has ? "pointer" : "default",
                  }}
                  onMouseMove={(e) => has && onHover(en, e.clientX, e.clientY)}
                  onMouseLeave={() => has && onHover(null)}
                  onClick={() => has && onSelect(en)}
                />
              );
            })}
          </g>
        </svg>
      )}
    </div>
  );
}
