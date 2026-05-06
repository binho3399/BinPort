"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    va?: (eventName: string, data?: Record<string, unknown>) => void;
  }
}

type ReadDepthTrackerProps = {
  slug: string;
};

export function ReadDepthTracker({ slug }: ReadDepthTrackerProps) {
  const hasTracked50 = useRef(false);
  const hasTracked75 = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      if (scrollHeight <= 0) {
        return;
      }
      const ratio = window.scrollY / scrollHeight;

      if (ratio >= 0.5 && !hasTracked50.current) {
        hasTracked50.current = true;
        window.va?.("case_study_read_50", { slug });
      }
      if (ratio >= 0.75 && !hasTracked75.current) {
        hasTracked75.current = true;
        window.va?.("case_study_read_75", { slug });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [slug]);

  return null;
}
