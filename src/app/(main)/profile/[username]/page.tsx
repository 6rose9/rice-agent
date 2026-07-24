"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RightRail } from "@/components/layout/right-rail";
import { PostCard } from "@/components/feed/post-card";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { getPostsByAuthor } from "@/lib/posts/actions";
import {
  getFollowInfo,
  getConnectionStatus,
  getConnectionCount,
} from "@/lib/network/actions";
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
import {
  MapPin,
  Calendar,
  Sprout,
  Users,
  Loader2,
  Camera,
  Phone,
  Mail,
  Lock,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

  /** Check if the current viewer can see the connection list */
  function canSeeConnections(): boolean {
    if (isOwnProfile) return true;
    const vis = (displayProfile as Record<string, unknown>)
      ?.connections_visibility as string | undefined;
    // If column doesn't exist yet (migration not applied), default to public
    if (vis === undefined || vis === null) return true;
    if (vis === "public") return true;
    if (vis === "connections" && connectionInfo.status === "connected")
      return true;
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

  // Loading state — skeleton layout matching the page structure
  if (isLoading) {
    return (
      <div className="flex">
        <div className="flex-1 min-w-0">
          {/* Cover image skeleton */}
          <Skeleton className="h-24 sm:h-32 rounded-none" />

          {/* Avatar skeleton — overlaps cover */}
          <div className="flex justify-center -mt-10 sm:-mt-12 mb-2">
            <Skeleton className="h-20 w-20 sm:h-28 sm:w-28 rounded-full ring-4 ring-background" />
          </div>

          {/* Profile info skeletons */}
          <div className="text-center px-4 space-y-2 mb-6">
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-4 w-36 mx-auto" />
            <Skeleton className="h-5 w-24 mx-auto mt-2" />

            {/* Action button skeleton */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <Skeleton className="h-9 w-28 rounded-md" />
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
          </div>

          {/* Tabs skeleton */}
          <div className="w-full">
            <div className="grid grid-cols-3 border-b">
              {["About", "Posts", "Network"].map((tab) => (
                <div
                  key={tab}
                  className="py-3 px-4"
                >
                  <Skeleton className="h-4 w-14 mx-auto" />
                </div>
              ))}
            </div>

            {/* Post content skeletons */}
            <div className="divide-y">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  {i === 0 && <Skeleton className="h-48 w-full rounded-lg" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right rail skeleton */}
        <aside className="hidden lg:flex flex-col w-[260px] xl:w-[300px] shrink-0 border-l">
          <div className="p-4 space-y-4">
            <Skeleton className="h-5 w-28" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3"
              >
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </aside>
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
    <div className="p-4 space-y-5">
      {/* Bio section */}
      {displayProfile.bio && (
        <div className="bg-muted/30 rounded-xl p-4 border border-muted/50">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="inline-block w-1 h-3.5 rounded-full bg-emerald-500" />
            Bio
          </h3>
          <p className="text-sm leading-relaxed text-foreground/90">
            {displayProfile.bio}
          </p>
        </div>
      )}

      {/* Contact & Info section */}
      <div className="bg-muted/30 rounded-xl p-4 border border-muted/50">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span className="inline-block w-1 h-3.5 rounded-full bg-emerald-500" />
          Contact &amp; Info
        </h3>
        <div className="space-y-2.5 text-sm">
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
            const location = getLocationLabel(displayProfile);

            return (
              <>
                {phoneDisplay.show && (
                  <div className="flex items-center gap-3 px-1">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Phone className="h-3.5 w-3.5" />
                    </span>
                    {phoneDisplay.locked ? (
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Lock className="h-3 w-3" />
                        {phoneDisplay.text}
                      </span>
                    ) : (
                      <span className="text-foreground/90">
                        {phoneDisplay.text}
                      </span>
                    )}
                  </div>
                )}
                {emailDisplay.show && (
                  <div className="flex items-center gap-3 px-1">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Mail className="h-3.5 w-3.5" />
                    </span>
                    {emailDisplay.locked ? (
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Lock className="h-3 w-3" />
                        {emailDisplay.text}
                      </span>
                    ) : (
                      <span className="text-foreground/90">
                        {emailDisplay.text}
                      </span>
                    )}
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-3 px-1">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shrink-0">
                      <MapPin className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-foreground/90">{location}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 px-1">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 shrink-0">
                    <Calendar className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-foreground/90">
                    Joined{" "}
                    {new Date(displayProfile.created_at).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </span>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Role badge section */}
      <div className="bg-muted/30 rounded-xl p-4 border border-muted/50">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span className="inline-block w-1 h-3.5 rounded-full bg-emerald-500" />
          Role
        </h3>
        <div className="flex items-center gap-3 px-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            <Sprout className="h-3 w-3" />
            {ROLE_LABELS[displayProfile.role as keyof typeof ROLE_LABELS] ||
              displayProfile.role}
          </span>
        </div>
      </div>
    </div>
  );

  const networkPanel = (
    <div className="p-4 space-y-4">
      {canSeeConnections() ? (
        <>
          {/* Connections stats card */}
          <div className="bg-muted/30 rounded-xl p-4 border border-muted/50">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="inline-block w-1 h-3.5 rounded-full bg-emerald-500" />
              Network Overview
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 text-center py-2 rounded-lg bg-background/60">
                <p className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {connectionInfo.connectionCount}
                </p>
                <p className="text-[11px] text-muted-foreground">Connections</p>
              </div>
              <div className="flex-1 text-center py-2 rounded-lg bg-background/60">
                <p className="text-lg font-bold tabular-nums text-blue-600 dark:text-blue-400">
                  {followInfo.followerCount}
                </p>
                <p className="text-[11px] text-muted-foreground">Followers</p>
              </div>
              <div className="flex-1 text-center py-2 rounded-lg bg-background/60">
                <p className="text-lg font-bold tabular-nums text-amber-600 dark:text-amber-400">
                  {followInfo.followingCount}
                </p>
                <p className="text-[11px] text-muted-foreground">Following</p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-2">
            <Link
              href={
                isOwnProfile
                  ? "/mynetwork/connections"
                  : `/profile/${username}/connections`
              }
              className="group flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-muted/50 hover:bg-accent/60 hover:border-accent transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Users className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">View All Connections</p>
                  <p className="text-xs text-muted-foreground">
                    {connectionInfo.connectionCount}{" "}
                    {connectionInfo.connectionCount === 1 ? "person" : "people"}{" "}
                    in your network
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </Link>
            {isOwnProfile && (
              <Link
                href="/mynetwork/invitations"
                className="group flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-muted/50 hover:bg-accent/60 hover:border-accent transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shrink-0">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">Pending Invitations</p>
                    <p className="text-xs text-muted-foreground">
                      Review connection requests
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20 rounded-xl border border-dashed border-muted/50">
          <div className="rounded-full bg-accent p-4 mb-4">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Connections Private</p>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-[220px]">
            {displayProfile.full_name.split(" ")[0]} has set their connection
            list to private.
          </p>
        </div>
      )}
    </div>
  );

  const postsList = (
    <div>
      {userPosts.length > 0 ? (
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
        <div className="flex flex-col items-center justify-center border-t py-16 px-4">
          <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4 mb-4">
            <Sprout className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-foreground/80">No posts yet</p>
          <p className="text-xs text-muted-foreground mt-1.5 text-center max-w-[240px]">
            {isOwnProfile
              ? "Share your first post to start engaging with the rice trading community."
              : "This user hasn't posted anything yet."}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex">
      <div className="flex-1 min-w-0">
        {/* Profile header */}
        <div className="relative mb-6">
          <div
            className={`h-24 sm:h-32 bg-gradient-to-b from-emerald-300/70 via-green-200/40 to-green-100/20 dark:from-emerald-800/80 dark:via-green-900/40 dark:to-green-950/20 ${isOwnProfile ? "cursor-pointer group relative" : ""}`}
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
              <Avatar className="h-20 w-20 sm:h-28 sm:w-28 ring-3 ring-background">
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
              {ROLE_LABELS[displayProfile.role as keyof typeof ROLE_LABELS] ||
                displayProfile.role}
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
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="posts"
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 h-12 rounded-none bg-transparent">
            <TabsTrigger
              value="about"
              className="
                      h-full rounded-none border-b-2 border-transparent
                      text-muted-foreground font-medium
                      transition-colors
                      hover:bg-transparent hover:text-foreground
                      data-[state=active]:border-emerald-600
                      data-[state=active]:text-foreground
                      data-[state=active]:font-semibold
                      data-[state=active]:shadow-none
                      "
            >
              About
            </TabsTrigger>

            <TabsTrigger
              value="posts"
              className="
                      h-full rounded-none border-b-2 border-transparent
                      text-muted-foreground font-medium
                      transition-colors
                      hover:bg-transparent hover:text-foreground
                      data-[state=active]:border-emerald-600
                      data-[state=active]:text-foreground
                      data-[state=active]:font-semibold
                      data-[state=active]:shadow-none
                    "
            >
              <span>Posts</span>

              {userPosts.length > 0 && (
                <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground">
                  {userPosts.length}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="network"
              className="
                      h-full rounded-none border-b-2 border-transparent
                      text-muted-foreground font-medium
                      transition-colors
                      hover:bg-transparent hover:text-foreground
                      data-[state=active]:border-emerald-600
                      data-[state=active]:text-foreground
                      data-[state=active]:font-semibold
                      data-[state=active]:shadow-none
                    "
            >
              <span>Network</span>

              {connectionInfo.connectionCount > 0 && (
                <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground">
                  {connectionInfo.connectionCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="about"
            className="border-t pt-6"
          >
            {aboutPanel}
          </TabsContent>

          <TabsContent
            value="posts"
            className="pt-0"
          >
            {postsList}
          </TabsContent>

          <TabsContent
            value="network"
            className="border-t pt-6"
          >
            {networkPanel}
          </TabsContent>
        </Tabs>
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
