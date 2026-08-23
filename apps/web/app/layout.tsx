import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BoliVamos",
  description: "What to do in Santa Cruz de la Sierra — plus BoliPass 2-for-1 deals.",
};

// Pinned for the homepage's 3D scene (apps/web/app/home-scene.tsx), which
// loads three.js via bare specifiers from a classic <script src> file that
// webpack never sees, so it needs a real browser import map rather than an
// npm-bundled import.
const THREE_IMPORTMAP = {
  imports: {
    three: "https://unpkg.com/three@0.184.0/build/three.module.js",
    "three/addons/controls/OrbitControls.js":
      "https://unpkg.com/three@0.184.0/examples/jsm/controls/OrbitControls.js",
    "three/addons/exporters/OBJExporter.js":
      "https://unpkg.com/three@0.184.0/examples/jsm/exporters/OBJExporter.js",
    "three/addons/exporters/GLTFExporter.js":
      "https://unpkg.com/three@0.184.0/examples/jsm/exporters/GLTFExporter.js",
  },
  integrity: {
    "https://unpkg.com/three@0.184.0/build/three.module.js":
      "sha384-8FCZ1eVO6it4+pbec2aDtnTrwjWXZLJRC+MAGCIPDgsYnUrl/E0A2YlF8ioMKI/J",
    "https://unpkg.com/three@0.184.0/build/three.core.js":
      "sha384-dw2ooPewaEIrAgl6oFDBmmBWCE9oW9LxRGcfwZ0hLvEprzo202wXl7vCYHRlSnOT",
    "https://unpkg.com/three@0.184.0/examples/jsm/controls/OrbitControls.js":
      "sha384-4rziNxOBZKQ69i+w+f89KJ55TCYquwchVbByQwmaOeIOXdOU2PLDn3kOfXHwIJC9",
    "https://unpkg.com/three@0.184.0/examples/jsm/exporters/OBJExporter.js":
      "sha384-nbwtoZENJD3Vq+ACK0CuGQdPMuDWHkamC2KJD70EV5nfg6jQjfppKOea07YJN+N3",
    "https://unpkg.com/three@0.184.0/examples/jsm/exporters/GLTFExporter.js":
      "sha384-VofkvpG6HERhFCYbsUOHeNXBCqID2nfqkQqnVzE1jc/oPcz+qJ13ADdXH08hE+cQ",
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
