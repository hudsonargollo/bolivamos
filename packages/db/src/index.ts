export * from "./schema";
export * from "./client";

/**
 * Re-exports drizzle-orm's query builders (eq, and, sql, desc, …) so every
 * consumer of this package's table schemas gets its operators from the
 * exact same drizzle-orm module instance. pnpm resolves a separate
 * drizzle-orm instance per distinct react major present in the workspace
 * (drizzle-orm has an optional peer on react/@types/react for its unused
 * useLiveQuery hook) — importing "drizzle-orm" directly elsewhere in the
 * monorepo can silently land on a different instance than this package's,
 * and TypeScript then rejects e.g. eq(usersTable.id, x) as a structurally
 * incompatible type. Importing operators from here instead sidesteps that
 * entirely, since both the table and the operator are always this same
 * resolved module.
 */
export * from "drizzle-orm";
