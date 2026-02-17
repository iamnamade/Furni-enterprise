"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { Toaster } from "@/components/providers/toaster";
import { RouteProgress } from "@/components/layout/route-progress";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <RouteProgress />
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  );
}

