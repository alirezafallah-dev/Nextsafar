"use client";
import { useState } from "react";

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  /** کلاس‌های ابعاد و حلقه، مثل "w-9 h-9 ring-2 ring-primary/20" */
  className?: string;
}

/* ═══ آواتار کاربر — عکس واقعی یا پیش‌فرض برند ═══
   - اگه src داشت و سالم بود → عکس کاربر
   - اگه نداشت یا لود نشد (onError) → آواتار پیش‌فرض
*/
export default function UserAvatar({
  src,
  alt = "پروفایل",
  className = "w-9 h-9",
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false);
  const showUserImage = Boolean(src) && !failed;

  return (
    <div
      className={`relative rounded-md overflow-hidden bg-primary-lightest shrink-0 ${className}`}
    >
      {showUserImage ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src!}
          alt={alt}
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src="/images/default-avatar.svg"
          alt="آواتار پیش‌فرض"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}