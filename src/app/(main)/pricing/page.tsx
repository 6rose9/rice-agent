"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Crown, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/auth-provider";
import { SignInGate } from "@/components/auth/sign-in-gate";
import {
  getSubscriptionTier,
  setSubscriptionTier,
  type SubscriptionTier,
} from "@/lib/subscription";

const plans = [
  {
    tier: "free" as const,
    name: "Free",
    price: "Free",
    description: "Get started with basic features",
    features: [
      "Create general posts",
      "Up to 2 images per post",
      "Follow other users",
      "View feed & search",
    ],
    cta: "Current Plan",
  },
  {
    tier: "pro" as const,
    name: "Pro",
    price: "25,000 MMK",
    period: "/month",
    description: "Unlock trading features for your business",
    features: [
      "Everything in Free",
      "Create buying & selling posts",
      "Up to 5 images per post",
      "Trading details (price, quantity, location)",
      "Pro badge on posts",
      "Priority in search results",
    ],
    cta: "Subscribe",
  },
];

function PricingContent() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const reason = searchParams.get("reason");
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>("free");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setCurrentTier(getSubscriptionTier());
  }, []);

  // Auto-redirect if already pro and a redirect target is set
  useEffect(() => {
    if (currentTier !== "free" && redirectTo) {
      router.replace(redirectTo);
    }
  }, [currentTier, redirectTo, router]);

  if (!isAuthenticated) {
    return (
      <SignInGate
        icon={Crown}
        title="Sign in to view plans"
        description="Choose a plan that fits your rice trading needs."
        redirectTo="/pricing"
      />
    );
  }

  function handleSubscribe(tier: SubscriptionTier) {
    setSubscriptionTier(tier);
    setCurrentTier(tier);
    if (redirectTo) {
      router.replace(redirectTo);
    } else {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }

  return (
    <div className="flex flex-col h-full max-w-[780px]">
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-base font-semibold">Pricing</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 mt-4">
        {reason === "pro_required" && (
          <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
            <span className="font-semibold">Pro subscription required.</span>{" "}
            Buying and selling posts are available for Pro subscribers. Choose a plan below to unlock.
          </div>
        )}

        {showSuccess && (
          <div className="rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400">
            Plan updated successfully!
          </div>
        )}

        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold">Choose Your Plan</h2>
          <p className="text-sm text-muted-foreground">
            {reason === "pro_required"
              ? "Subscribe to Pro to create buying and selling posts."
              : "Unlock trading features to buy and sell rice on the marketplace."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => {
            const isCurrent = currentTier === plan.tier;
            const isPro = plan.tier === "pro";
            const canSubscribe = !isCurrent && isPro;

            return (
              <Card
                key={plan.tier}
                className={isCurrent ? "border-primary" : ""}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {isCurrent && (
                      <Badge variant="default" className="text-xs">
                        Current
                      </Badge>
                    )}
                    {isPro && !isCurrent && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Crown className="h-3 w-3" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-sm text-muted-foreground">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : canSubscribe ? (
                    <Button
                      className="w-full"
                      onClick={() => handleSubscribe("pro")}
                    >
                      Subscribe
                    </Button>
                  ) : null}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-xs text-yellow-500">
          This is a mock subscription for demo purposes. No real payment is
          processed.
        </p>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={null}>
      <PricingContent />
    </Suspense>
  );
}
