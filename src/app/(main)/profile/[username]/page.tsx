"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RightRail } from "@/components/layout/right-rail";
import { PostCard } from "@/components/feed/post-card";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { getPostsByAuthor } from "@/lib/posts/actions";
import { getFollowInfo, getConnectionStatus, getConnectionCount } from "@/lib/network/actions";
import type { ConnectionStatus } from "@/lib/network/actions";
import { FollowButton } from "@/components/network/follow-button";
import { ConnectButton } from "@/components/network/connect-button";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/constants";
import { useMarketStatuses } from "@/hooks/use-market-statuses";
import { useRegions } from "@/hooks/use-regions";
import { MarketStatusSelector } from "@/components/profile/market-status-selector";
import type { Profile, Post } from "@/types";
import { MapPin, Calendar, Sprout, Users, Loader2, Camera, Phone, Mail, Lock } from "lucide-react";

function ProfileContent() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { isAuthenticated, user: currentUser, refreshProfile } = useAuth();
  const { getLocationLabel } = useRegions();

  const [displayProfile, setDisplayProfile] = useState<Profile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [followInfo, setFollowInfo] = useState<{
    followerCount: number;
    followingCount: number;
    isFollowing: boolean;
  }>({ followerCount: 0, followingCount: 0, isFollowing: false });
  const [connectionInfo, setConnectionInfo] = useState<{
    status: ConnectionStatus;
    connectionCount: number;
  }>({ status: "none", connectionCount: 0 });

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const isOwnProfile =
    isAuthenticated && currentUser?.profile.username === username;

  /** Check if the current viewer can see a field based on its visibility setting */
  function canSeeField(visibility: string | undefined): boolean {
    if (isOwnProfile) return true;
    if (!visibility || visibility === "public") return true;
    // "followers" is treated as private until the follows feature is built
    return false;
  }

  /** Get the display value for a contact field, respecting privacy */
  function getContactDisplay(
    value: string | null | undefined,
    visibility: string | undefined,
  ): { show: boolean; text: string; locked: boolean } {
    if (!value) return { show: false, text: "", locked: false };
    if (canSeeField(visibility)) {
      return { show: true, text: value, locked: false };
    }
    // Hidden — show a placeholder
    const label = visibility === "followers" ? "Followers only" : "Hidden";
    return { show: true, text: label, locked: true };
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setUploadingAvatar(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `avatars/${currentUser.profile.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("profiles")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      console.error("Avatar upload failed:", uploadError.message);
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("profiles")
      .getPublicUrl(path);
    const avatarUrl = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", currentUser.profile.id);

    if (!updateError) {
      setDisplayProfile((prev) =>
        prev ? { ...prev, avatar_url: avatarUrl } : prev,
      );
      await refreshProfile();
    }
    setUploadingAvatar(false);
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setUploadingCover(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `covers/${currentUser.profile.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("profiles")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      console.error("Cover upload failed:", uploadError.message);
      setUploadingCover(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("profiles")
      .getPublicUrl(path);
    const coverUrl = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ cover_url: coverUrl })
      .eq("id", currentUser.profile.id);

    if (!updateError) {
      setDisplayProfile((prev) =>
        prev ? { ...prev, cover_url: coverUrl } : prev,
      );
      await refreshProfile();
    }
    setUploadingCover(false);
  }

  // Fetch profile from Supabase
  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      setLoadError("");

      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch profile:", error.message);
        setLoadError("Failed to load profile.");
        setDisplayProfile(null);
        setIsLoading(false);
        return;
      }

      if (!data) {
        setDisplayProfile(null);
        setIsLoading(false);
        return;
      }

      const profile = data as Profile;
      setDisplayProfile(profile);

      // Fetch posts, follow info, and connection info in parallel
      const [posts, info, connStatus, connCount] = await Promise.all([
        getPostsByAuthor(profile.id, profile),
        getFollowInfo(profile.id),
        getConnectionStatus(profile.id),
        getConnectionCount(profile.id),
      ]);
      setUserPosts(posts);
      setFollowInfo(info);
      setConnectionInfo({ status: connStatus, connectionCount: connCount });

      setIsLoading(false);
    }

    fetchProfile();
  }, [username]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Avatar className="h-20 w-20 mb-4">
          <AvatarFallback className="text-2xl bg-accent">!</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-4">{loadError}</p>
        <Link href="/feed">
          <Button>Back to Feed</Button>
        </Link>
      </div>
    );
  }

  // Not found state
  if (!displayProfile) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Avatar className="h-20 w-20 mb-4">
          <AvatarFallback className="text-2xl bg-accent">?</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-semibold mb-2">Profile not found</h2>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
          The profile you&apos;re looking for doesn&apos;t exist or may have
          been removed.
        </p>
        <Link href="/feed">
          <Button>Back to Feed</Button>
        </Link>
      </div>
    );
  }

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
          {/* Contact info with privacy controls */}
          {(() => {
            const profile = displayProfile as Record<string, unknown>;
            const phoneDisplay = getContactDisplay(
              displayProfile.phone,
              profile.phone_visibility as string | undefined,
            );
            const emailDisplay = getContactDisplay(
              displayProfile.email,
              profile.email_visibility as string | undefined,
            );

            return (
              <>
                {phoneDisplay.show && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    {phoneDisplay.locked ? (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        {phoneDisplay.text}
                      </span>
                    ) : (
                      <span>{phoneDisplay.text}</span>
                    )}
                  </div>
                )}
                {emailDisplay.show && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {emailDisplay.locked ? (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        {emailDisplay.text}
                      </span>
                    ) : (
                      <span>{emailDisplay.text}</span>
                    )}
                  </div>
                )}
              </>
            );
          })()}
          {getLocationLabel(displayProfile) && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              {getLocationLabel(displayProfile)}
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
          href="/mynetwork/connections"
          className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors border"
        >
          <span className="text-sm font-medium">View All Connections</span>
          <span className="text-sm font-semibold text-muted-foreground">{connectionInfo.connectionCount}</span>
        </Link>
        <Link
          href="/mynetwork/invitations"
          className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors border"
        >
          <span className="text-sm font-medium">Pending Invitations</span>
          <span className="text-sm font-semibold text-muted-foreground">
            <Mail className="h-4 w-4" />
          </span>
        </Link>
      </div>
      <Link href="/mynetwork">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Users className="h-4 w-4 mr-1.5" />
          Open Full Network
        </Button>
      </Link>
    </div>
  );

  const postsList =
    userPosts.length > 0 ? (
      userPosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          isAuthenticated={isAuthenticated}
          currentUserId={currentUser?.profile.id}
          onRefresh={() => {
            if (displayProfile?.id) {
              getPostsByAuthor(displayProfile.id).then(setUserPosts);
            }
          }}
        />
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
          <div
            className={`h-24 sm:h-32 bg-gradient-to-b from-emerald-200 to-green-100 dark:from-emerald-900 dark:to-green-950 ${isOwnProfile ? "cursor-pointer group relative" : ""}`}
            style={
              displayProfile.cover_url
                ? {
                    backgroundImage: `url(${displayProfile.cover_url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
            onClick={() => isOwnProfile && coverInputRef.current?.click()}
          >
            {isOwnProfile && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                {uploadingCover ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            )}
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverUpload}
          />
          <div className="flex justify-center -mt-10 sm:-mt-12 mb-2">
            <div
              className={`relative ${isOwnProfile ? "cursor-pointer group" : ""}`}
              onClick={() => isOwnProfile && avatarInputRef.current?.click()}
            >
              <Avatar className="h-20 w-20 sm:h-28 sm:w-28 ring-4 ring-background">
                {displayProfile.avatar_url ? (
                  <AvatarImage
                    src={displayProfile.avatar_url}
                    alt={displayProfile.full_name}
                  />
                ) : (
                  <AvatarFallback className="text-2xl sm:text-4xl bg-accent">
                    {displayProfile.full_name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              {isOwnProfile && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 rounded-full transition-colors">
                  {uploadingAvatar ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              )}
            </div>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <div className="text-center px-4">
            <h1 className="text-xl font-bold">{displayProfile.full_name}</h1>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              {ROLE_LABELS[displayProfile.role as keyof typeof ROLE_LABELS] || displayProfile.role}
              {getLocationLabel(displayProfile) && (
                <>
                  <span>·</span>
                  <MapPin className="h-3 w-3" />
                  {getLocationLabel(displayProfile)}
                </>
              )}
            </p>
            <div className="mt-2">
              <MarketStatusSelector
                currentStatusId={displayProfile.market_status_id}
                isOwnProfile={!!isOwnProfile}
                onStatusChange={(newStatusId) =>
                  setDisplayProfile((prev) =>
                    prev ? { ...prev, market_status_id: newStatusId } : prev,
                  )
                }
              />
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              {isOwnProfile ? (
                <>
                  <Link href="/profile/edit">
                    <Button
                      size="sm"
                      variant="outline"
                    >
                      Edit Profile
                    </Button>
                  </Link>
                </>
              ) : isAuthenticated ? (
                <>
                  <ConnectButton
                    targetUserId={displayProfile.id}
                    initialStatus={connectionInfo.status}
                  />
                  <FollowButton
                    targetUserId={displayProfile.id}
                    initialIsFollowing={followInfo.isFollowing}
                    variant="outline"
                  />
                </>
              ) : (
                <Link
                  href={`/login?redirect=${encodeURIComponent(`/profile/${username}`)}`}
                >
                  <Button
                    size="sm"
                    variant="default"
                  >
                    Connect
                  </Button>
                </Link>
              )}
            </div>
            <div className="flex justify-center gap-6 mt-4 py-3 border-t border-b">
              <div className="text-center">
                <p className="font-bold text-sm">{userPosts.length}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-sm">{connectionInfo.connectionCount}</p>
                <p className="text-xs text-muted-foreground">Connections</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-sm">{followInfo.followerCount}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-sm">{followInfo.followingCount}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE: Tabs */}
        <div className="lg:hidden">
          <Tabs
            defaultValue="posts"
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-transparent">
              <TabsTrigger
                value="about"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                About
              </TabsTrigger>
              <TabsTrigger
                value="posts"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Posts
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

        {/* DESKTOP: Tabs (same as mobile) */}
        <div className="hidden lg:block">
          <Tabs
            defaultValue="posts"
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-transparent">
              <TabsTrigger
                value="about"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                About
              </TabsTrigger>
              <TabsTrigger
                value="posts"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Posts
              </TabsTrigger>
              <TabsTrigger
                value="network"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Network
              </TabsTrigger>
            </TabsList>
            <TabsContent value="about">{aboutPanel}</TabsContent>
            <TabsContent value="posts">{postsList}</TabsContent>
            <TabsContent value="network">{networkPanel}</TabsContent>
          </Tabs>
        </div>
      </div>

      <RightRail
        variant="profile"
        profileStats={{
          posts: userPosts.length,
          followers: followInfo.followerCount,
          topCategory: (() => {
            // Find most common rice_type from user's trading posts
            const tradingPosts = userPosts.filter((p) => p.rice_type);
            if (tradingPosts.length === 0) return undefined;
            const counts: Record<string, number> = {};
            for (const p of tradingPosts) {
              const key = p.rice_type!;
              counts[key] = (counts[key] || 0) + 1;
            }
            return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
          })(),
        }}
      />
    </div>
  );
}

export default function ProfilePage() {
  return <ProfileContent />;
}
