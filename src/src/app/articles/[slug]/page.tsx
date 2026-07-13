"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DOMPurify from "dompurify";
import LandingHeader from "@/components/landing/Header";
import LandingFooter from "@/components/landing/Footer";
import { apiClient } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import "./article-content.css";

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
          <LoadingSpinner message="Loading article..." />
        ) : notFound || !article ? (
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Article not found</h1>
            <p className="mt-4 text-gray-600">This article is unavailable.</p>
          </div>
        ) : (
          <article className="max-w-none">
            <div className="text-sm uppercase tracking-wide text-gray-500">
              {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "Draft"}
            </div>
            <h1 className="mt-2 text-4xl font-bold text-gray-900">{article.title}</h1>
            {article.coverImage && (
              <div className="mt-4 overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={apiClient.resolveApiUrl(article.coverImage)}
                  alt={article.title}
                  className="block w-full h-auto"
                />
              </div>
            )}
            {article.content ? (
              <div
                className="mt-6 article-content"
                dangerouslySetInnerHTML={{
                  // Pasted rich text often uses non-breaking spaces between every
                  // word, which stops the browser wrapping the line and overflows
                  // the mobile viewport. Normalise them to regular spaces so the
                  // text wraps at word boundaries (CSS break-word is the fallback).
                  __html: DOMPurify.sanitize(article.content).replace(
                    /\u00A0|&nbsp;/g,
                    " "
                  ),
                }}
              />
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
