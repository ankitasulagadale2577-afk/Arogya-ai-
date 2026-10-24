// ==============================================================================
// ArogyaMitra AI — Searchable Health Education Library
// Database-backed Articles + Bookmarks (Supabase) + Multilingual Support
// ==============================================================================

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BookOpen,
  Search,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  ShieldCheck,
  Globe,
  Calendar,
  ExternalLink,
  LoaderCircle,
} from "lucide-react";
import { articleService } from "../services/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

const CATEGORIES = [
  "All",
  "Conditions",
  "Wellness",
  "Nutrition",
  "Prevention",
  "Mental Wellness",
  "Saved Only",
];

export default function LibraryPage() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [searchParams] = useSearchParams();

  const [articles, setArticles] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load articles and user bookmarks
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      const { data: arts } = await articleService.getArticles();
      if (mounted && arts) {
        setArticles(arts);
      }

      if (user) {
        const { data: saved } = await articleService.getSavedArticleIds(user.id);
        if (mounted && saved) {
          setSavedIds(saved);
        }
      }
      if (mounted) setLoading(false);
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [user]);

  const toggleBookmark = async (articleId, e) => {
    if (e) e.stopPropagation();
    if (!user) {
      alert("Please sign in to save articles to your profile.");
      return;
    }

    const isCurrentlySaved = savedIds.includes(articleId);
    const updated = isCurrentlySaved
      ? savedIds.filter((id) => id !== articleId)
      : [...savedIds, articleId];

    setSavedIds(updated);
    await articleService.toggleSaveArticle(user.id, articleId, !isCurrentlySaved);
  };

  const filteredArticles = articles.filter((art) => {
    const isSaved = savedIds.includes(art.id);
    const matchCategory =
      selectedCategory === "All" ||
      (selectedCategory === "Saved Only" ? isSaved : art.category === selectedCategory);

    const q = searchQuery.toLowerCase();
    const matchQuery =
      !q ||
      art.title.toLowerCase().includes(q) ||
      art.summary?.toLowerCase().includes(q) ||
      art.content?.toLowerCase().includes(q) ||
      art.category.toLowerCase().includes(q);

    return matchCategory && matchQuery;
  });

  return (
    <section className="feature-page">
      <div className="feature-page-heading">
        <span className="feature-heading-icon" style={{ color: "#496ce7", background: "#e8edff" }}>
          <BookOpen size={27} />
        </span>
        <div>
          <span className="section-kicker">EVIDENCE-BASED HEALTH EDUCATION</span>
          <h1>{t("library")}</h1>
          <p>Medically verified articles from WHO, MoHFW India, and ICMR. Search, learn, and bookmark.</p>
        </div>
      </div>

      {language !== "en" && (
        <div className="language-info">
          <Globe size={17} />
          <div>
            Articles are written with simple medical terminology. Use the AI Assistant to translate or explain any
            specific article in your preferred regional language.
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="library-toolbar">
        <div className="library-search">
          <Search size={18} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symptoms, wellness, nutrition, or conditions..."
            aria-label="Search articles"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          aria-label="Filter category"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c === "Saved Only" ? `Saved Articles (${savedIds.length})` : c}
            </option>
          ))}
        </select>

        <span className="saved-count">
          <Bookmark size={16} /> {savedIds.length} saved
        </span>
      </div>

      {/* Detail View vs Grid View */}
      {selectedArticle ? (
        <article className="article-detail">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              className="button button-outline"
              type="button"
              onClick={() => setSelectedArticle(null)}
              style={{ minHeight: "36px", padding: "6px 14px", fontSize: "12px" }}
            >
              ← Back to articles
            </button>

            <button
              className="button button-outline"
              type="button"
              onClick={() => toggleBookmark(selectedArticle.id)}
              style={{ minHeight: "36px", padding: "6px 14px", fontSize: "12px" }}
            >
              {savedIds.includes(selectedArticle.id) ? (
                <>
                  <BookmarkCheck size={16} style={{ color: "#0866f5" }} /> Saved
                </>
              ) : (
                <>
                  <Bookmark size={16} /> Save Article
                </>
              )}
            </button>
          </div>

          <img
            src={selectedArticle.image || selectedArticle.image_url}
            alt=""
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "16px" }}>
            <span className="category-tag">{selectedArticle.category}</span>
            {selectedArticle.reviewedDate && (
              <span style={{ fontSize: "12px", color: "#8097b6", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Calendar size={13} /> Reviewed: {selectedArticle.reviewedDate}
              </span>
            )}
          </div>

          <h1>{selectedArticle.title}</h1>

          <div
            style={{
              fontSize: "14px",
              lineHeight: "1.8",
              color: "#304d70",
              whiteSpace: "pre-wrap",
              marginTop: "20px",
            }}
          >
            {selectedArticle.content || selectedArticle.summary}
          </div>

          {selectedArticle.sourceName && (
            <div
              style={{
                marginTop: "30px",
                padding: "14px",
                background: "#f4f8fe",
                borderRadius: "12px",
                border: "1px solid #e1edfc",
                fontSize: "12px",
                color: "#537197",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                <strong>Verified Source:</strong> {selectedArticle.sourceName}
              </span>
              {selectedArticle.sourceUrl && (
                <a
                  href={selectedArticle.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#0866f5", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}
                >
                  Official Portal <ExternalLink size={12} />
                </a>
              )}
            </div>
          )}

          <p className="safety-note">
            <ShieldCheck size={16} /> This educational article is intended for health literacy and does not replace individual
            clinical evaluation by a licensed healthcare professional.
          </p>
        </article>
      ) : loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <LoaderCircle size={32} style={{ animation: "spin 1s linear infinite", margin: "auto", color: "#0866f5" }} />
          <p style={{ marginTop: "12px", color: "#748cae", fontSize: "13px" }}>Loading health education library...</p>
        </div>
      ) : (
        <div className="library-grid">
          {filteredArticles.map((art) => {
            const isBookmarked = savedIds.includes(art.id);
            return (
              <article
                className="article-card"
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                style={{ cursor: "pointer" }}
              >
                <button
                  className="bookmark-button"
                  type="button"
                  onClick={(e) => toggleBookmark(art.id, e)}
                  aria-label={isBookmarked ? "Remove bookmark" : "Bookmark article"}
                  title={isBookmarked ? "Remove bookmark" : "Save article"}
                >
                  {isBookmarked ? (
                    <BookmarkCheck size={19} style={{ color: "#0866f5" }} />
                  ) : (
                    <Bookmark size={19} />
                  )}
                </button>

                <img
                  src={art.image || art.image_url}
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />

                <div className="article-card-body">
                  <span className="category-tag">{art.category}</span>
                  <h3>{art.title}</h3>
                  <p>{art.summary || art.content?.slice(0, 160) + "..."}</p>
                  <span className="learn-more">
                    Read Article <ArrowRight size={14} />
                  </span>
                </div>
              </article>
            );
          })}

          {filteredArticles.length === 0 && (
            <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
              <BookOpen size={32} />
              <strong>No Articles Found</strong>
              <p>Try searching for a different health condition, symptom, or wellness keyword.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
