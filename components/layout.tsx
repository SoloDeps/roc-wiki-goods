import { OptionHeader } from "@/components/option/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/50 relative z-10 flex flex-col min-h-svh"> 
      <OptionHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
