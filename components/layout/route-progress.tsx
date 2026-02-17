"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";

export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    setProgress(16);

    const stageOne = setTimeout(() => setProgress(68), 110);
    const stageTwo = setTimeout(() => setProgress(100), 320);
    const stageThree = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 560);

    return () => {
      clearTimeout(stageOne);
      clearTimeout(stageTwo);
      clearTimeout(stageThree);
    };
  }, [pathname, search]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="pointer-events-none fixed inset-x-0 top-0 z-[120] h-[3px] origin-left bg-brand-secondary shadow-[0_0_22px_rgba(247,231,206,0.75)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, scaleX: progress / 100 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        />
      ) : null}
    </AnimatePresence>
  );
}

