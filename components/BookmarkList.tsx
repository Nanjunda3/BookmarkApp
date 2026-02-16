"use client";

import { useEffect, useCallback} from "react";
import {createClient} from "@/lib/supabase/client";
import BookmarkCard from "./BookmarkCard";
import type {Bookmark} from "@/lib/types";

interface BookmarkListProps {
  bookmarks: Bookmark[];           // ← receives from parent
  setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>;  // ← from parent
  userId: string;
}

export default function BookmarkList({
  bookmarks,
  setBookmarks,
  userId,
}: BookmarkListProps) {

  const handleDeleted = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, [setBookmarks]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newBookmark = payload.new as Bookmark;
            setBookmarks((prev) => {
              // Prevent duplicates (optimistic updates may already have added it)
              if (prev.find((b) => b.id === newBookmark.id)) return prev;
              return [newBookmark, ...prev];
            });
          }

          if (payload.eventType === "DELETE") {
            setBookmarks((prev) =>
              prev.filter((b) => b.id !== (payload.old as Bookmark).id),
            );
          }

          if (payload.eventType === "UPDATE") {
            const updatedBookmark = payload.new as Bookmark;
            setBookmarks((prev) =>
              prev.map((b) =>
                b.id === updatedBookmark.id ? updatedBookmark : b,
              ),
            );
          }
        },
      )
      
      .subscribe((status) => {
        console.log("🔴 Realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, setBookmarks]);

  if (bookmarks.length === 0) {
    return (
      <div
        className="text-center py-20 rounded-2xl animate-fade-in"
        style={{
          background: "var(--bg-surface)",
          border: "1px dashed var(--border-default)",
        }}
      >
        {/* Illustration */}
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
          style={{
            background: "rgba(251,191,36,0.06)",
            border: "1px solid rgba(251,191,36,0.1)",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{opacity: 0.7}}
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            <line x1="12" y1="8" x2="12" y2="14" />
            <line x1="9" y1="11" x2="15" y2="11" />
          </svg>
        </div>

        <h3
          className="text-base font-semibold mb-2"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-primary)",
          }}
        >
          No bookmarks yet
        </h3>
        <p className="text-sm" style={{color: "var(--text-secondary)"}}>
          Add your first bookmark using the form above.
        </p>
        <p
          className="text-xs mt-1"
          style={{color: "var(--text-secondary)", opacity: 0.6}}
        >
          They&apos;ll sync across all your tabs in real-time ✨
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Your bookmarks">
      <div className="space-y-3 stagger-children">
        {bookmarks.map((bookmark) => (
          <BookmarkCard
            key={bookmark.id}
            bookmark={bookmark}
            onDeleted={handleDeleted}
          />
        ))}
      </div>

      {bookmarks.length > 5 && (
        <p
          className="text-center text-xs mt-6"
          style={{color: "var(--text-secondary)", opacity: 0.6}}
        >
          {bookmarks.length} bookmarks · updates in real-time
        </p>
      )}
    </section>
  );
}
