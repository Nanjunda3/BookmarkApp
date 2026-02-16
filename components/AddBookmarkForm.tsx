"use client";

import {useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {validateAndNormalizeUrl} from "@/lib/utils";
import type {Bookmark} from "@/lib/types";

interface AddBookmarkFormProps {
  userId: string;
  onAdd: (bookmark: Bookmark) => void;
  existingBookmarks: Bookmark[]; 
}

export default function AddBookmarkForm({userId, onAdd, existingBookmarks, }: AddBookmarkFormProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [titleError, setTitleError] = useState("");
  const [urlError, setUrlError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successFlash, setSuccessFlash] = useState(false);

 const validate = () => {
  let valid = true;

 
  if (!title.trim()) {
    setTitleError("Title is required");
    valid = false;
  } else if (title.trim().length > 200) {
    setTitleError("Title must be under 200 characters");
    valid = false;
  } else {
    
    const duplicateTitle = existingBookmarks.find(
      (b) => b.title.toLowerCase() === title.trim().toLowerCase()
    );
    if (duplicateTitle) {
      setTitleError(`A bookmark named "${title.trim()}" already exists`);
      valid = false;
    } else {
      setTitleError("");
    }
  }


  const normalizedUrl = validateAndNormalizeUrl(url);

  if (!url.trim()) {
    setUrlError("URL is required");
    valid = false;
  } else if (!normalizedUrl) {
    setUrlError(
      "Please enter a valid URL with a domain (e.g. google.com or https://example.com)"
    );
    valid = false;
  } else {
    
    const duplicateUrl = existingBookmarks.find(
      (b) => b.url === normalizedUrl
    );
    if (duplicateUrl) {
      setUrlError(
        `This URL is already saved as "${duplicateUrl.title}"`
      );
      valid = false;
    } else {
      setUrlError("");
    }
  }

  return valid;
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const normalizedUrl = validateAndNormalizeUrl(url)!;
    setIsSubmitting(true);

    const supabase = createClient();
    const {error} = await supabase.from("bookmarks").insert({
      user_id: userId,
      title: title.trim(),
      url: normalizedUrl,
    });

    setIsSubmitting(false);

    if (error) {
      setUrlError("Failed to save bookmark. Please try again.");
      return;
    }

    const {data: newBookmark} = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {ascending: false})
      .limit(1)
      .single();

    if (newBookmark) {
      onAdd(newBookmark as Bookmark);
    }

    setTitle("");
    setUrl("");
    setTitleError("");
    setUrlError("");
    setSuccessFlash(true);
    setTimeout(() => setSuccessFlash(false), 2000);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mb-8 animate-fade-in"
      aria-label="Add bookmark form"
    >
      <div
        className="p-5 rounded-2xl"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid",
          borderColor: successFlash
            ? "rgba(251,191,36,0.4)"
            : "var(--border-subtle)",
          transition: "border-color 0.3s ease",
          boxShadow: successFlash ? "0 0 20px rgba(251,191,36,0.08)" : "none",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          <span
            className="text-sm font-semibold"
            style={{color: "var(--text-primary)"}}
          >
            Add Bookmark
          </span>
        </div>

        <div className="space-y-3">
          {/* Title field */}
          <div>
            <label
              htmlFor="bookmark-title"
              className="block text-xs font-medium mb-1.5"
              style={{color: "var(--text-secondary)"}}
            >
              Title
            </label>
            <input
              id="bookmark-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError("");
              }}
              placeholder="My favourite article"
              className="input-field"
              aria-describedby={titleError ? "title-error" : undefined}
              aria-invalid={!!titleError}
              maxLength={200}
              disabled={isSubmitting}
            />
            {titleError && (
              <p
                id="title-error"
                className="mt-1.5 text-xs"
                style={{color: "#f87171"}}
                role="alert"
              >
                {titleError}
              </p>
            )}
          </div>

          {/* URL field */}
          <div>
            <label
              htmlFor="bookmark-url"
              className="block text-xs font-medium mb-1.5"
              style={{color: "var(--text-secondary)"}}
            >
              URL
            </label>
            <input
              id="bookmark-url"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (urlError) setUrlError("");
              }}
              placeholder="https://example.com"
              className="input-field"
              aria-describedby={urlError ? "url-error" : undefined}
              aria-invalid={!!urlError}
              disabled={isSubmitting}
            />
            {urlError && (
              <p
                id="url-error"
                className="mt-1.5 text-xs"
                style={{color: "#f87171"}}
                role="alert"
              >
                {urlError}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center gap-2"
              aria-live="polite"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span>Saving…</span>
                </>
              ) : successFlash ? (
                <>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Save Bookmark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
