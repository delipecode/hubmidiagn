"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <div className="min-h-screen w-full bg-[#F4F6FB]">{children}</div>;
  }

  return (
    <>
      <Sidebar />
      <div className="lg:pl-72 flex flex-col min-h-screen w-full">
        <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 sm:p-6 md:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </>
  );
}
