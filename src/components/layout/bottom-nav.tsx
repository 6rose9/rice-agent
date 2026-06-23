"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Network, PlusSquare, MessageCircle, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
const navItems = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/mynetwork", label: "My Network", icon: Network },
  { href: "/posts/create", label: "Post", icon: PlusSquare, highlight: true },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/pricing", label: "Pricing", icon: Crown },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex h-14 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full flex-col gap-0.5 h-auto py-1",
                  isActive && "text-primary",
                  item.highlight && "text-primary hover:text-primary/80"
                )}
              >
                {item.highlight ? (
                  <span className="relative flex items-center justify-center">
                    <Icon className="h-6 w-6" strokeWidth={1.8} />
                  </span>
                ) : (
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                )}
                <span className="text-[10px] leading-tight">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
