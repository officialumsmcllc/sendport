"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BLOG_POSTS, BlogPost } from "@/lib/blog/posts";
import {
  BookOpen,
  Search,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Tag,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function BlogIndexPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const categories = ["ALL", "Comparisons", "Deliverability", "Next.js & Frameworks", "Engineering"];

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === "ALL" || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = BLOG_POSTS.find((p) => p.featured) || BLOG_POSTS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      <Navbar dark={true} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-400">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sendport Engineering & Deliverability Blog</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Developer Guides, Benchmarks & Deliverability Blueprints
          </h1>
          <p className="text-base text-slate-400">
            Deep technical insights on email infrastructure, DMARC compliance, Next.js email architectures, and competitor benchmarks.
          </p>
        </div>

        {/* Featured Article Banner */}
        {featuredPost && activeCategory === "ALL" && !searchTerm && (
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="block group relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 p-6 sm:p-10 shadow-2xl transition-all hover:border-amber-500/50 hover:shadow-amber-500/10"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-full bg-amber-500 px-3 py-1 text-[11px] font-black uppercase text-slate-950">
                    Featured Benchmark
                  </span>
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {featuredPost.date}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {featuredPost.readTime}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-amber-400 transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">{featuredPost.excerpt}</p>

                <div className="flex items-center gap-3 pt-2">
                  <div className="h-8 w-8 rounded-full overflow-hidden border border-amber-500/40">
                    <img src={featuredPost.author.avatar} alt={featuredPost.author.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{featuredPost.author.name}</p>
                    <p className="text-[10px] text-slate-400">{featuredPost.author.role}</p>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 font-bold text-sm text-amber-400 group-hover:translate-x-1.5 transition-transform">
                Read Full Article <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        )}

        {/* Search & Categories */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-y border-slate-800/80 py-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeCategory === cat
                    ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search articles & guides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl transition-all hover:border-slate-700 hover:bg-slate-900 hover:-translate-y-1 shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-amber-400 border border-slate-700">
                    {post.category}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" /> {post.readTime}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{post.excerpt}</p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full overflow-hidden bg-slate-800">
                    <img src={post.author.avatar} alt={post.author.name} className="h-full w-full object-cover" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-300">{post.author.name}</span>
                </div>

                <span className="text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Read &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/5 p-8 sm:p-12 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Ready to upgrade your email infrastructure?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Get 100 emails/day completely free. Set up a custom domain with automated RSA-2048 DKIM in under 3 minutes.
          </p>
          <div className="pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-6 py-3 text-xs font-black text-slate-950 transition-all shadow-xl shadow-amber-500/20"
            >
              Start Sending Free with Sendport <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
