"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface RevealProps {
  as?: "div" | "li";
  className?: string;
  children: ReactNode;
}

// Adds `.is-visible` (see globals.css `.reveal`) the first time the element
// scrolls into view. Purely presentational — content is already in the
// server-rendered HTML, so nothing here affects what search engines or
// no-JS clients see.
export function Reveal({ as = "div", className = "", children }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -60px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const combinedClassName = `reveal ${className}`.trim();

  if (as === "li") {
    return (
      <li ref={ref as React.RefObject<HTMLLIElement>} className={combinedClassName}>
        {children}
      </li>
    );
  }

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={combinedClassName}>
      {children}
    </div>
  );
}
