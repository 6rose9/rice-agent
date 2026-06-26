import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sprout,
  Users,
  ShieldCheck,
  Globe,
  ArrowLeft,
  TrendingUp,
  MapPin,
  Wheat,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — စပါးအောင်သွယ်",
  description:
    "Learn about စပါးအောင်သွယ် (Rice Agent), Myanmar's professional networking and marketplace platform for the rice industry.",
};

const features = [
  {
    icon: Wheat,
    title: "Rice Marketplace",
    description:
      "Buy and sell rice varieties across Myanmar. Post listings for Paw San, Shwe Bo Pawsan, Emata, and more with real-time market information.",
  },
  {
    icon: Users,
    title: "Professional Network",
    description:
      "Connect with farmers, traders, agents, and millers. Build your professional network within Myanmar's rice industry.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Community",
    description:
      "Verified profiles and role-based networking help you find reliable partners for your rice trading business.",
  },
  {
    icon: Globe,
    title: "Nationwide Coverage",
    description:
      "Covering all major rice-growing regions — from Ayeyarwady Delta to Shan State, connecting buyers and sellers across the country.",
  },
];

const stats = [
  { label: "Rice Varieties", value: "20+", icon: Sprout },
  { label: "Regions Covered", value: "14", icon: MapPin },
  { label: "User Roles", value: "5", icon: Users },
  { label: "Market Updates", value: "Daily", icon: TrendingUp },
];

export default function AboutPage() {
  return (
    <div className="flex">
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center gap-3 px-4 h-12">
            <Link href="/feed">
              <div className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </div>
            </Link>
            <h1 className="text-sm font-semibold">About</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Hero section */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                <h2 className="text-xl font-bold">
                  စပါးအောင်သွယ်
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Myanmar&apos;s professional networking and marketplace platform
                  dedicated to the rice industry. We connect everyone in the rice
                  supply chain — from farmers in the fields to traders in the
                  markets, agents coordinating logistics, and millers processing
                  the harvest.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge variant="secondary">🌾 Rice Trading</Badge>
                  <Badge variant="secondary">🤝 Networking</Badge>
                  <Badge variant="secondary">📊 Market Info</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4 text-center">
                  <stat.icon className="h-5 w-5 mx-auto text-primary mb-2" />
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features */}
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 shrink-0">
                      <feature.icon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mission */}
          <Card>
            <CardContent className="p-6 space-y-3">
              <h2 className="text-base font-semibold">Our Mission</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To digitize and connect Myanmar&apos;s rice industry, making it
                easier for every participant — from smallholder farmers to large
                traders — to find partners, negotiate fair prices, and grow their
                business.
              </p>
            </CardContent>
          </Card>

          {/* Roles */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-base font-semibold">Who Uses စပါးအောင်သွယ်?</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { emoji: "👨‍🌾", role: "Farmers", desc: "Sell your harvest directly to traders and get fair market prices" },
                  { emoji: "🏪", role: "Traders", desc: "Source rice varieties from across Myanmar and connect with buyers" },
                  { emoji: "🤝", role: "Agents", desc: "Connect buyers and sellers, coordinate logistics and deliveries" },
                  { emoji: "🏭", role: "Millers", desc: "Find quality paddy suppliers and sell processed rice" },
                ].map((item) => (
                  <div key={item.role} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <span className="text-xl">{item.emoji}</span>
                    <div>
                      <p className="text-sm font-medium">{item.role}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardContent className="p-6 space-y-3">
              <h2 className="text-base font-semibold">Contact Us</h2>
              <p className="text-sm text-muted-foreground">
                Have questions or feedback? We&apos;d love to hear from you.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Email:</span>
                <a
                  href="mailto:zinzinthinzaw@gmail.com"
                  className="text-primary hover:underline"
                >
                  zinzinthinzaw@gmail.com
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
