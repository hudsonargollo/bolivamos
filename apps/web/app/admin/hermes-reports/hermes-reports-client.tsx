"use client";

import { useState } from "react";

interface ReportItem {
  title: string;
  filename: string;
  relativePath: string;
  content: string;
  sizeBytes: number;
}

export default function HermesReportsClient({
  reports,
  isHudson,
  email,
}: {
  reports: ReportItem[];
  isHudson: boolean;
  email: string;
}) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  async function handleCopy(key: string, content: string) {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      alert("Failed to copy to clipboard");
    }
  }

  return (
    <div className="space-y-6">
      <div className="a-actions-row">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="a-h1" style={{ margin: 0 }}>Hermes Reports &amp; Specs</h1>
            {isHudson ? (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-extrabold uppercase tracking-wider">
                👑 Superadmin · Hudson Argollo
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-stone-800 text-stone-300 text-xs font-semibold">
                Admin · {email}
              </span>
            )}
          </div>
          <p className="a-muted" style={{ margin: 0 }}>
            Central repository of all markdown reports, PRDs, specs, and agent briefings built for BoliVibes. Click to copy instantly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {reports.map((rep) => {
          const isCopied = copiedKey === rep.relativePath;
          const isExpanded = expandedKey === rep.relativePath;

          return (
            <div key={rep.relativePath} className="a-card space-y-4" style={{ padding: 24 }}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    {rep.relativePath}
                  </span>
                  <h2 className="text-xl font-bold text-stone-100 mt-0.5">{rep.title}</h2>
                  <p className="text-xs text-stone-400 mt-1">
                    Size: {(rep.sizeBytes / 1024).toFixed(1)} KB · {rep.content.split("\n").length} lines
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedKey(isExpanded ? null : rep.relativePath)}
                    className="clay-btn clay-charcoal"
                    style={{ fontSize: 13, padding: "8px 16px" }}
                  >
                    {isExpanded ? "Hide Preview" : "Preview Markdown"}
                  </button>

                  <button
                    onClick={() => handleCopy(rep.relativePath, rep.content)}
                    className="clay-btn"
                    style={{ fontSize: 13, padding: "8px 16px", background: isCopied ? "#1e9e45" : undefined }}
                  >
                    {isCopied ? "✓ Copied to Clipboard!" : "Copy Report Markdown"}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-stone-800 animate-fadeIn">
                  <pre
                    style={{
                      background: "#0d0a08",
                      color: "#f4eee2",
                      padding: 16,
                      borderRadius: 12,
                      fontSize: 12,
                      lineHeight: 1.5,
                      maxHeight: 480,
                      overflowY: "auto",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {rep.content}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
