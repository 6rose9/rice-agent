import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — စပါးအောင်သွယ်",
  description: "Terms of Service for စပါးအောင်သွယ် (Rice Agent) platform.",
};

export default function TermsPage() {
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
            <h1 className="text-sm font-semibold">Terms of Service</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <Card>
            <CardContent className="p-6 space-y-6">
              <p className="text-xs text-muted-foreground">
                Last updated: June 2026
              </p>

              <section className="space-y-3">
                <h2 className="text-base font-semibold">
                  1. Acceptance of Terms
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  By accessing or using စပါးအောင်သွယ် (Rice Agent), you agree to
                  be bound by these Terms of Service. If you do not agree to
                  these terms, please do not use the platform.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base font-semibold">2. Eligibility</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You must be at least 18 years old to use this platform. By
                  using စပါးအောင်သွယ်, you represent that you meet this age
                  requirement and have the legal capacity to enter into binding
                  agreements.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base font-semibold">
                  3. Account Registration
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You must provide accurate and complete information when
                  creating your account, including your real name, phone number,
                  and role in the rice industry. You are responsible for
                  maintaining the confidentiality of your account credentials.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base font-semibold">4. User Roles</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  စပါးအောင်သွယ် supports the following user roles: Farmer, Trader,
                  Agent, Miller, and General User. Each role has specific
                  features and permissions. You must select the role that
                  accurately reflects your participation in the rice industry.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base font-semibold">
                  5. Marketplace Posts
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  When creating buying or selling posts, you must provide
                  accurate information about the rice variety, quantity, price,
                  and location. Misleading or fraudulent listings are strictly
                  prohibited and may result in account suspension.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Free-tier users can create general posts. Buying and selling
                  posts require a valid subscription tier (Demo, Local, or Pro).
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base font-semibold">
                  6. Prohibited Conduct
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You agree not to:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Post false, misleading, or fraudulent content</li>
                  <li>Impersonate another person or entity</li>
                  <li>Spam or harass other users</li>
                  <li>Use the platform for any illegal purpose</li>
                  <li>Attempt to access other users&apos; accounts</li>
                  <li>Scrape or automatedly collect data from the platform</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-base font-semibold">
                  7. Content Ownership
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You retain ownership of content you post on စပါးအောင်သွယ်. By
                  posting content, you grant us a non-exclusive license to
                  display, distribute, and promote your content within the
                  platform.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base font-semibold">
                  8. Limitation of Liability
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  စပါးအောင်သွယ် is a networking and listing platform. We are not a
                  party to any transaction between users. We do not guarantee
                  the quality, safety, or legality of items listed, or the
                  ability of buyers or sellers to complete transactions.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base font-semibold">9. Termination</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We reserve the right to suspend or terminate your account at
                  our discretion, particularly for violations of these terms.
                  You may also delete your account at any time from the settings
                  page.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base font-semibold">
                  10. Changes to Terms
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We may update these terms from time to time. We will notify
                  users of significant changes. Continued use of the platform
                  after changes constitutes acceptance of the updated terms.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base font-semibold">11. Contact</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  For questions about these Terms, contact us at{" "}
                  <a
                    href="mailto:zinzinthinzaw@gmail.com"
                    className="text-primary hover:underline"
                  >
                    zinzinthinzaw@gmail.com
                  </a>
                  .
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
