import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /concierge and /connect redirect unauthenticated/non-VIP visitors
      // with no public content; /marketplace has no auth gate and stays
      // crawlable.
      disallow: ["/admin", "/api", "/host", "/concierge", "/connect"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
