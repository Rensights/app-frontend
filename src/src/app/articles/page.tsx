"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LandingHeader from "@/components/landing/Header";
import LandingFooter from "@/components/landing/Footer";
import { apiClient } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import "./articles.css";

type ArticleCategory = {
  id: string;
  slug: string;
  label: string;
  color?: string;
};

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  publishedAt?: string;
  categories?: ArticleCategory[];
};

/** Used when a category has no colour set, so a tag chip never renders colourless. */
const DEFAULT_TAG_COLOR = "#B45309";

const ALL = "all";

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [activeCat, setActiveCat] = useState<string>(ALL);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Categories are secondary: if that call fails the page still lists every article,
        // just without filters.
        const [list, cats] = await Promise.all([
          apiClient.getArticles(),
          apiClient.getArticleCategories().catch(() => [] as ArticleCategory[]),
        ]);
        setArticles(list || []);
        setCategories(cats || []);
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

  // Deep link: /articles#market opens with that filter already applied.
  useEffect(() => {
    const fromHash = window.location.hash.replace("#", "");
    if (fromHash) {
      setActiveCat(fromHash);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 120);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!loading && (disabled || articles.length === 0)) {
      router.replace("/");
    }
  }, [loading, disabled, articles.length, router]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { [ALL]: articles.length };
    articles.forEach((article) => {
      (article.categories || []).forEach((category) => {
        result[category.slug] = (result[category.slug] || 0) + 1;
      });
    });
    return result;
  }, [articles]);

  const visible = useMemo(
    () =>
      activeCat === ALL
        ? articles
        : articles.filter((article) =>
            (article.categories || []).some((category) => category.slug === activeCat)
          ),
    [articles, activeCat]
  );

  const selectCategory = (slug: string) => {
    setActiveCat(slug);
    // Keeps the filter shareable without adding a history entry per click.
    const url = slug === ALL ? window.location.pathname : `#${slug}`;
    window.history.replaceState(null, "", url);
  };

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString("en-US") : "";

  if (!loading && (disabled || articles.length === 0)) {
    return null;
  }

  return (
    <div className="insights-page min-h-screen">
      <LandingHeader />

      <main>
        <div className="insights-wrap">
          <div className="insights-head">
            <h1>Insights</h1>
          </div>

          {loading ? (
            <div className="py-10">
              <LoadingSpinner message="Loading articles..." />
            </div>
          ) : (
            <>
              {categories.length > 0 && (
                <div className={`insights-filterbar ${stuck ? "stuck" : ""}`.trim()}>
                  <div className="insights-filter-row">
                    <button
                      type="button"
                      className="insights-pill"
                      aria-pressed={activeCat === ALL}
                      onClick={() => selectCategory(ALL)}
                    >
                      All<span className="count">{counts[ALL] || 0}</span>
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        className="insights-pill"
                        aria-pressed={activeCat === category.slug}
                        onClick={() => selectCategory(category.slug)}
                      >
                        {category.label}
                        <span className="count">{counts[category.slug] || 0}</span>
                      </button>
                    ))}
                  </div>

                  <p className="insights-result-line">
                    Showing {visible.length} of {articles.length} articles
                    {activeCat !== ALL && (
                      <>
                        {" · "}
                        <button type="button" onClick={() => selectCategory(ALL)}>
                          Clear filter
                        </button>
                      </>
                    )}
                  </p>
                </div>
              )}

              <div className="insights-grid">
                {visible.length === 0 ? (
                  <div className="insights-empty">No articles in this category yet.</div>
                ) : (
                  visible.map((article) => (
                    <Link
                      key={article.id}
                      href={`/articles/${article.slug}`}
                      className="insights-card"
                    >
                      <div className="insights-thumb">
                        {article.coverImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={apiClient.resolveApiUrl(article.coverImage)}
                            alt={article.title}
                          />
                        ) : (
                          <span className="insights-thumb-fallback">
                            <b>RE</b>insights
                          </span>
                        )}
                      </div>

                      <div className="insights-card-meta">
                        {(article.categories || []).map((category) => (
                          <span
                            key={category.id}
                            className="insights-tag"
                            style={
                              {
                                "--tag": category.color || DEFAULT_TAG_COLOR,
                              } as React.CSSProperties
                            }
                            role="button"
                            tabIndex={0}
                            // The tag sits inside the card link, so filtering has to stop the
                            // click from navigating to the article.
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              selectCategory(category.slug);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                event.stopPropagation();
                                selectCategory(category.slug);
                              }
                            }}
                          >
                            {category.label}
                          </span>
                        ))}
                        {article.publishedAt && (
                          <span className="insights-date">{formatDate(article.publishedAt)}</span>
                        )}
                      </div>

                      <h2>{article.title}</h2>
                      {article.excerpt && <p>{article.excerpt}</p>}
                      <span className="insights-more">Read more →</span>
                    </Link>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
