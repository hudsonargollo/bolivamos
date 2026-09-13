import { cf } from "@/lib/cloudflare";
import { uploadAdminAsset } from "../actions/assets";

const FOLDER_OPTIONS = [
  { value: "brand", label: "Brand" },
  { value: "events", label: "Events" },
  { value: "payment", label: "Payment" },
  { value: "documents", label: "Documents" },
  { value: "misc", label: "Misc" },
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function listRecentAssets() {
  const { env } = cf();
  const result = await env.EVENT_ASSETS.list({ limit: 40 });
  return result.objects.sort((a, b) => b.uploaded.getTime() - a.uploaded.getTime());
}

export default async function AdminAssetsPage({ searchParams }: { searchParams?: Promise<{ uploaded?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const uploaded = params.uploaded;
  const assets = await listRecentAssets();

  return (
    <div>
      <div className="a-actions-row">
        <div>
          <h1 className="a-h1" style={{ marginBottom: 6 }}>Assets</h1>
          <p className="a-muted" style={{ margin: 0 }}>
            Upload brand, event, payment, and document files to Cloudflare R2. Use the copied URL anywhere the app accepts an asset URL.
          </p>
        </div>
      </div>

      {uploaded && (
        <div className="a-card" style={{ marginBottom: 18, border: "1px solid rgba(122, 138, 94, 0.35)" }}>
          <p style={{ margin: "0 0 8px", fontWeight: 800 }}>Upload complete</p>
          <label className="a-field" style={{ gap: 6 }}>
            <span className="a-muted" style={{ fontSize: 12, fontWeight: 800 }}>Asset URL</span>
            <input className="a-input" readOnly value={uploaded} />
          </label>
        </div>
      )}

      <div className="a-card" style={{ marginBottom: 22 }}>
        <form action={uploadAdminAsset} className="a-form" style={{ maxWidth: 680 }}>
          <div className="a-fieldset" style={{ paddingTop: 0 }}>
            <h2 className="a-fieldset-title">Upload a file</h2>
            <p className="a-fieldset-hint">Allowed: WEBP, PNG, JPG, SVG, PDF. Max size: 10 MB.</p>

            <div className="a-field">
              <label htmlFor="asset">File</label>
              <input id="asset" name="asset" type="file" accept="image/webp,image/png,image/jpeg,image/svg+xml,application/pdf" className="a-input" required />
            </div>

            <div className="a-field">
              <label htmlFor="folder">Folder</label>
              <select id="folder" name="folder" className="a-select" defaultValue="brand">
                {FOLDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="a-field">
              <label htmlFor="filename">File name <span className="a-field-optional">optional</span></label>
              <input id="filename" name="filename" className="a-input" placeholder="bolivibes-logo.webp" />
              <p className="a-fieldset-hint">Leave blank to use the original file name. Turn on replace to keep a stable URL.</p>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800 }}>
              <input type="checkbox" name="replace" />
              Replace existing file at this exact folder/name
            </label>
          </div>

          <button className="clay-btn" type="submit" style={{ alignSelf: "flex-start" }}>Upload asset</button>
        </form>
      </div>

      <div className="a-actions-row">
        <h2 style={{ margin: 0 }}>Recent assets</h2>
        <span className="a-muted">{assets.length} shown</span>
      </div>

      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Preview</th>
              <th>Key</th>
              <th>URL</th>
              <th>Size</th>
              <th>Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {assets.length === 0 && (
              <tr><td colSpan={5} className="a-muted">No uploaded assets yet.</td></tr>
            )}
            {assets.map((asset) => {
              const url = `/api/assets/${asset.key}`;
              const isImage = /\.(webp|png|jpe?g|svg)$/i.test(asset.key);
              return (
                <tr key={asset.key}>
                  <td>
                    {isImage ? <img src={url} alt="" style={{ width: 74, height: 48, objectFit: "contain", background: "#fff", borderRadius: 10 }} /> : <span className="a-muted">File</span>}
                  </td>
                  <td style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }}>{asset.key}</td>
                  <td><input className="a-input" readOnly value={url} style={{ minWidth: 260 }} /></td>
                  <td>{formatBytes(asset.size)}</td>
                  <td>{asset.uploaded.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
