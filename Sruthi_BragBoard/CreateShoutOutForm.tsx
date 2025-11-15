import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Megaphone, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

interface CreateShoutOutFormProps {
  onSuccess: () => void;
}

export const CreateShoutOutForm = ({ onSuccess }: CreateShoutOutFormProps) => {
  const [message, setMessage] = useState("");
  const [taggedUsers, setTaggedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);

  const { data: profiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: shoutOut, error: shoutOutError } = await supabase
        .from("shout_outs")
        .insert({ sender_id: user.id, message })
        .select()
        .single();

      if (shoutOutError) throw shoutOutError;

      if (taggedUsers.length > 0 && shoutOut) {
        const tags = taggedUsers.map((userId) => ({
          shout_out_id: shoutOut.id,
          tagged_user_id: userId,
        }));
        const { error: tagsError } = await supabase
          .from("shout_out_tags")
          .insert(tags);
        if (tagsError) throw tagsError;
      }

      toast.success("Shout-out posted!");
      setMessage("");
      setTaggedUsers([]);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to create shout-out");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserTag = (userId: string) => {
    setTaggedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const getTaggedUserNames = () => {
    if (!profiles) return [];
    return taggedUsers.map((id) => profiles.find((p) => p.id === id)?.full_name || "");
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          Give a Shout-Out
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              placeholder="Recognize someone's amazing work..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowUserSelector(!showUserSelector)}
            >
              {showUserSelector ? "Hide" : "Tag"} People
            </Button>

            {getTaggedUserNames().length > 0 && (
              <div className="flex flex-wrap gap-2">
                {getTaggedUserNames().map((name, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {name}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => toggleUserTag(taggedUsers[idx])}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {showUserSelector && profiles && (
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                {profiles.map((profile) => (
                  <label
                    key={profile.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={taggedUsers.includes(profile.id)}
                      onChange={() => toggleUserTag(profile.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">
                      {profile.full_name} <span className="text-muted-foreground">({profile.department})</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Posting..." : "Post Shout-Out"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
