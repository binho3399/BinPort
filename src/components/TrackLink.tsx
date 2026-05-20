"use client";

type TrackLinkVariant = "primary" | "secondary" | "link";

type TrackLinkProps = {
  href: string;
  label: string;
  eventName: string;
  variant?: TrackLinkVariant;
};

declare global {
  interface Window {
    va?: (eventName: string, data?: Record<string, unknown>) => void;
  }
}

function trackLinkClassName(variant: TrackLinkVariant | undefined): string {
  switch (variant ?? "link") {
    case "primary":
      return "btn-primary w-full sm:w-auto";
    case "secondary":
      return "btn-secondary w-full sm:w-auto";
    case "link":
      return "text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors font-medium inline-flex items-center gap-1";
  }
}

export function TrackLink({ href, label, eventName, variant }: TrackLinkProps) {
  return (
    <a
      href={href}
      className={trackLinkClassName(variant)}
      onClick={() => {
        if (typeof window !== "undefined" && window.va) {
          window.va(eventName, { href, label });
        }
      }}
    >
      {label}
      {variant === "link" && (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
        </svg>
      )}
    </a>
  );
}
