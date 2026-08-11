import { Inter } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"] });

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={inter.className}>
      <AppShell>
        {children}
      </AppShell>
    </div>
  );
}
