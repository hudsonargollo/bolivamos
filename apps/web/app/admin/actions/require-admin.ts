import { getCurrentSessionRsc } from "@/lib/session-rsc";
import type { CurrentSession } from "@/lib/session";

/** Every admin Server Action calls this first — throws for anyone but an admin. */
export async function requireAdminAction(): Promise<CurrentSession> {
  const session = await getCurrentSessionRsc();
  if (!session || session.role !== "admin") {
    throw new Error("Forbidden: admin role required");
  }
  return session;
}

export function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function formOptionalString(formData: FormData, key: string): string | undefined {
  const value = formString(formData, key);
  return value.length ? value : undefined;
}

export function formOptionalNumber(formData: FormData, key: string): number | undefined {
  const value = formOptionalString(formData, key);
  if (value === undefined) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}
