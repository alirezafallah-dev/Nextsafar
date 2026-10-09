"use client";

import { useLayoutEffect, useState, type RefObject } from "react";
import { createPortal } from "react-dom";

interface FixedPopoverProps {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  innerRef?: RefObject<HTMLDivElement | null>;
  width?: number;
  children: React.ReactNode;
}

/**
 * ✅ پاپ‌اور با position:fixed روی بدنه — هرگز توسط مودال/اسکرول کلیپ نمی‌شود
 */
export default function FixedPopover({
  open,
  anchorRef,
  innerRef,
  width = 320,
  children,
}: FixedPopoverProps) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) return;

    const update = () => {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const panelH = 400; // ارتفاع تقریبی تقویم
      const vh = window.innerHeight;

      /* اگر جا نیست، بالای فیلد باز شو */
      const top =
        r.bottom + 8 + panelH > vh ? Math.max(8, r.top - panelH - 8) : r.bottom + 8;

      /* RTL: لبه راست پنل هم‌تراز لبه راست فیلد */
      const left = Math.max(
        8,
        Math.min(r.right - width, window.innerWidth - width - 8),
      );

      setPos({ top, left });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchorRef, width]);

  if (!open || typeof document === "undefined" || !pos) return null;

  return createPortal(
    <div
      ref={innerRef}
      className="fixed z-[300] rounded-lg border border-border bg-white shadow-card-hover"
      style={{ top: pos.top, left: pos.left, width }}
    >
      {children}
    </div>,
    document.body,
  );
}