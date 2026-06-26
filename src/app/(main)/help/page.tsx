import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle, MessageSquare, BookOpen, Phone } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help — စပါးအောင်သွယ်",
  description:
    "Get help and support for စပါးအောင်သွယ် (Rice Agent) platform.",
};

const quickLinks = [
  {
    icon: BookOpen,
    title: "Getting Started",
    description: "Learn the basics",
  },
  {
    icon: MessageSquare,
    title: "Contact Support",
    description: "Reach our team",
  },
  {
    icon: Phone,
    title: "Report an Issue",
    description: "Let us know",
  },
];

const faqs = [
  {
    question: "How do I create an account?",
    answer:
      'Click the "Register" button on the login page. Enter your full name, phone number, and password. Select your role in the rice industry (farmer, trader, agent, miller, or general user) and choose your location. Once registered, you can start using the platform immediately.',
  },
  {
    question: "What rice types can I trade?",
    answer:
      "စပါးအောင်သွယ် supports all major Myanmar rice varieties including Paw San, Shwe Bo Pawsan, Emata, Ngasein, Pawsan Hmatt, and more. You can specify the rice type when creating buying or selling posts.",
  },
  {
    question: "How do I create a buying or selling post?",
    answer:
      'Navigate to "Create Post" from the sidebar or the + button. Choose the post type (general, buying, or selling). For trading posts, you\'ll need to specify the rice type, quantity, and optional price. Add images to make your listing more attractive.',
  },
  {
    question: "What are the subscription tiers?",
    answer:
      "စပါးအောင်သွယ် offers three subscription tiers: Demo (free, for testing), Local (for regional traders), and Pro (for nationwide operations). Higher tiers allow more posts and additional features. Visit the Pricing page for full details.",
  },
  {
    question: "How do I connect with other users?",
    answer:
      'You can follow other users to see their posts in your feed, or send connection requests for mutual networking. Visit any user\'s profile and click "Follow" or "Connect". You can manage your network from the My Network page.',
  },
  {
    question: "How do I edit my profile?",
    answer:
      'Go to your profile page and click "Edit Profile", or navigate directly to Settings > Edit Profile. You can update your name, bio, location, and profile image from there.',
  },
  {
    question: "Can I save posts for later?",
    answer:
      'Yes. Click the bookmark icon on any post to save it. You can find all your saved posts in the "Saved" section accessible from the sidebar.',
  },
  {
    question: "How do I delete my account?",
    answer:
      'Go to Settings and look for the "Delete Account" option. Please note that account deletion is permanent and will remove all your data, posts, and connections.',
  },
  {
    question: "Is my phone number visible to other users?",
    answer:
      "Your phone number is used only for login authentication and is not displayed on your public profile. Other users can only see your name, role, location, and the information you choose to share.",
  },
  {
    question: "How do I report inappropriate content?",
    answer:
      'If you see a post or user that violates our community guidelines, please contact us at zinzinthinzaw@gmail.com with details. We take all reports seriously and will investigate promptly.',
  },
];

export default function HelpPage() {
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
            <h1 className="text-sm font-semibold">Help Center</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Quick links */}
          <div className="grid grid-cols-3 gap-3">
            {quickLinks.map((link) => (
              <Card key={link.title}>
                <CardContent className="p-4 text-center">
                  <link.icon className="h-6 w-6 mx-auto text-primary mb-2" />
                  <h3 className="text-sm font-semibold">{link.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {link.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ */}
          <Card>
            <CardContent className="p-6">
              <Accordion className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-sm text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardContent className="p-6 text-center space-y-2">
              <HelpCircle className="h-8 w-8 mx-auto text-primary" />
              <p className="text-sm font-medium">Still need help?</p>
              <p className="text-sm text-muted-foreground">
                Contact our support team at{" "}
                <a
                  href="mailto:zinzinthinzaw@gmail.com"
                  className="text-primary hover:underline"
                >
                  zinzinthinzaw@gmail.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
