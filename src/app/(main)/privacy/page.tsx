import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — စပါးအောင်သွယ်",
  description: "Privacy Policy for စပါးအောင်သွယ် (Rice Agent) platform.",
};

export default function PrivacyPage() {
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
            <h1 className="text-sm font-semibold">Privacy Policy</h1>
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
                  1. Information We Collect
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  When you register on စပါးအောင်သွယ်, we collect the following
                  information:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>
                    <strong>Account information:</strong> Full name, phone
                    number, and password
                  </li>
                  <li>
                    <strong>Profile information:</strong> Role (farmer, trader,
                    agent, etc.), location (region and township), and optional
                    bio
                  </li>
                  <li>
                    <strong>Content:</strong> Posts, comments, images, and other
                    content you create on the platform
                  </li>
                  <li>
                    <strong>Usage data:</strong> How you interact with the
                    platform, including pages visited and features used
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-base font-semibold">
                  2. How We Use Your Information
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use your information to:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>
                    Provide and maintain the စပါးအောင်သွယ် platform
                  </li>
                  <li>
                    Enable networking and marketplace features relevant to your
                    role
                  </li>
                  <li>
                    Show your profile and posts to other users as part of the
                    platform&apos;s core functionality
                  </li>
                  <li>
                    Improve the platform and develop new features based on usage
                    patterns
                  </li>
                  <li>
                    Communicate with you about your account and platform updates
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-base font-semibold">
                  3. Information Sharing
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your profile information (name, role, location) is visible to
                  other registered users on the platform. Your posts and
                  comments are visible according to the platform&apos;s
                  visibility rules.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We do not sell your personal information to third parties. We
                  may share information with service providers who assist in
                  operating the platform (such as hosting and database services),
                  subject to confidentiality obligations.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base font-semibold">
                  4. Data Storage and Security
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your data is stored on secure cloud infrastructure. We
                  implement industry-standard security measures to protect your
                  information, including encrypted password storage and secure
                  data transmission.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  However, no method of electronic storage or transmission is
                  100% secure. While we strive to protect your data, we cannot
                  guarantee absolute security.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base font-semibold">
                  5. Images and Uploaded Content
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Images you upload (profile photos, post images) are stored
                  securely and displayed as part of your profile and listings.
                  You retain ownership of your uploaded content.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base font-semibold">
                  6. Cookies and Tracking
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use essential cookies for authentication and session
                  management. We do not use third-party advertising or tracking
                  cookies.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base font-semibold">7. Your Rights</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You have the right to:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Access and review your personal data</li>
                  <li>Update or correct your profile information</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your data</li>
                </ul>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You can manage your profile from the{" "}
                  <a
                    href="/profile/edit"
                    className="text-primary hover:underline"
                  >
                    edit profile
                  </a>{" "}
                  page and delete your account from{" "}
                  <a href="/settings" className="text-primary hover:underline">
                    settings
                  </a>
                  .
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base font-semibold">
                  8. Children&apos;s Privacy
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  စပါးအောင်သွယ် is not intended for users under 18 years of age.
                  We do not knowingly collect information from children.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base font-semibold">
                  9. Changes to This Policy
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will
                  notify users of significant changes. Your continued use of the
                  platform after changes constitutes acceptance of the updated
                  policy.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base font-semibold">10. Contact</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  For questions about this Privacy Policy, contact us at{" "}
                  <a
                    href="mailto:riceagent.support@gmail.com"
                    className="text-primary hover:underline"
                  >
                    riceagent.support@gmail.com
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
