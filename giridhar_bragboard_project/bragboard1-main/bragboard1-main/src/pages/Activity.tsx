import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { TrendingUp, MessageSquare, ThumbsUp, Award } from "lucide-react";

export default function Activity() {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    const { data: shoutOuts } = await supabase
      .from("shout_outs")
      .select("*, sender:profiles!shout_outs_sender_id_fkey(name, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(20);

    const { data: reactions } = await supabase
      .from("reactions")
      .select("*, user:profiles(name, avatar_url), shout_out:shout_outs(message)")
      .order("created_at", { ascending: false })
      .limit(20);

    const combined: any[] = [
      ...(shoutOuts?.map(s => ({ ...s, type: "shoutout" })) || []),
      ...(reactions?.map(r => ({ ...r, type: "reaction" })) || [])
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setActivities(combined.slice(0, 50));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-primary" />
          Activity Feed
        </h2>
        <p className="text-muted-foreground">Latest updates from your team</p>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={activity.sender?.avatar_url || activity.user?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                    {(activity.sender?.name || activity.user?.name)?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  {activity.type === "shoutout" ? (
                    <>
                      <p className="text-sm">
                        <span className="font-medium">{activity.sender?.name}</span> shared a shout-out
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{activity.message}</p>
                    </>
                  ) : (
                    <p className="text-sm">
                      <span className="font-medium">{activity.user?.name}</span> reacted to a shout-out
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
                {activity.type === "shoutout" ? (
                  <MessageSquare className="w-5 h-5 text-primary" />
                ) : (
                  <ThumbsUp className="w-5 h-5 text-secondary" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
