import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/site-url";

const TITLE = "BoliVibes";
const DESCRIPTION = "What to do in Santa Cruz de la Sierra — plus BoliPass 2-for-1 deals.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: TITLE,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// Pinned for the homepage's 3D scene (apps/web/app/home-scene.tsx), which
// loads three.js via bare specifiers from a classic <script src> file that
// webpack never sees, so it needs a real browser import map rather than an
// npm-bundled import.
//
// Self-hosted (apps/web/public/vendor/three/0.184.0/, copied verbatim from
// the pinned three@0.184.0 npm package already in node_modules — same
// version, same files) instead of fetched from unpkg at runtime. A
// Lighthouse audit found unpkg's three.module.js alone accounting for
// 2.5-6s of main-thread script time, a meaningful chunk of which was the
// extra third-party DNS/TLS handshake and lack of edge-cache locality with
// the rest of the page's assets — both gone once served same-origin from
// Cloudflare's own edge. No integrity map needed for a same-origin,
// version-pinned file (that guarded against unpkg CDN tampering).
const THREE_IMPORTMAP = {
  imports: {
    three: "/vendor/three/0.184.0/build/three.module.js",
    "three/addons/controls/OrbitControls.js":
      "/vendor/three/0.184.0/examples/jsm/controls/OrbitControls.js",
    "three/addons/exporters/OBJExporter.js":
      "/vendor/three/0.184.0/examples/jsm/exporters/OBJExporter.js",
    "three/addons/exporters/GLTFExporter.js":
      "/vendor/three/0.184.0/examples/jsm/exporters/GLTFExporter.js",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <script type="importmap" dangerouslySetInnerHTML={{ __html: JSON.stringify(THREE_IMPORTMAP) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
