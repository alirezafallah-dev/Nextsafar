"use client";
import { createContext, useContext, useState, useCallback } from "react";

type AuthTab = "phone" | "google";

interface AuthModalCtx {
  isOpen: boolean;
  activeTab: AuthTab;
  open: (tab?: AuthTab) => void;
  close: () => void;
  switchTab: (tab: AuthTab) => void;
}

const Ctx = createContext<AuthModalCtx | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AuthTab>("phone");

  const open = useCallback((tab: AuthTab = "phone") => {
    setActiveTab(tab);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const switchTab = useCallback((tab: AuthTab) => {
    setActiveTab(tab);
  }, []);

  return (
    <Ctx.Provider value={{ isOpen, activeTab, open, close, switchTab }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuthModal must be inside AuthModalProvider");
  return ctx;
}