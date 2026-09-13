const ZERNIO_API_BASE = "https://zernio.com/api/v1";

export const ZERNIO_PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "twitter", label: "X / Twitter" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "threads", label: "Threads" },
  { value: "pinterest", label: "Pinterest" },
  { value: "reddit", label: "Reddit" },
  { value: "bluesky", label: "Bluesky" },
  { value: "googlebusiness", label: "Google Business" },
  { value: "telegram", label: "Telegram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "discord", label: "Discord" },
  { value: "slack", label: "Slack" },
] as const;

export interface ZernioProfile {
  _id: string;
  name: string;
  isDefault?: boolean;
  color?: string;
  accountUsernames?: string[];
}

export interface ZernioAccount {
  _id: string;
  platform: string;
  username?: string;
  name?: string;
  displayName?: string;
  profileId?: string;
  profileName?: string;
  status?: string;
  health?: string;
}

export interface ZernioPostPlatform {
  platform?: string;
  accountId?: string;
  status?: string;
  platformPostUrl?: string;
  error?: string;
}

export interface ZernioPost {
  _id: string;
  content?: string;
  status?: string;
  scheduledFor?: string;
  createdAt?: string;
  updatedAt?: string;
  platforms?: ZernioPostPlatform[];
}

interface ZernioListResponse<T> {
  profiles?: T[];
  accounts?: T[];
  posts?: T[];
  data?: T[];
}

function zernioHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

function normalizeList<T>(body: ZernioListResponse<T> | T[], key: "profiles" | "accounts" | "posts"): T[] {
  if (Array.isArray(body)) return body;
  const keyed = body[key];
  if (Array.isArray(keyed)) return keyed;
  if (Array.isArray(body.data)) return body.data;
  return [];
}

async function zernioFetch<T>(apiKey: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${ZERNIO_API_BASE}${path}`, {
    ...init,
    headers: {
      ...zernioHeaders(apiKey),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Zernio request failed (${response.status}): ${detail || response.statusText}`);
  }

  return (await response.json()) as T;
}

export async function listZernioProfiles(apiKey: string): Promise<ZernioProfile[]> {
  const body = await zernioFetch<ZernioListResponse<ZernioProfile> | ZernioProfile[]>(apiKey, "/profiles");
  return normalizeList(body, "profiles");
}

export async function listZernioAccounts(apiKey: string): Promise<ZernioAccount[]> {
  const body = await zernioFetch<ZernioListResponse<ZernioAccount> | ZernioAccount[]>(apiKey, "/accounts");
  return normalizeList(body, "accounts");
}

export async function listZernioPosts(apiKey: string, limit = 10): Promise<ZernioPost[]> {
  const body = await zernioFetch<ZernioListResponse<ZernioPost> | ZernioPost[]>(apiKey, `/posts?limit=${limit}`);
  return normalizeList(body, "posts");
}

export async function getZernioConnectUrl(apiKey: string, platform: string, profileId: string, redirectUrl: string): Promise<string> {
  const query = new URLSearchParams({ profileId, redirect_url: redirectUrl });
  const body = await zernioFetch<{ authUrl?: string; url?: string }>(apiKey, `/connect/${encodeURIComponent(platform)}?${query.toString()}`);
  const authUrl = body.authUrl ?? body.url;
  if (!authUrl) throw new Error("Zernio did not return an authorization URL.");
  return authUrl;
}

export interface CreateZernioPostInput {
  content: string;
  platforms: Array<{ platform: string; accountId: string }>;
  scheduledFor?: string;
  timezone?: string;
  publishNow?: boolean;
  mediaItems?: Array<{ url: string }>;
}

export async function createZernioPost(apiKey: string, input: CreateZernioPostInput): Promise<ZernioPost> {
  return zernioFetch<ZernioPost>(apiKey, "/posts", {
    method: "POST",
    headers: { "x-request-id": crypto.randomUUID() },
    body: JSON.stringify(input),
  });
}
