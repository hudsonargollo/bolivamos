import { createDb, users } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";
import { updateUserRole, setUserVip } from "../actions/users";

export default async function AdminUsersPage() {
  const { env } = cf();
  const db = createDb(env.DB);
  const rows = await db.select().from(users).orderBy(users.createdAt);

  return (
    <div>
      <h1 className="a-h1">Users</h1>

      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>BoliPass VIP</th>
              <th>NIT</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.fullName ?? "—"}</td>
                <td>
                  {user.role === "admin" ? (
                    <span className="a-badge a-badge-charcoal" style={{ marginLeft: 0 }}>
                      admin
                    </span>
                  ) : (
                    <form action={updateUserRole} className="a-checkbox-row">
                      <input type="hidden" name="userId" value={user.id} />
                      <select name="role" defaultValue={user.role ?? "visitor"} className="a-select" style={{ width: "auto" }}>
                        <option value="visitor">visitor</option>
                        <option value="host">host</option>
                      </select>
                      <button type="submit" className="clay-btn clay-btn-sm">
                        Save
                      </button>
                    </form>
                  )}
                </td>
                <td>
                  <form action={setUserVip} className="a-checkbox-row" style={{ flexWrap: "wrap" }}>
                    <input type="hidden" name="userId" value={user.id} />
                    <label className="a-checkbox-row">
                      <input type="checkbox" name="isBolipassActive" defaultChecked={Boolean(user.isBolipassActive)} />
                      Active
                    </label>
                    <input
                      type="date"
                      name="bolipassExpiresAt"
                      defaultValue={user.bolipassExpiresAt?.slice(0, 10) ?? ""}
                      className="a-input"
                      style={{ width: "auto" }}
                    />
                    <button type="submit" className="clay-btn clay-sage clay-btn-sm">
                      Save
                    </button>
                  </form>
                </td>
                {/* Self-attested at BoliPass checkout, format-checked only —
                    not verified identity. View-only here for admin audit. */}
                <td>{user.nit ?? "—"}</td>
                <td>{user.createdAt?.slice(0, 10) ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
