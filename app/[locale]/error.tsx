"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function LocaleError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-red-300 bg-red-50 p-6 text-center text-red-900">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="text-sm">The page failed to load. Please retry.</p>
      <Button variant="danger" onClick={reset}>
        Retry
      </Button>
    </div>
  );
}