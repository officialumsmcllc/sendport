import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/dashboard/"],
      },
      {
        userAgent: [
          "Googlebot",
          "Bingbot",
          "Applebot",
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "PerplexityBot",
          "CCBot",
        ],
        allow: ["/", "/features", "/docs", "/pricing", "/status", "/about", "/security", "/privacy", "/terms", "/llms.txt", "/llms-full.txt"],
        disallow: ["/api/", "/admin/", "/dashboard/"],
      },
    ],
    sitemap: [
      `${siteConfig.url}/sitemap.xml`,
    ],
    host: siteConfig.url,
  };
}
