"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TopBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-12 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-base">
          <Image src="/logo.svg" alt="စပါးအောင်သွယ်" width={20} height={20} className="shrink-0" />
          <span className="hidden sm:inline text-primary">စပါးအောင်သွယ်</span>
          <span className="sm:hidden text-primary text-sm">စပါးအောင်သွယ်</span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MessageCircle className="h-4 w-4" />
          </Button>
          {/* Avatar shown when logged in; otherwise show login button */}
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs">?</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
