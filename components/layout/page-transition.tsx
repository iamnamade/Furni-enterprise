"use client";

import { ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = `${pathname}?${searchParams.toString()}`;

  return <div key={key}>{children}</div>;
}
