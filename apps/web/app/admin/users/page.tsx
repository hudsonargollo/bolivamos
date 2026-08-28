import { createDb, users } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";
import { updateUserRole, setUserVip } from "../actions/users";

export default async function AdminUsersPage() {
  const { env } = cf();
  const db = createDb(env.DB);
  const rows = await db.select().from(users).orderBy(users.createdAt);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl uppercase">Users</h1>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-bg-off-white">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Name</th>
              <th className="p-3">Role</th>
              <th className="p-3">BoliPass VIP</th>
              <th className="p-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((user) => (
              <tr key={user.id} className="border-b last:border-0 align-top">
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.fullName ?? "—"}</td>
                <td className="p-3">
                  {user.role === "admin" ? (
                    <span className="rounded-pill bg-charcoal-dark px-3 py-1 text-xs text-white">admin</span>
                  ) : (
                    <form action={updateUserRole} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={user.id} />
                      <select
                        name="role"
                        defaultValue={user.role ?? "visitor"}
                        className="rounded-md border p-1"
                      >
                        <option value="visitor">visitor</option>
                        <option value="host">host</option>
                      </select>
                      <button type="submit" className="rounded-pill bg-boli-green px-3 py-1 text-xs text-white">
                        Save
                      </button>
                    </form>
                  )}
                </td>
                <td className="p-3">
                  <form action={setUserVip} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="userId" value={user.id} />
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        name="isBolipassActive"
                        defaultChecked={Boolean(user.isBolipassActive)}
                      />
                      Active
                    </label>
                    <input
                      type="date"
                      name="bolipassExpiresAt"
                      defaultValue={user.bolipassExpiresAt?.slice(0, 10) ?? ""}
                      className="rounded-md border p-1"
                    />
                    <button type="submit" className="rounded-pill bg-boli-orange px-3 py-1 text-xs text-white">
                      Save
                    </button>
                  </form>
                </td>
                <td className="p-3">{user.createdAt?.slice(0, 10) ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
