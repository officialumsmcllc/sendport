import React from "react";

export function SendportLogo({
  size = 32,
  showText = true,
  className = "",
  dark = false,
}: {
  size?: number;
  showText?: boolean;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight select-none ${className}`}>
      {/* Dynamic Vector Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm transition-transform hover:scale-105"
      >
        <rect width="40" height="40" rx="10" fill="url(#sendport-grad)" />
        {/* Modern Stylized Paper Plane & Port Beam */}
        <path
          d="M10 20.5L30 11L21.5 31L17.5 22.5L10 20.5Z"
          fill="white"
          fillOpacity="0.95"
        />
        <path
          d="M17.5 22.5L30 11"
          stroke="url(#sendport-accent)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="sendport-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4F46E5" />
            <stop offset="1" stopColor="#0EA5E9" />
          </linearGradient>
          <linearGradient id="sendport-accent" x1="17" y1="11" x2="30" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E0E7FF" />
            <stop offset="1" stopColor="#38BDF8" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <span className={`text-xl font-extrabold tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>
          Send<span className="text-primary-600 font-black">port</span>
        </span>
      )}
    </div>
  );
}
