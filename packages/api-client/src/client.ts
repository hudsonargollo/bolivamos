import type {
  AuthResponse,
  MobileGoogleLoginRequest,
  AuthUser,
  UpdatePreferencesRequest,
  RegisterPushTokenRequest,
  TotalSavedResponse,
  ActivateBoliPassResponse,
  EventDto,
  EventFilter,
  VoucherDto,
  LockedVoucherTeaser,
  RedeemVoucherRequest,
  RedeemVoucherResponse,
  ItineraryRequest,
  ItineraryResponse,
  ChatRequest,
  HighlightResponse,
} from "@bolivamos/api-schema";

export interface ApiClientOptions {
  baseUrl: string;
  getToken: () => Promise<string | null> | string | null;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Typed fetch client for apps/mobile. Every request to the BoliVamos API
 * should go through this — never call `fetch` directly against the API from
 * mobile screens, so the auth header and error shape stay consistent.
 */
export class ApiClient {
  constructor(private readonly opts: ApiClientOptions) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await this.opts.getToken();
    const headers = new Headers(init.headers);
    headers.set("content-type", "application/json");
    if (token) headers.set("authorization", `Bearer ${token}`);

    const res = await fetch(`${this.opts.baseUrl}${path}`, { ...init, headers });
    if (!res.ok) {
      throw new ApiError(res.status, await res.text());
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  // --- auth ---
  loginWithGoogle(body: MobileGoogleLoginRequest) {
    return this.request<AuthResponse>("/api/auth/mobile", { method: "POST", body: JSON.stringify(body) });
  }

  devLogin(email: string, role: "visitor" | "host" = "visitor") {
    return this.request<AuthResponse>("/api/auth/dev-login", {
      method: "POST",
      body: JSON.stringify({ email, role }),
    });
  }

  logout() {
    return this.request<void>("/api/auth/logout", { method: "POST" });
  }

  // --- users ---
  getMe() {
    return this.request<AuthUser>("/api/users/me");
  }

  updatePreferences(body: UpdatePreferencesRequest) {
    return this.request<void>("/api/users/preferences", { method: "PUT", body: JSON.stringify(body) });
  }

  registerPushToken(body: RegisterPushTokenRequest) {
    return this.request<void>("/api/users/me/push-token", { method: "POST", body: JSON.stringify(body) });
  }

  getTotalSaved() {
    return this.request<TotalSavedResponse>("/api/users/me/total-saved");
  }

  // --- events ---
  listEvents(filter?: EventFilter) {
    const qs = filter ? `?filter=${filter}` : "";
    return this.request<EventDto[]>(`/api/events${qs}`);
  }

  // --- subscriptions ---
  activateBoliPass() {
    return this.request<ActivateBoliPassResponse>("/api/subscriptions/bolipass", { method: "POST" });
  }

  // --- vouchers ---
  listVouchers() {
    return this.request<(VoucherDto | LockedVoucherTeaser)[]>("/api/vouchers");
  }

  redeemVoucher(body: RedeemVoucherRequest) {
    return this.request<RedeemVoucherResponse>("/api/redemptions", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  // --- ai ---
  buildItinerary(body: ItineraryRequest) {
    return this.request<ItineraryResponse>("/api/ai/itinerary", { method: "POST", body: JSON.stringify(body) });
  }

  chat(body: ChatRequest) {
    return this.request<{ reply: string }>("/api/ai/chat", { method: "POST", body: JSON.stringify(body) });
  }

  getVenueHighlight(venueId: string) {
    return this.request<HighlightResponse>(`/api/ai/highlight?venueId=${venueId}`);
  }
}
