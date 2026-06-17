import { AuthProvider } from "@/components/auth/auth-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex justify-center min-h-screen">
        <div className="flex w-full max-w-[1280px]">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <div className="md:hidden"><TopBar /></div>
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <BottomNav />
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
