"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { getDomain, formatRelativeTime, truncate } from "@/lib/utils";
import type { Bookmark } from "@/lib/types";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onDeleted: (id: string) => void;
}

export default function BookmarkCard({ bookmark, onDeleted }: BookmarkCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  const domain = getDomain(bookmark.url);
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", bookmark.id);

    if (!error) {
      onDeleted(bookmark.id);
    } else {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <article
      className="group relative rounded-xl p-4 transition-all duration-200 animate-slide-in"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        opacity: isDeleting ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!isDeleting) {
          e.currentTarget.style.borderColor = "var(--border-default)";
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-subtle)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Delete confirmation overlay */}
      {showConfirm && (
        <div
          className="absolute inset-0 rounded-xl flex items-center justify-center z-10 gap-3"
          style={{ background: "rgba(7,7,26,0.92)", backdropFilter: "blur(4px)" }}
        >
          <p className="text-sm mr-1" style={{ color: "var(--text-secondary)" }}>
            Delete this bookmark?
          </p>
          <button
            onClick={handleConfirmDelete}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171",
            }}
            aria-label="Confirm delete"
          >
            Delete
          </button>
          <button
            onClick={handleCancelDelete}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--border-default)",
              color: "var(--text-secondary)",
            }}
            aria-label="Cancel delete"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Favicon */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden"
          style={{ background: "var(--bg-elevated)" }}
        >
          {faviconError ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5050a0"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          ) : (
            <Image
              src={faviconUrl}
              alt=""
              width={20}
              height={20}
              className="object-contain"
              onError={() => setFaviconError(true)}
              unoptimized
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            aria-label={`Open ${bookmark.title} in new tab`}
          >
            <h3
              className="font-semibold text-sm leading-snug truncate hover:underline"
              style={{ color: "var(--text-primary)", textDecorationColor: "#fbbf24" }}
            >
              {bookmark.title}
            </h3>
            <p
              className="text-xs mt-0.5 truncate"
              style={{ color: "var(--text-secondary)" }}
            >
              {truncate(bookmark.url, 55)}
            </p>
          </a>

          <div className="flex items-center gap-2 mt-2">
            <span
              className="text-xs px-2 py-0.5 rounded-md"
              style={{
                background: "rgba(255,255,255,0.04)",
                color: "var(--text-secondary)",
                fontSize: "10px",
              }}
            >
              {domain}
            </span>
            <span
              className="text-xs"
              style={{ color: "var(--text-secondary)", fontSize: "11px" }}
            >
              · {formatRelativeTime(bookmark.created_at)}
            </span>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting || showConfirm}
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-150"
          style={{
            background: "transparent",
            border: "1px solid transparent",
          }}
          aria-label={`Delete bookmark: ${bookmark.title}`}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.1)";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "transparent";
          }}
        >
          {isDeleting ? (
            <svg
              className="animate-spin"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f87171"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f87171"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          )}
        </button>
      </div>
    </article>
  );
}
