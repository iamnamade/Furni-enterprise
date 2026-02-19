import { ReactNode } from "react";

export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <div className="reveal-block" style={{ animationDelay: `${Math.max(delay, 0)}s` }}>
      {children}
    </div>
  );
}
