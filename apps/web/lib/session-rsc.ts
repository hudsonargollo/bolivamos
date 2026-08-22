import { cookies } from "next/headers";
import { resolveSession, SESSION_COOKIE_NAME, type CurrentSession } from "./session";

/** Server Component / layout variant of getCurrentSession — reads the cookie jar instead of a Request. */
export async function getCurrentSessionRsc(): Promise<CurrentSession | null> {
  const jar = await cookies();
  return resolveSession(jar.get(SESSION_COOKIE_NAME)?.value ?? null);
}
