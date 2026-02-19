import React, { ReactNode, forwardRef } from "react";

type MotionProps = {
  initial?: unknown;
  animate?: unknown;
  exit?: unknown;
  transition?: unknown;
  whileInView?: unknown;
  viewport?: unknown;
  layout?: unknown;
};

const motionCache = new Map<string, React.ComponentType<Record<string, unknown>>>();

function createMotionTag(tag: string) {
  if (motionCache.has(tag)) {
    return motionCache.get(tag)!;
  }

  const Component = forwardRef<HTMLElement, Record<string, unknown> & MotionProps>((props, ref) => {
    const { initial, animate, exit, transition, whileInView, viewport, layout, ...rest } = props;
    return React.createElement(tag, { ...rest, ref });
  });

  Component.displayName = `Motion(${tag})`;
  motionCache.set(tag, Component);
  return Component;
}

export const motion = new Proxy(
  {},
  {
    get: (_target, tag: string) => createMotionTag(tag)
  }
) as Record<string, React.ComponentType<Record<string, unknown>>>;

export function AnimatePresence({
  children
}: {
  children: ReactNode;
  initial?: unknown;
  mode?: unknown;
}) {
  return <>{children}</>;
}
