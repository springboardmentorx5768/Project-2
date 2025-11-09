import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function BookmarkButton({ shoutOutId, userId }: { shoutOutId: string; userId: string }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkBookmark();
  }, [shoutOutId, userId]);

  const checkBookmark = async () => {
    const { data } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", userId)
      .eq("shout_out_id", shoutOutId)
      .maybeSingle();

    setIsBookmarked(!!data);
  };

  const toggleBookmark = async () => {
    if (isBookmarked) {
      await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", userId)
        .eq("shout_out_id", shoutOutId);

      toast({ title: "Removed from bookmarks" });
      setIsBookmarked(false);
    } else {
      await supabase
        .from("bookmarks")
        .insert({ user_id: userId, shout_out_id: shoutOutId });

      toast({ title: "Added to bookmarks" });
      setIsBookmarked(true);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleBookmark}
      className={`gap-1 ${isBookmarked ? "text-amber-500" : ""}`}
    >
      <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
      {isBookmarked ? "Saved" : "Save"}
    </Button>
  );
}