"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  PlusSquare,
  MessageCircle,
  User,
  Settings,
  Network,
  Bookmark,
  LogIn,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";

const mainItems = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/posts/create", label: "Create Post", icon: PlusSquare },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/mynetwork", label: "My Network", icon: Network },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isLoading, signOut } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-[240px] h-screen sticky top-0 border-r bg-background px-3 py-4">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 px-3 mb-6 font-semibold text-lg"
      >
        <Image src="/logo.svg" alt="စပါးအောင်သွယ်" width={28} height={28} className="shrink-0" />
        <span>စပါးအောင်သွယ်</span>
      </Link>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-1">
        {mainItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  isActive && "font-semibold"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{item.label}</span>
              </Button>
            </Link>
          );
        })}
        {/* Saved Posts */}
        <Link href="/saved">
          <Button
            variant={pathname === "/saved" ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 h-10",
              pathname === "/saved" && "font-semibold"
            )}
          >
            <Bookmark className="h-5 w-5" strokeWidth={pathname === "/saved" ? 2.5 : 1.8} />
            <span>Saved Posts</span>
          </Button>
        </Link>
        {isLoading ? null : user ? (
          <Link href={`/profile/${user.profile.username}`}>
            <Button
              variant={pathname.startsWith("/profile") ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-10",
                pathname.startsWith("/profile") && "font-semibold"
              )}
            >
              <User className="h-5 w-5" strokeWidth={pathname.startsWith("/profile") ? 2.5 : 1.8} />
              <span>Profile</span>
            </Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button
              variant={pathname === "/login" ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-10",
                pathname === "/login" && "font-semibold"
              )}
            >
              <LogIn className="h-5 w-5" strokeWidth={pathname === "/login" ? 2.5 : 1.8} />
              <span>Login</span>
            </Button>
          </Link>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 pt-4 border-t">
        <Link href="/settings">
          <Button variant="ghost" className="w-full justify-start gap-3 h-10">
            <Settings className="h-5 w-5" strokeWidth={1.8} />
            <span>Settings</span>
          </Button>
        </Link>
        {user && (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-10"
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5" strokeWidth={1.8} />
            <span>Logout</span>
          </Button>
        )}
        <p className="text-[10px] text-muted-foreground mt-3 px-3">
          © 2026 စပါးအောင်သွယ်
        </p>
      </div>
    </aside>
  );
}
