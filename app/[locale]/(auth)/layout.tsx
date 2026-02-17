import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex min-h-[68vh] w-full max-w-md items-center justify-center">{children}</div>;
}