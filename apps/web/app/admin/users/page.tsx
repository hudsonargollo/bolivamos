import { createDb, users } from "@bolivibes/db";
import { cf } from "@/lib/cloudflare";
import { createAdminUser, updateUserRole, setUserVip } from "../actions/users";

export default async function AdminUsersPage() {
  const { env } = cf();
  const db = createDb(env.DB);
  const rows = await db.select().from(users).orderBy(users.createdAt);

  return (
    <div>
      <h1 className="a-h1">Users</h1>

      <form action={createAdminUser} className="a-form a-card" style={{ maxWidth: 760, marginBottom: 24 }}>
        <div className="a-fieldset">
          <h2 className="a-fieldset-title">Create user</h2>
          <p className="a-fieldset-hint">Creates a password login account. Admin role is intentionally not assignable here.</p>
          <div className="a-row-2">
            <div className="a-field">
              <label htmlFor="new-email">Email</label>
              <input id="new-email" name="email" type="email" required className="a-input" />
            </div>
            <div className="a-field">
              <label htmlFor="new-full-name">Full name <span className="a-field-optional">optional</span></label>
              <input id="new-full-name" name="fullName" className="a-input" />
            </div>
          </div>
          <div className="a-row-2">
            <div className="a-field">
              <label htmlFor="new-password">Password</label>
              <input id="new-password" name="password" type="password" minLength={8} required className="a-input" />
            </div>
            <div className="a-field">
              <label htmlFor="new-role">Role</label>
              <select id="new-role" name="role" defaultValue="visitor" className="a-select">
                <option value="visitor">visitor</option>
                <option value="host">host</option>
              </select>
            </div>
          </div>
          <div className="a-row-2">
            <label className="a-checkbox-row" style={{ alignSelf: "end", paddingBottom: 10 }}>
              <input type="checkbox" name="isBolipassActive" />
              BoliPass active
            </label>
            <div className="a-field">
              <label htmlFor="new-bolipass-expires">BoliPass expires <span className="a-field-optional">optional</span></label>
              <input id="new-bolipass-expires" type="date" name="bolipassExpiresAt" className="a-input" />
            </div>
          </div>
          <button type="submit" className="clay-btn" style={{ alignSelf: "flex-start" }}>
            Create user
          </button>
        </div>
      </form>

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
