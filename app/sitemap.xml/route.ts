import { NextResponse } from "next/server";
import { BLOG_POSTS } from "@/lib/blog/posts";

export const dynamic = "force-dynamic";

export function GET() {
  const currentDate = new Date().toISOString().split("T")[0];

  const staticUrls = [
    { loc: "https://getsendport.com", priority: "1.0", changefreq: "daily" },
    { loc: "https://getsendport.com/vs/resend-alternative", priority: "0.95", changefreq: "weekly" },
    { loc: "https://getsendport.com/vs/sendgrid-alternative", priority: "0.95", changefreq: "weekly" },
    { loc: "https://getsendport.com/vs/postmark-alternative", priority: "0.95", changefreq: "weekly" },
    { loc: "https://getsendport.com/vs/mailgun-alternative", priority: "0.95", changefreq: "weekly" },
    { loc: "https://getsendport.com/vs/aws-ses-alternative", priority: "0.95", changefreq: "weekly" },
    { loc: "https://getsendport.com/vs/brevo-alternative", priority: "0.95", changefreq: "weekly" },
    { loc: "https://getsendport.com/features", priority: "0.9", changefreq: "weekly" },
    { loc: "https://getsendport.com/blog", priority: "0.9", changefreq: "daily" },
    { loc: "https://getsendport.com/docs", priority: "0.85", changefreq: "weekly" },
    { loc: "https://getsendport.com/startups", priority: "0.85", changefreq: "monthly" },
    { loc: "https://getsendport.com/security", priority: "0.8", changefreq: "monthly" },
    { loc: "https://getsendport.com/about", priority: "0.7", changefreq: "monthly" },
    { loc: "https://getsendport.com/contact", priority: "0.7", changefreq: "monthly" },
    { loc: "https://getsendport.com/status", priority: "0.7", changefreq: "always" },
    { loc: "https://getsendport.com/privacy", priority: "0.5", changefreq: "monthly" },
    { loc: "https://getsendport.com/terms", priority: "0.5", changefreq: "monthly" },
  ];

  const blogUrls = BLOG_POSTS.map((post) => ({
    loc: `https://getsendport.com/blog/${post.slug}`,
    priority: "0.85",
    changefreq: "weekly",
  }));

  const allUrls = [...staticUrls, ...blogUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
