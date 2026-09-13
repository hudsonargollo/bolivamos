import { cf } from "@/lib/cloudflare";
import { listZernioAccounts, listZernioPosts, listZernioProfiles, ZERNIO_PLATFORMS, type ZernioAccount, type ZernioPost } from "@/lib/zernio";
import { connectZernioAccount, publishZernioPost } from "../actions/social";

function accountLabel(account: ZernioAccount) {
  return account.displayName ?? account.name ?? account.username ?? account._id;
}

function platformLabel(platform: string | undefined) {
  return ZERNIO_PLATFORMS.find((item) => item.value === platform)?.label ?? platform ?? "Unknown";
}

function formatDateTime(value: string | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function postDestinationSummary(post: ZernioPost) {
  const platforms = post.platforms ?? [];
  if (platforms.length === 0) return "—";
  return platforms.map((item) => platformLabel(item.platform)).join(", ");
}

export default async function AdminSocialPage({ searchParams }: { searchParams?: Promise<{ posted?: string; connected?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const { env } = cf();
  const apiKey = env.ZERNIO_API_KEY;

  let profiles = [] as Awaited<ReturnType<typeof listZernioProfiles>>;
  let accounts = [] as Awaited<ReturnType<typeof listZernioAccounts>>;
  let posts = [] as Awaited<ReturnType<typeof listZernioPosts>>;
  let loadError: string | null = null;

  if (apiKey) {
    try {
      [profiles, accounts, posts] = await Promise.all([
        listZernioProfiles(apiKey),
        listZernioAccounts(apiKey),
        listZernioPosts(apiKey, 10),
      ]);
    } catch (error) {
      loadError = error instanceof Error ? error.message : "Could not load Zernio data.";
    }
  } else {
    loadError = "ZERNIO_API_KEY is not configured.";
  }

  const defaultProfileId = profiles.find((profile) => profile.isDefault)?._id ?? profiles[0]?._id ?? "";
  const connectedAccounts = accounts.filter((account) => account._id && account.platform);

  return (
    <div>
      <div className="a-actions-row">
        <div>
          <h1 className="a-h1" style={{ marginBottom: 6 }}>Social publishing</h1>
          <p className="a-muted" style={{ margin: 0 }}>
            Connect Zernio accounts, publish BoliVibes social posts now, or schedule them for Santa Cruz time.
          </p>
        </div>
      </div>

      {params.posted && (
        <div className="a-card" style={{ marginBottom: 18, border: "1px solid rgba(122, 138, 94, 0.35)" }}>
          <p style={{ margin: 0, fontWeight: 800 }}>Post sent to Zernio. Check the recent posts table for platform status.</p>
        </div>
      )}

      {loadError && (
        <div className="a-card" style={{ marginBottom: 18, border: "1px solid rgba(184, 73, 46, 0.28)" }}>
          <p style={{ margin: "0 0 6px", fontWeight: 800 }}>Zernio setup needs attention</p>
          <p className="a-muted" style={{ margin: 0 }}>{loadError}</p>
        </div>
      )}

      <div className="a-grid" style={{ marginBottom: 22 }}>
        <div className="a-card">
          <p className="a-stat-label">Profiles</p>
          <p className="a-stat-num">{profiles.length}</p>
        </div>
        <div className="a-card">
          <p className="a-stat-label">Connected accounts</p>
          <p className="a-stat-num">{connectedAccounts.length}</p>
        </div>
        <div className="a-card">
          <p className="a-stat-label">Recent posts</p>
          <p className="a-stat-num">{posts.length}</p>
        </div>
        <div className="a-card">
          <p className="a-stat-label">Default profile</p>
          <p style={{ margin: "8px 0 0", fontWeight: 800 }}>{profiles.find((profile) => profile._id === defaultProfileId)?.name ?? "—"}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 0.8fr)", gap: 22, alignItems: "start", marginBottom: 28 }}>
        <form action={publishZernioPost} className="a-card a-form" style={{ maxWidth: "none" }}>
          <div className="a-fieldset" style={{ paddingTop: 0 }}>
            <h2 className="a-fieldset-title">Create a post</h2>
            <p className="a-fieldset-hint">Use public HTTPS media URLs from Admin Assets if you want to attach images or videos.</p>

            <div className="a-field">
              <label htmlFor="content">Caption</label>
              <textarea
                id="content"
                name="content"
                className="a-textarea"
                rows={7}
                placeholder="Tonight in Santa Cruz: discover what’s happening with BoliVibes."
              />
            </div>

            <div className="a-field">
              <label>Accounts</label>
              <div style={{ display: "grid", gap: 8 }}>
                {connectedAccounts.map((account) => (
                  <label key={account._id} className="a-checkbox-row" style={{ alignItems: "flex-start" }}>
                    <input type="checkbox" name="account" value={`${account.platform}|${account._id}`} />
                    <span>
                      <strong>{platformLabel(account.platform)}</strong> — {accountLabel(account)}
                      {account.status && <span className="a-muted"> · {account.status}</span>}
                    </span>
                  </label>
                ))}
                {connectedAccounts.length === 0 && (
                  <p className="a-muted" style={{ margin: 0 }}>No Zernio accounts connected yet. Connect one first.</p>
                )}
              </div>
            </div>

            <div className="a-field">
              <label htmlFor="mediaUrls">Media URLs <span className="a-field-optional">optional, one per line</span></label>
              <textarea id="mediaUrls" name="mediaUrls" className="a-textarea" rows={3} placeholder="https://bolivibes.clubemkt.digital/api/assets/events/example.webp" />
            </div>
          </div>

          <div className="a-fieldset">
            <h2 className="a-fieldset-title">Timing</h2>
            <label className="a-checkbox-row">
              <input type="radio" name="mode" value="publishNow" defaultChecked />
              Publish now
            </label>
            <label className="a-checkbox-row">
              <input type="radio" name="mode" value="schedule" />
              Schedule for later
            </label>
            <div className="a-row-2">
              <div className="a-field">
                <label htmlFor="scheduledFor">Scheduled date/time</label>
                <input id="scheduledFor" name="scheduledFor" type="datetime-local" className="a-input" />
              </div>
              <div className="a-field">
                <label htmlFor="timezone">Timezone</label>
                <select id="timezone" name="timezone" className="a-select" defaultValue="America/La_Paz">
                  <option value="America/La_Paz">Santa Cruz / Bolivia</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" className="clay-btn" style={{ alignSelf: "flex-start" }} disabled={connectedAccounts.length === 0}>
            Send to Zernio
          </button>
        </form>

        <form action={connectZernioAccount} className="a-card a-form" style={{ maxWidth: "none" }}>
          <div className="a-fieldset" style={{ paddingTop: 0 }}>
            <h2 className="a-fieldset-title">Connect account</h2>
            <p className="a-fieldset-hint">Starts the Zernio OAuth flow for the selected social platform.</p>
            <div className="a-field">
              <label htmlFor="profileId">Profile</label>
              <select id="profileId" name="profileId" className="a-select" defaultValue={defaultProfileId}>
                {profiles.map((profile) => (
                  <option key={profile._id} value={profile._id}>{profile.name}{profile.isDefault ? " · default" : ""}</option>
                ))}
              </select>
            </div>
            <div className="a-field">
              <label htmlFor="platform">Platform</label>
              <select id="platform" name="platform" className="a-select" defaultValue="instagram">
                {ZERNIO_PLATFORMS.map((platform) => (
                  <option key={platform.value} value={platform.value}>{platform.label}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="a-logout-btn" disabled={profiles.length === 0}>Open Zernio connect</button>
        </form>
      </div>

      <div className="a-actions-row">
        <h2 style={{ margin: 0 }}>Connected accounts</h2>
        <span className="a-muted">{connectedAccounts.length} shown</span>
      </div>
      <div className="a-table-wrap" style={{ marginBottom: 28 }}>
        <table className="a-table">
          <thead>
            <tr>
              <th>Platform</th>
              <th>Account</th>
              <th>Profile</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {connectedAccounts.length === 0 && <tr><td colSpan={4} className="a-muted">No connected social accounts yet.</td></tr>}
            {connectedAccounts.map((account) => (
              <tr key={account._id}>
                <td>{platformLabel(account.platform)}</td>
                <td>{accountLabel(account)}</td>
                <td>{account.profileName ?? account.profileId ?? "—"}</td>
                <td>{account.health ?? account.status ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="a-actions-row">
        <h2 style={{ margin: 0 }}>Recent Zernio posts</h2>
        <span className="a-muted">Latest {posts.length}</span>
      </div>
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Destinations</th>
              <th>Content</th>
              <th>Scheduled</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && <tr><td colSpan={5} className="a-muted">No posts found.</td></tr>}
            {posts.map((post) => (
              <tr key={post._id}>
                <td>{post.status ?? "—"}</td>
                <td>{postDestinationSummary(post)}</td>
                <td style={{ maxWidth: 420 }}>{post.content ?? "—"}</td>
                <td>{formatDateTime(post.scheduledFor)}</td>
                <td>{formatDateTime(post.createdAt ?? post.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
