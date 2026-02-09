"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import LandingHeader from "@/components/landing/Header";
import LandingFooter from "@/components/landing/Footer";
import { apiClient } from "@/lib/api";

type Article = {
  title: string;
  content?: string;
  coverImage?: string;
  publishedAt?: string;
};

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiClient.getArticleBySlug(slug);
        setArticle(data);
      } catch (err: any) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      load();
    }
  }, [slug]);

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {loading ? (
          <p className="text-gray-600">Loading article...</p>
        ) : notFound || !article ? (
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Article not found</h1>
            <p className="mt-4 text-gray-600">This article is unavailable.</p>
          </div>
        ) : (
          <article className="prose max-w-none">
            <div className="text-sm uppercase tracking-wide text-gray-500">
              {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "Draft"}
            </div>
            <h1 className="mt-2 text-4xl font-bold text-gray-900">{article.title}</h1>
            {article.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.coverImage}
                alt={article.title}
                className="mt-6 h-72 w-full rounded-2xl object-cover"
              />
            )}
            {article.content ? (
              <div className="mt-6 whitespace-pre-line text-gray-700">{article.content}</div>
            ) : (
              <p className="mt-6 text-gray-600">Content coming soon.</p>
            )}
          </article>
        )}
      </main>
      <LandingFooter />
    </div>
  );
}
