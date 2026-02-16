"use client";

import { useState, useCallback } from "react";
import AddBookmarkForm from "./AddBookmarkForm";
import BookmarkList from "./BookmarkList";
import type { Bookmark } from "@/lib/types";

interface BookmarkManagerProps {
  initialBookmarks: Bookmark[];
  userId: string;
}

export default function BookmarkManager({
  initialBookmarks,
  userId,
}: BookmarkManagerProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);

  const handleAdd = useCallback((newBookmark: Bookmark) => {
    setBookmarks((prev) => {
      if (prev.find((b) => b.id === newBookmark.id)) return prev;
      return [newBookmark, ...prev];
    });
  }, []);

  // const handleDelete = useCallback((id: string) => {
  //   setBookmarks((prev) => prev.filter((b) => b.id !== id));
  // }, []);

  return (
    <>
      <div className="mb-8 animate-fade-in">
        <h2
          className="text-2xl font-bold mb-1"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-primary)",
          }}
        >
          Your Bookmarks
        </h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {bookmarks.length === 0
            ? "No bookmarks yet — add your first one below."
            : `${bookmarks.length} bookmark${bookmarks.length === 1 ? "" : "s"} saved`}
        </p>
      </div>

      <AddBookmarkForm userId={userId} onAdd={handleAdd} />
      <BookmarkList
        bookmarks={bookmarks}
        setBookmarks={setBookmarks}
        userId={userId}
      />
    </>
  );
}