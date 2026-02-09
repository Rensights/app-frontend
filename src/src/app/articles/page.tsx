"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LandingHeader from "@/components/landing/Header";
import LandingFooter from "@/components/landing/Footer";
import { apiClient } from "@/lib/api";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  publishedAt?: string;
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await apiClient.getArticles();
        setArticles(list || []);
      } catch (err: any) {
        if (String(err?.message || "").includes("404")) {
          setDisabled(true);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (disabled) {
    return (
      <div className="min-h-screen bg-background">
        <LandingHeader />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
          <p className="mt-4 text-gray-600">Articles are currently unavailable.</p>
        </main>
        <LandingFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
        </div>
        {loading ? (
          <p className="mt-6 text-gray-600">Loading articles...</p>
        ) : articles.length === 0 ? (
          <p className="mt-6 text-gray-600">No articles yet.</p>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {article.coverImage && (
                  <div className="mb-4 overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "Draft"}
                </div>
                <h2 className="mt-2 text-lg font-semibold text-gray-900">{article.title}</h2>
                {article.excerpt && <p className="mt-2 text-sm text-gray-600">{article.excerpt}</p>}
                <div className="mt-4 text-sm font-medium text-primary">Read more →</div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <LandingFooter />
    </div>
  );
}
