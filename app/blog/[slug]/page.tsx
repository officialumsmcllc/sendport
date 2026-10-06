import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BLOG_POSTS } from "@/lib/blog/posts";
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  Share2,
  CheckCircle2,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Building2,
} from "lucide-react";

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) {
    return {
      title: "Article Not Found | Sendport Blog",
    };
  }

  return {
    title: `${post.title} | Sendport Blog`,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author.name],
      url: `https://getsendport.com/blog/${post.slug}`,
      siteName: "Sendport",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  // JSON-LD Schema for Google Rich Article Cards
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      "@type": "Organization",
      name: "Sendport",
      url: "https://getsendport.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://getsendport.com/blog/${post.slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar dark={true} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full space-y-10">
        {/* Back Link */}
        <div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to all articles
          </Link>
        </div>

        {/* Article Header */}
        <header className="space-y-4 border-b border-slate-800/80 pb-8">
          <div className="flex items-center gap-2.5">
            <span className="rounded-lg bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/20">
              {post.category}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> {post.date}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" /> {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="text-base text-slate-300 leading-relaxed">{post.excerpt}</p>

          {/* Author Card */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-700 bg-slate-800">
                <img src={post.author.avatar} alt={post.author.name} className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{post.author.name}</p>
                <p className="text-xs text-slate-400">{post.author.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-bold uppercase">Sendport Deliverability Team</span>
            </div>
          </div>
        </header>

        {/* Article Body Content */}
        <article className="prose prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-headings:text-white prose-p:text-slate-300 prose-p:leading-relaxed prose-a:text-amber-400 prose-a:underline prose-code:text-amber-300 prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-slate-800 prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-table:border-collapse prose-th:border prose-th:border-slate-800 prose-th:bg-slate-900/80 prose-th:p-3 prose-td:border prose-td:border-slate-800/80 prose-td:p-3">
          <div
            dangerouslySetInnerHTML={{
              __html: post.content
                .replace(/\n## /g, '<h2 class="text-2xl font-bold text-white mt-8 mb-4">')
                .replace(/\n### /g, '<h3 class="text-lg font-bold text-amber-400 mt-6 mb-2">')
                .replace(/\n\n/g, "<p class='mb-4 text-slate-300 leading-relaxed'>")
                .replace(/```typescript/g, '<pre class="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs font-mono overflow-x-auto text-amber-300 my-4"><code>')
                .replace(/```tsx/g, '<pre class="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs font-mono overflow-x-auto text-blue-300 my-4"><code>')
                .replace(/```bash/g, '<pre class="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs font-mono overflow-x-auto text-emerald-300 my-4"><code>')
                .replace(/```env/g, '<pre class="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs font-mono overflow-x-auto text-purple-300 my-4"><code>')
                .replace(/```/g, "</code></pre>"),
            }}
          />
        </article>

        {/* Tags */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-400 border border-slate-800"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* In-Article Promotion CTA */}
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/5 p-8 sm:p-10 space-y-4 my-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Sparkles className="w-3.5 h-3.5" /> High-Throughput Dispatch Engine
              </div>
              <h3 className="text-xl font-black text-white">
                Start sending with 99.8% inbox placement today
              </h3>
              <p className="text-xs text-slate-300 max-w-md">
                500 free emails every single day. No credit card required. Instant RSA-2048 DKIM setup.
              </p>
            </div>
            <Link
              href="/signup"
              className="shrink-0 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-3 text-xs font-black text-slate-950 transition-colors shadow-lg shadow-amber-500/20"
            >
              Create Free Account &rarr;
            </Link>
          </div>
        </div>

        {/* Related Articles */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <h3 className="text-lg font-bold text-white">More from the Sendport Blog</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedPosts.map((rp) => (
              <Link
                key={rp.slug}
                href={`/blog/${rp.slug}`}
                className="group p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition-all space-y-2"
              >
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  {rp.category}
                </span>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                  {rp.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2">{rp.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
