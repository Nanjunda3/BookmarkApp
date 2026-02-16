import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import Header from "@/components/Header";
// import AddBookmarkForm from "@/components/AddBookmarkForm";
// import BookmarkList from "@/components/BookmarkList";
import type {Bookmark} from "@/lib/types";
import BookmarkManager from "@/components/BookmarkManager";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: {session},
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Server-side fetch for initial render (fast first load)
  const {data: bookmarks} = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", {ascending: false});

  return (
    <div className="min-h-screen">
      <Header user={session.user} />

      <main className="max-w-2xl mx-auto px-4 pb-20 pt-8">
        <BookmarkManager
          initialBookmarks={(bookmarks as Bookmark[]) ?? []}
          userId={session.user.id}
        />
      </main>
    </div>
  );
}
