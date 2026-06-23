"use client";

import { MessageCircle } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { SignInGate } from "@/components/auth/sign-in-gate";
import { Button } from "@/components/ui/button";

function MessagesContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <SignInGate
        icon={MessageCircle}
        title="Sign in to view messages"
        description="Connect with farmers, traders, and agents directly in Myanmar's rice marketplace."
        redirectTo="/messages"
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-[780px]">
      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <MessageCircle className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold mb-2">Subscription Required</h2>
      <p className="text-sm text-muted-foreground mb-4 max-w-xs">
        Messaging is a premium feature. Upgrade your plan to connect with buyers and sellers.
      </p>
      <Button disabled>Coming Soon</Button>
    </div>
  );
}

export default function MessagesPage() {
  return <MessagesContent />;
}
