"use client";

import { MessageCircle } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

function MessagesContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <MessageCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-2">
          Sign in to view messages
        </h2>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
          Connect with farmers, traders, and agents directly in Myanmar&apos;s rice marketplace.
        </p>
        <a href="/login?redirect=%2Fmessages">
          <Button>Sign In</Button>
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <MessageCircle className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold mb-2">Subscription Required</h2>
      <p className="text-sm text-muted-foreground mb-4 max-w-xs">
        Messaging is a premium feature. Upgrade your plan to connect with buyers and sellers.
      </p>
      <Button>Buy Plan</Button>
    </div>
  );
}

export default function MessagesPage() {
  return <MessagesContent />;
}
