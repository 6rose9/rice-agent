import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockProfiles, roleLabels } from "@/lib/mock-data";
import { Clock, TrendingUp, Bookmark, Sprout } from "lucide-react";

type RightRailVariant = "feed" | "profile" | "search" | "network";

interface RightRailProps {
  variant?: RightRailVariant;
  /** Profile-specific: pass the viewed user's data for Quick Stats */
  profileStats?: { posts: number; followers: number; topCategory?: string };
}

export function RightRail({ variant = "feed", profileStats }: RightRailProps) {
  const suggestions = mockProfiles.slice(0, 3);

  const baseClasses =
    "hidden lg:flex flex-col w-[260px] xl:w-[300px] gap-4 sticky top-0 h-screen pt-4 px-2";
  
  const cardClasses = "border-0 shadow-none bg-transparent px-2";

  const footerLinks = (
    <div className="text-[10px] text-muted-foreground space-y-1 pt-2">
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        <Link href="/about" className="hover:underline">About</Link>
        <Link href="/terms" className="hover:underline">Terms</Link>
        <Link href="/privacy" className="hover:underline">Privacy</Link>
        <Link href="/help" className="hover:underline">Help</Link>
      </div>
      <p>© 2026 စပါးအောင်သွယ်</p>
    </div>
  );

  // --- Feed variant (default) ---
  if (variant === "feed") {
    return (
      <aside className={baseClasses}>
        {/* Suggestions */}
        <Card className={cardClasses}>
          <CardHeader className="pb-2 pt-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3">
            {suggestions.map((profile) => (
              <div key={profile.id} className="flex items-center gap-3 group">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="text-sm bg-accent">
                    {profile.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/profile/${profile.username}`}
                    className="text-sm font-medium hover:text-primary truncate block"
                  >
                    {profile.full_name}
                  </Link>
                  <p className="text-xs text-muted-foreground truncate">
                    {roleLabels[profile.role] || profile.role}
                    {profile.location && ` · ${profile.location.split(",")[0]}`}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs rounded-full px-3 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Follow
                </Button>
              </div>
            ))}
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              See All →
            </Button>
          </CardContent>
        </Card>

        {/* Trending */}
        <Card className={cardClasses}>
          <CardHeader className="pb-2 pt-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Trending
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-1.5">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="cursor-pointer">🌾 Paw San</Badge>
              <Badge variant="secondary" className="cursor-pointer">📍 Delta</Badge>
              <Badge variant="secondary" className="cursor-pointer">💰 &lt;15K</Badge>
              <Badge variant="secondary" className="cursor-pointer">🍚 Shwe Bo</Badge>
            </div>
          </CardContent>
        </Card>

        {footerLinks}
      </aside>
    );
  }

  // --- Profile variant ---
  if (variant === "profile") {
    return (
      <aside className={baseClasses}>
        {/* Similar Traders */}
        <Card className={cardClasses}>
          <CardHeader className="pb-2 pt-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Similar Traders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3">
            {suggestions.map((profile) => (
              <div key={profile.id} className="flex items-center gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="text-sm bg-accent">
                    {profile.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/profile/${profile.username}`}
                    className="text-sm font-medium hover:text-primary truncate block"
                  >
                    {profile.full_name}
                  </Link>
                  <p className="text-xs text-muted-foreground truncate">
                    {roleLabels[profile.role] || profile.role}
                    {profile.location && ` · ${profile.location.split(",")[0]}`}
                  </p>
                </div>
              </div>
            ))}
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              See All →
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {profileStats && (
          <Card className={cardClasses}>
            <CardHeader className="pb-2 pt-0">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Sprout className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">{profileStats.posts}</span>
                <span className="text-muted-foreground">Posts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{profileStats.followers}</span>
                <span className="text-muted-foreground">Followers</span>
              </div>
              {profileStats.topCategory && (
                <div className="flex items-center gap-2">
                  <span>🏷️</span>
                  <span className="text-muted-foreground">Top: </span>
                  <span>{profileStats.topCategory}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {footerLinks}
      </aside>
    );
  }

  // --- Network variant ---
  if (variant === "network") {
    return (
      <aside className={baseClasses}>
        {/* Manage Network */}
        <Card className={cardClasses}>
          <CardHeader className="pb-2 pt-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Manage Network
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-2">
            <Link
              href="/mynetwork"
              className="flex items-center justify-between text-sm py-1 hover:text-primary transition-colors"
            >
              <span>🔗 Connections</span>
              <span className="font-semibold">156</span>
            </Link>
            <Link
              href="/mynetwork"
              className="flex items-center justify-between text-sm py-1 hover:text-primary transition-colors"
            >
              <span>📥 Following</span>
              <span className="font-semibold">89</span>
            </Link>
            <Link
              href="/mynetwork"
              className="flex items-center justify-between text-sm py-1 hover:text-primary transition-colors"
            >
              <span>📤 Followers</span>
              <span className="font-semibold">42</span>
            </Link>
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        <Card className={cardClasses}>
          <CardHeader className="pb-2 pt-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-sm">
              <span className="font-medium">3</span>{" "}
              <span className="text-muted-foreground">invitations</span>
            </p>
          </CardContent>
        </Card>

        {footerLinks}
      </aside>
    );
  }

  // --- Search variant ---
  if (variant === "search") {
    return (
      <aside className={baseClasses}>
        {/* Saved Searches */}
        <Card className={cardClasses}>
          <CardHeader className="pb-2 pt-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
              <Bookmark className="h-3.5 w-3.5" />
              Saved Searches
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-2">
            <button className="flex items-center gap-2 text-sm w-full text-left py-1 hover:text-primary transition-colors">
              <Clock className="h-3 w-3 text-muted-foreground" />
              Paw San
            </button>
            <button className="flex items-center gap-2 text-sm w-full text-left py-1 hover:text-primary transition-colors">
              <Clock className="h-3 w-3 text-muted-foreground" />
              Shwe Bo
            </button>
            <button className="flex items-center gap-2 text-sm w-full text-left py-1 hover:text-primary transition-colors">
              <Clock className="h-3 w-3 text-muted-foreground" />
              U Kyaw Min
            </button>
          </CardContent>
        </Card>

        {/* Trending Keywords */}
        <Card className={cardClasses}>
          <CardHeader className="pb-2 pt-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Trending Keywords
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-1.5">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="cursor-pointer">🌾 Emata</Badge>
              <Badge variant="secondary" className="cursor-pointer">📍 Delta</Badge>
              <Badge variant="secondary" className="cursor-pointer">🍚 Shwe Bo</Badge>
            </div>
          </CardContent>
        </Card>

        {footerLinks}
      </aside>
    );
  }

  return null;
}
