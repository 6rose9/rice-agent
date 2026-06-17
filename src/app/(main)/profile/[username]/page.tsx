"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { RightRail } from "@/components/layout/right-rail";
import { PostCard } from "@/components/feed/post-card";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  mockPosts,
  mockProfiles,
  marketStatusLabels,
  roleLabels,
} from "@/lib/mock-data";
import {
  MapPin,
  Calendar,
  Globe,
  Sprout,
  Users,
} from "lucide-react";

function ProfileContent() {
  const params = useParams();
  const username = params.username as string;
  const { isAuthenticated, user, signOut } = useAuth();

  const displayProfile =
    mockProfiles.find((p) => p.username === username) ?? null;

  const isOwnProfile = isAuthenticated && user?.username === username;

  if (!displayProfile) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Avatar className="h-20 w-20 mb-4">
          <AvatarFallback className="text-2xl bg-accent">?</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-semibold mb-2">Profile not found</h2>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
          The profile you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/feed">
          <Button>Back to Feed</Button>
        </Link>
      </div>
    );
  }

  const userPosts = mockPosts.filter((p) => p.author_id === displayProfile.id);

  const aboutPanel = (
    <div className="space-y-4 p-4">
      <div className="space-y-3">
        {displayProfile.bio && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-1">
              Bio
            </h3>
            <p className="text-sm leading-relaxed">{displayProfile.bio}</p>
          </div>
        )}
        <div className="space-y-1.5 text-sm">
          {displayProfile.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              {displayProfile.location}
            </div>
          )}
          {displayProfile.website && (
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <a
                href={displayProfile.website}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {displayProfile.website}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            Joined{" "}
            {new Date(displayProfile.created_at).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const networkPanel = (
    <div className="p-4 space-y-4">
      <p className="text-sm text-muted-foreground">
        Manage your network — view connections, invitations, and find people you
        may know.
      </p>
      <div className="space-y-2">
        <Link
          href="/mynetwork"
          className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors border"
        >
          <span className="text-sm font-medium">View All Connections</span>
          <span className="text-sm font-semibold text-muted-foreground">0</span>
        </Link>
        <Link
          href="/mynetwork"
          className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors border"
        >
          <span className="text-sm font-medium">Pending Invitations</span>
          <span className="text-sm font-semibold text-muted-foreground">0</span>
        </Link>
      </div>
      <Link href="/mynetwork">
        <Button variant="outline" size="sm" className="w-full">
          <Users className="h-4 w-4 mr-1.5" />
          Open Full Network
        </Button>
      </Link>
    </div>
  );

  const postsList =
    userPosts.length > 0 ? (
      userPosts.map((post) => (
        <PostCard key={post.id} post={post} isAuthenticated />
      ))
    ) : (
      <div className="text-center py-16">
        <Sprout className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium">No posts yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          {isOwnProfile
            ? "Create your first post to start connecting."
            : "This user hasn't posted yet."}
        </p>
      </div>
    );

  return (
    <div className="flex">
      <div className="flex-1 min-w-0">
        {/* Profile header */}
        <div className="relative">
          <div className="h-24 sm:h-32 bg-gradient-to-b from-emerald-200 to-green-100 dark:from-emerald-900 dark:to-green-950" />
          <div className="flex justify-center -mt-10 sm:-mt-12 mb-2">
            <Avatar className="h-20 w-20 sm:h-28 sm:w-28 ring-4 ring-background">
              <AvatarFallback className="text-2xl sm:text-4xl bg-accent">
                {displayProfile.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-center px-4">
            <h1 className="text-xl font-bold">{displayProfile.full_name}</h1>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              {roleLabels[displayProfile.role]}
              {displayProfile.location && (
                <>
                  <span>·</span>
                  <MapPin className="h-3 w-3" />
                  {displayProfile.location}
                </>
              )}
            </p>
            {displayProfile.market_status && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  {marketStatusLabels[displayProfile.market_status]}
                </Badge>
              </div>
            )}
            <div className="flex items-center justify-center gap-2 mt-3">
              {isOwnProfile ? (
                <>
                  <Link href="/profile/edit">
                    <Button size="sm" variant="outline">
                      Edit Profile
                    </Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={signOut}>
                    Sign Out
                  </Button>
                </>
              ) : isAuthenticated ? (
                <Button size="sm" variant="default">
                  Follow
                </Button>
              ) : (
                <Link href={`/login?redirect=${encodeURIComponent(`/profile/${username}`)}`}>
                  <Button size="sm" variant="default">Follow</Button>
                </Link>
              )}
            </div>
            <div className="flex justify-center gap-6 mt-4 py-3 border-t border-b">
              <div className="text-center">
                <p className="font-bold text-sm">{userPosts.length}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-sm">0</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-sm">0</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE: Tabs */}
        <div className="lg:hidden">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-transparent">
              <TabsTrigger
                value="posts"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Posts
              </TabsTrigger>
              <TabsTrigger
                value="about"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                About
              </TabsTrigger>
              <TabsTrigger
                value="network"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Network
              </TabsTrigger>
            </TabsList>
            <TabsContent value="posts">{postsList}</TabsContent>
            <TabsContent value="about">{aboutPanel}</TabsContent>
            <TabsContent value="network">{networkPanel}</TabsContent>
          </Tabs>
        </div>

        {/* DESKTOP: 2-column layout */}
        <div className="hidden lg:block">
          <div className="flex border-b">
            <button className="px-4 py-2.5 text-sm font-medium border-b-2 border-primary text-primary">
              Posts
            </button>
            <button className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </button>
            <Link
              href="/mynetwork"
              className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Network
            </Link>
          </div>
          <div className="flex">
            <div className="w-[280px] shrink-0 border-r min-h-0">
              <div className="sticky top-0">{aboutPanel}</div>
            </div>
            <div className="flex-1 min-w-0">{postsList}</div>
          </div>
        </div>
      </div>

      <RightRail
        variant="profile"
        profileStats={{
          posts: userPosts.length,
          followers: 0,
          topCategory: "Selling",
        }}
      />

    </div>
  );
}

export default function ProfilePage() {
  return <ProfileContent />;
}
