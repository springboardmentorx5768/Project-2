import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BookMarked } from "lucide-react";
import ShoutOutCard from "@/components/ShoutOutCard";

export default function Bookmarks() {
  const { profile } = useOutletContext<any>();
  const [bookmarkedShoutOuts, setBookmarkedShoutOuts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchBookmarks();
    }
  }, [profile?.id]);

  const fetchBookmarks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookmarks")
      .select(`
        shout_out_id,
        shout_outs (
          *,
          sender:profiles!shout_outs_sender_id_fkey(id, name, department, avatar_url),
          recipients:shout_out_recipients(
            recipient:profiles!shout_out_recipients_recipient_id_fkey(id, name, department, avatar_url)
          ),
          reactions(id, type, user_id),
          comments(id, content, created_at, user:profiles!comments_user_id_fkey(id, name, avatar_url))
        )
      `)
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });

    setBookmarkedShoutOuts(data?.map(b => b.shout_outs).filter(Boolean) || []);
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <BookMarked className="w-8 h-8 text-primary" />
          My Bookmarks
        </h2>
        <p className="text-muted-foreground">Your saved shout-outs</p>
      </div>

      <div className="space-y-6">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading bookmarks...</p>
        ) : bookmarkedShoutOuts.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No bookmarks yet</p>
        ) : (
          bookmarkedShoutOuts.map((shoutOut) => (
            <ShoutOutCard
              key={shoutOut.id}
              shoutOut={shoutOut}
              currentUserId={profile?.id}
              onUpdate={fetchBookmarks}
            />
          ))
        )}
      </div>
    </div>
  );
}
