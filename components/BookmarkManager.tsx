"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import AddBookmarkForm from "./AddBookmarkForm";
import BookmarkList from "./BookmarkList";
import type { Bookmark } from "@/lib/types";

interface BookmarkManagerProps {
  initialBookmarks: Bookmark[];
  userId: string;
}

type BroadcastMessage =
  | { type: "INSERT"; bookmark: Bookmark }
  | { type: "DELETE"; id: string };

export default function BookmarkManager({
  initialBookmarks,
  userId,
}: BookmarkManagerProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    // Create a broadcast channel — all tabs on same origin share this
    const bc = new BroadcastChannel("markd_bookmarks");
    channelRef.current = bc;

    // Listen for messages from OTHER tabs
    bc.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      const msg = event.data;

      if (msg.type === "INSERT") {
        // Only add if it belongs to this user
        if (msg.bookmark.user_id !== userId) return;
        setBookmarks((prev) => {
          if (prev.find((b) => b.id === msg.bookmark.id)) return prev;
          return [msg.bookmark, ...prev];
        });
      }

      if (msg.type === "DELETE") {
        setBookmarks((prev) => prev.filter((b) => b.id !== msg.id));
      }
    };

    return () => {
      bc.close();
    };
  }, [userId]);

  // Called immediately when form saves
  const handleAdd = useCallback((newBookmark: Bookmark) => {
    // Update THIS tab instantly
    setBookmarks((prev) => {
      if (prev.find((b) => b.id === newBookmark.id)) return prev;
      return [newBookmark, ...prev];
    });

    // Broadcast to ALL OTHER tabs instantly
    channelRef.current?.postMessage({
      type: "INSERT",
      bookmark: newBookmark,
    } as BroadcastMessage);
  }, []);

  const handleDelete = useCallback((id: string) => {
    // Update THIS tab instantly
    setBookmarks((prev) => prev.filter((b) => b.id !== id));

    // Broadcast to ALL OTHER tabs instantly
    channelRef.current?.postMessage({
      type: "DELETE",
      id,
    } as BroadcastMessage);
  }, []);

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

      <AddBookmarkForm userId={userId} onAdd={handleAdd} existingBookmarks={bookmarks} />
      <BookmarkList
        bookmarks={bookmarks}
        setBookmarks={setBookmarks}
        userId={userId}
        onDelete={handleDelete}
      />
    </>
  );
}