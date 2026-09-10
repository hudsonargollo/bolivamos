import type {
  AuthResponse,
  MobileGoogleLoginRequest,
  PasswordLoginRequest,
  AuthUser,
  UpdatePreferencesRequest,
  RegisterPushTokenRequest,
  TotalSavedResponse,
  BolipassCheckoutRequest,
  BolipassCheckoutResponse,
  EventDto,
  EventFilter,
  VoucherDto,
  LockedVoucherTeaser,
  RedeemVoucherRequest,
  RedeemVoucherResponse,
  ItineraryRequest,
  ItineraryResponse,
  ChatRequest,
  ChatResponse,
  HighlightResponse,
  ProductDto,
  CreateOrderRequest,
  CreateOrderResponse,
  AttendeeDto,
  SetAttendanceRequest,
  ConnectRequestDto,
  CreateConnectRequest,
  RespondConnectRequest,
  ConnectMessageDto,
  SendConnectMessageRequest,
  ReportUserRequest,
} from "@bolivibes/api-schema";

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
 * Typed fetch client for apps/mobile. Every request to the BoliVibes API
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

  login(body: PasswordLoginRequest) {
    return this.request<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(body) });
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

  getEvent(id: string) {
    return this.request<EventDto>(`/api/events/${id}`);
  }

  // --- subscriptions ---
  startBoliPassCheckout(body: BolipassCheckoutRequest) {
    return this.request<BolipassCheckoutResponse>("/api/subscriptions/bolipass/checkout", {
      method: "POST",
      body: JSON.stringify(body),
    });
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
    return this.request<ChatResponse>("/api/ai/chat", { method: "POST", body: JSON.stringify(body) });
  }

  getVenueHighlight(venueId: string) {
    return this.request<HighlightResponse>(`/api/ai/highlight?venueId=${venueId}`);
  }

  // --- marketplace ---
  listProducts() {
    return this.request<ProductDto[]>("/api/products");
  }

  getProduct(id: string) {
    return this.request<ProductDto>(`/api/products/${id}`);
  }

  createOrder(body: CreateOrderRequest) {
    return this.request<CreateOrderResponse>("/api/orders", { method: "POST", body: JSON.stringify(body) });
  }

  // --- VIP Connect & Dating ---
  setEventAttendance(eventId: string, body: SetAttendanceRequest) {
    return this.request<{ visible: boolean }>(`/api/events/${eventId}/attendance`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  getEventAttendees(eventId: string) {
    return this.request<AttendeeDto[]>(`/api/events/${eventId}/attendees`);
  }

  sendConnectRequest(body: CreateConnectRequest) {
    return this.request<ConnectRequestDto>("/api/connect/requests", { method: "POST", body: JSON.stringify(body) });
  }

  listConnectRequests() {
    return this.request<ConnectRequestDto[]>("/api/connect/requests");
  }

  respondConnectRequest(id: string, body: RespondConnectRequest) {
    return this.request<{ status: string }>(`/api/connect/requests/${id}/respond`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  getConnectMessages(requestId: string) {
    return this.request<ConnectMessageDto[]>(`/api/connect/${requestId}/messages`);
  }

  sendConnectMessage(requestId: string, body: SendConnectMessageRequest) {
    return this.request<ConnectMessageDto>(`/api/connect/${requestId}/messages`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  blockUser(userId: string) {
    return this.request<{ blocked: boolean }>(`/api/users/${userId}/block`, { method: "POST" });
  }

  reportUser(body: ReportUserRequest) {
    return this.request<{ ok: boolean }>("/api/reports", { method: "POST", body: JSON.stringify(body) });
  }
}
