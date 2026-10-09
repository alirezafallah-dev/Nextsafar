"use client";
import { useRef, useState, useEffect } from "react";
import {
  Camera,
  Loader2,
  CheckCircle2,
  Smartphone,
  MonitorSmartphone,
  LogOut,
  Save,
  User as UserIcon,
  Mail,
  Hash,
  Calendar as CalIcon,
  ShieldCheck,
} from "lucide-react";
import GoogleIcon from "@/components/ui/GoogleIcon";
import { useAuth } from "@/lib/auth/AuthProvider";
import UserAvatar from "@/components/ui/UserAvatar";
import { useAccount, accMutate, Skeleton, faDate } from "@/components/account/ui";
import BirthdayPicker, { jalaliAge } from "@/components/account/BirthdayPicker";

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const profile = useAccount<any>("profile");
  const sessions = useAccount<any>("sessions");

  /* فرم */
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  /* آواتار */
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* لینک شماره */
  const [phoneInput, setPhoneInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [linking, setLinking] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const p = profile.data?.profile;
  const get = (key: string, fallback = "") =>
    form[key] ?? (p?.[key] ?? fallback);
  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  /* ═══ آپلود آواتار ═══ */
  const uploadAvatar = async (file: File) => {
    setUploading(true);
    setMsg(null);
    const fd = new FormData();
    fd.append("avatar", file);
    const res = await accMutate("avatar", "POST", fd);
    setUploading(false);
    if (res.ok) {
      setAvatarUrl(res.avatar);
      await refresh();
      setMsg({ ok: true, text: "عکس پروفایل با موفقیت تغییر کرد" });
    } else {
      const errs: Record<string, string> = {
        file_too_large: "حجم عکس باید کمتر از ۲ مگابایت باشه",
        invalid_type: "فقط فایل JPG، PNG یا WebP مجازه",
      };
      setMsg({ ok: false, text: errs[res.error] ?? "آپلود عکس ناموفق بود" });
    }
  };

  /* ═══ ذخیره پروفایل ═══ */
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const res = await accMutate("profile", "POST", {
      display_name: get("display_name"),
      email: get("email"),
      first_name: get("first_name"),
      last_name: get("last_name"),
      national_id: get("national_id"),
      birthdate: get("birthdate"),
    });
    setSaving(false);
    const bd = get("birthdate");
    if (bd) {
      const age = jalaliAge(bd);
      if (age === null || age < 18) {
        setMsg({ ok: false, text: "سن باید حداقل ۱۸ سال باشد" });
        setSaving(false);
        return;
      }
    }
    if (res.ok) {
      await refresh();
      profile.reload();
      setForm({});
      setMsg({ ok: true, text: "تغییرات ذخیره شد" });
    } else {
      const errs: Record<string, string> = {
        email_taken: "این ایمیل قبلاً استفاده شده",
        invalid_national_id: "کد ملی معتبر نیست (۱۰ رقم)",
        invalid_birthdate: "تاریخ تولد معتبر نیست (مثال: 1375/05/01)",
        underage: "سن باید حداقل ۱۸ سال باشد",
      };
      setMsg({ ok: false, text: errs[res.error] ?? "ذخیره ناموفق بود" });
    }
  };

  /* ═══ لینک شماره: ارسال کد ═══ */
  const sendPhoneCode = async () => {
    setMsg(null);
    if (!/^09\d{9}$/.test(phoneInput)) {
      setMsg({
        ok: false,
        text: "شماره موبایل باید ۱۱ رقمی و با ۰۹ شروع بشه",
      });
      return;
    }
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phoneInput }),
    });
    const data = await res.json();
    if (data.ok) {
      setOtpSent(true);
      setCode(Array(6).fill(""));
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } else {
      setMsg({
        ok: false,
        text:
          data.error === "rate_limit"
            ? "کمی صبر کن و دوباره تلاش کن"
            : "ارسال کد ناموفق بود",
      });
    }
  };

  /* ═══ لینک شماره: تایید کد ═══ */
  const verifyPhone = async (full: string) => {
    if (full.length !== 6 || linking) return;
    setLinking(true);
    setMsg(null);
    const res = await accMutate("phone", "POST", {
      phone: phoneInput,
      code: full,
    });
    setLinking(false);
    if (res.ok) {
      profile.reload();
      await refresh();
      setOtpSent(false);
      setPhoneInput("");
      setMsg({ ok: true, text: "شماره موبایل به حساب متصل شد ✅" });
    } else {
      setMsg({
        ok: false,
        text:
          res.error === "phone_taken"
            ? "این شماره به حساب دیگری متصل است"
            : res.error === "invalid_code"
              ? "کد نامعتبر یا منقضی شده"
              : "اتصال شماره ناموفق بود",
      });
      setCode(Array(6).fill(""));
      otpRefs.current[0]?.focus();
    }
  };

  const handleOtpChange = (i: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    const next = [...code];
    if (!digits) {
      next[i] = "";
      setCode(next);
      return;
    }
    digits
      .slice(0, 6 - i)
      .split("")
      .forEach((d, k) => {
        next[i + k] = d;
      });
    setCode(next);
    otpRefs.current[Math.min(i + digits.length, 5)]?.focus();
    if (next.every(Boolean)) verifyPhone(next.join(""));
  };

  /* ═══ ابطال جلسه ═══ */
  const revoke = async (id?: number) => {
    await accMutate("sessions", "POST", id ? { id } : { all: true });
    sessions.reload();
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-lg md:text-xl font-extrabold text-text-strong">
        تنظیمات
      </h1>

      {msg && (
        <div
          className={`text-xs font-bold rounded-lg p-3 ${
            msg.ok
              ? "bg-success/10 text-success border border-success/20"
              : "bg-danger/10 text-danger border border-danger/20"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* ═══ عکس پروفایل ═══ */}
      <div className="ns-card p-5 md:p-6">
        <h2 className="text-base md:text-lg font-extrabold text-text-strong mb-4">
          عکس پروفایل
        </h2>
        <div className="flex items-center gap-4">
          <UserAvatar
            src={avatarUrl ?? user?.avatar}
            className="w-20 h-20 ring-4 ring-primary/10"
          />
          <div className="space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadAvatar(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="ns-btn ns-btn-primary !py-2.5 disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              {uploading ? "در حال آپلود…" : "تغییر عکس پروفایل"}
            </button>
            <p className="text-[11px] text-text-muted">
              JPG، PNG یا WebP — حداکثر ۲ مگابایت
            </p>
          </div>
        </div>
      </div>

      {/* ═══ اطلاعات هویتی و حساب ═══ */}
      <form
        onSubmit={saveProfile}
        className="ns-card p-5 md:p-6 space-y-4"
      >
        <h2 className="text-base md:text-lg font-extrabold text-text-strong">
          اطلاعات هویتی و حساب
        </h2>

        {/* نام و نام خانوادگی */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-text-strong mb-2">
              <UserIcon className="w-3.5 h-3.5 text-primary" /> نام
            </label>
            {profile.loading ? (
              <Skeleton className="h-12" />
            ) : (
              <input
                value={get("first_name")}
                onChange={(e) => set("first_name", e.target.value)}
                className="ns-input !h-12"
                placeholder="علیرضا"
              />
            )}
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-text-strong mb-2">
              <UserIcon className="w-3.5 h-3.5 text-primary" /> نام خانوادگی
            </label>
            {profile.loading ? (
              <Skeleton className="h-12" />
            ) : (
              <input
                value={get("last_name")}
                onChange={(e) => set("last_name", e.target.value)}
                className="ns-input !h-12"
                placeholder="محمدی"
              />
            )}
          </div>
        </div>

        {/* نام نمایشی */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-bold text-text-strong mb-2">
            <UserIcon className="w-3.5 h-3.5 text-primary" /> نام نمایشی
          </label>
          {profile.loading ? (
            <Skeleton className="h-12" />
          ) : (
            <input
              value={get("display_name")}
              onChange={(e) => set("display_name", e.target.value)}
              className="ns-input !h-12"
              placeholder="این نام در سایت نمایش داده می‌شه"
            />
          )}
        </div>

        {/* کد ملی و تاریخ تولد */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-text-strong mb-2">
              <Hash className="w-3.5 h-3.5 text-primary" /> کد ملی
            </label>
            {profile.loading ? (
              <Skeleton className="h-12" />
            ) : (
              <input
                dir="ltr"
                inputMode="numeric"
                maxLength={10}
                value={get("national_id")}
                onChange={(e) =>
                  set("national_id", e.target.value.replace(/\D/g, ""))
                }
                className="ns-input !h-12 text-left tracking-widest"
                placeholder="0012345678"
              />
            )}
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-text-strong mb-2">
              <CalIcon className="w-3.5 h-3.5 text-primary" /> تاریخ تولد
            </label>
            {profile.loading ? (
              <Skeleton className="h-12" />
            ) : (
              <BirthdayPicker
                value={get("birthdate")}
                onChange={(v) => set("birthdate", v)}
                placeholder="1375/05/01"
              />
            )}
          </div>
        </div>

        {/* ایمیل */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-bold text-text-strong mb-2">
            <Mail className="w-3.5 h-3.5 text-primary" /> ایمیل
          </label>
          {profile.loading ? (
            <Skeleton className="h-12" />
          ) : (
            <>
              <input
                type="email"
                dir="ltr"
                value={get("email")}
                onChange={(e) => set("email", e.target.value)}
                className="ns-input !h-12 text-left"
                placeholder="email@example.com"
              />
              {p?.email && !p?.email_verified && (
                <p className="text-[11px] text-warning font-bold mt-1.5">
                  ایمیل هنوز تایید نشده
                </p>
              )}
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={saving || (mounted && profile.loading)}
          className="ns-btn ns-btn-primary disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          ذخیره تغییرات
        </button>
      </form>

      {/* ═══ شماره موبایل (ورود بدون ایمیل) ═══ */}
      <div className="ns-card p-5 md:p-6 space-y-4">
        <h2 className="text-base md:text-lg font-extrabold text-text-strong">
          شماره موبایل
        </h2>
        <p className="text-xs text-text-muted leading-6">
          با اتصال شماره، می‌تونی بدون ایمیل و فقط با کد پیامکی وارد همین حساب
          بشی؛ حساب تکراری ساخته نمی‌شه.
        </p>

        {p?.phone ? (
          <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-bg-sec/60">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-primary" />
              <div>
                <div
                  className="text-sm font-bold text-text-strong"
                  dir="ltr"
                >
                  {p.phone}
                </div>
                <div className="text-[11px] text-text-muted">
                  شماره متصل به حساب
                </div>
              </div>
            </div>
            {p.phone_verified && (
              <span className="ns-badge bg-success/10 text-success flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> تایید شده
              </span>
            )}
          </div>
        ) : !otpSent ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              dir="ltr"
              inputMode="numeric"
              maxLength={11}
              value={phoneInput}
              onChange={(e) =>
                setPhoneInput(e.target.value.replace(/\D/g, ""))
              }
              className="ns-input !h-12 flex-1 text-left tracking-widest"
              placeholder="09123456789"
            />
            <button
              type="button"
              onClick={sendPhoneCode}
              className="ns-btn ns-btn-primary !h-12 shrink-0"
            >
              ارسال کد تایید
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-text-muted">
              کد ۶ رقمی ارسال‌شده به{" "}
              <span dir="ltr" className="font-bold text-text-strong">
                {phoneInput}
              </span>{" "}
              رو وارد کن
            </p>
            <div className="flex gap-2 justify-center" dir="ltr">
              {code.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !code[i] && i > 0)
                      otpRefs.current[i - 1]?.focus();
                  }}
                  className="w-11 h-14 text-center text-xl font-black border-2 border-border rounded-md bg-bg-sec/50 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/15 transition-all"
                />
              ))}
            </div>
            {linking && (
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-primary">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> در حال اتصال…
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setCode(Array(6).fill(""));
              }}
              className="w-full text-xs font-bold text-text-muted hover:text-primary transition cursor-pointer"
            >
              تغییر شماره
            </button>
          </div>
        )}
      </div>

      {/* ═══ حساب‌های متصل ═══ */}
      <div className="ns-card p-5 md:p-6 space-y-3">
        <h2 className="text-base md:text-lg font-extrabold text-text-strong mb-1">
          حساب‌های متصل
        </h2>

        <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-bg-sec/60">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-primary" />
            <div>
              <div className="text-sm font-bold text-text-strong" dir="ltr">
                {p?.phone ?? "—"}
              </div>
              <div className="text-[11px] text-text-muted">شماره موبایل</div>
            </div>
          </div>
          {p?.phone_verified ? (
            <span className="ns-badge bg-success/10 text-success flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> تایید شده
            </span>
          ) : (
            <span className="ns-badge bg-bg-sec text-text-muted">
              متصل نیست
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-bg-sec/60">
          <div className="flex items-center gap-3">
            <GoogleIcon className="w-5 h-5" />
            <div>
              <div className="text-sm font-bold text-text-strong">
                حساب گوگل
              </div>
              <div className="text-[11px] text-text-muted">
                {p?.google_linked
                  ? `متصل از ${faDate(p.google_linked)}`
                  : "متصل نیست"}
              </div>
            </div>
          </div>
          {p?.google_linked ? (
            <span className="ns-badge bg-success/10 text-success flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> متصل
            </span>
          ) : (
            <span className="ns-badge bg-bg-sec text-text-muted">—</span>
          )}
        </div>
      </div>

      {/* ═══ دستگاه‌های فعال ═══ */}
      <div className="ns-card p-5 md:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-base md:text-lg font-extrabold text-text-strong">
            دستگاه‌های فعال
          </h2>
          <button
            type="button"
            onClick={() => revoke()}
            className="text-xs font-bold text-danger hover:underline cursor-pointer flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            خروج از همه دستگاه‌ها
          </button>
        </div>

        {sessions.loading ? (
          <div className="space-y-3">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.data?.items?.map((s: any) => (
              <div
                key={s.id}
                className={`flex items-center justify-between gap-3 p-3 rounded-lg ${
                  s.current
                    ? "bg-primary-lightest border border-primary/20"
                    : "bg-bg-sec/60"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <MonitorSmartphone className="w-5 h-5 text-text-muted shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-text-strong truncate">
                      {s.device}
                      {s.current && (
                        <span className="ns-badge bg-primary/10 text-primary-dark ms-2">
                          دستگاه فعلی
                        </span>
                      )}
                    </div>
                    <div
                      className="text-[11px] text-text-muted mt-0.5"
                      dir="ltr"
                    >
                      {s.ip} • {faDate(s.last_seen)}
                    </div>
                  </div>
                </div>
                {!s.current && (
                  <button
                    type="button"
                    onClick={() => revoke(s.id)}
                    className="text-[11px] font-bold text-danger hover:underline cursor-pointer shrink-0"
                  >
                    ابطال
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}