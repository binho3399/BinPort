"use client";

type TrackLinkProps = {
  href: string;
  label: string;
  eventName: string;
};

declare global {
  interface Window {
    va?: (eventName: string, data?: Record<string, unknown>) => void;
  }
}

export function TrackLink({ href, label, eventName }: TrackLinkProps) {
  return (
    <a
      href={href}
      onClick={() => {
        if (typeof window !== "undefined" && window.va) {
          window.va(eventName, { href, label });
        }
      }}
      style={{ textDecoration: "none", fontWeight: 600 }}
    >
      {label}
    </a>
  );
}
