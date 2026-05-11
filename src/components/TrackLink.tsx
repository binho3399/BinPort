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
      return "track-link track-link--primary";
    case "secondary":
      return "track-link track-link--secondary";
    case "link":
      return "track-link track-link--link";
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
    </a>
  );
}
