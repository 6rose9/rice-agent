"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RightRail } from "@/components/layout/right-rail";
import { PostCard } from "@/components/feed/post-card";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { getPostsByAuthor } from "@/lib/posts/actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  marketStatusLabels,
  roleLabels,
  getLocationLabel,
} from "@/lib/mock-data";
import { MarketStatusSelector } from "@/components/profile/market-status-selector";
import type { Profile, Post } from "@/types";
import { MapPin, Calendar, Sprout, Users, Loader2, Camera } from "lucide-react";

function ProfileContent() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { isAuthenticated, user: currentUser, refreshProfile } = useAuth();

  const [displayProfile, setDisplayProfile] = useState<Profile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const isOwnProfile =
    isAuthenticated && currentUser?.profile.username === username;

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

      // Fetch posts by this author
      const posts = await getPostsByAuthor(profile.id);
      setUserPosts(posts);

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
              {roleLabels[displayProfile.role] || displayProfile.role}
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
                <Button
                  size="sm"
                  variant="default"
                >
                  Follow
                </Button>
              ) : (
                <Link
                  href={`/login?redirect=${encodeURIComponent(`/profile/${username}`)}`}
                >
                  <Button
                    size="sm"
                    variant="default"
                  >
                    Follow
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
