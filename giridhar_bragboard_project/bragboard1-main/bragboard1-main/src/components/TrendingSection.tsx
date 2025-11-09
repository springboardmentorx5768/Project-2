import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type TimeFilter = "today" | "week" | "month" | "all";

export default function TrendingSection() {
  const [trending, setTrending] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week");

  useEffect(() => {
    fetchTrending();
  }, [timeFilter]);

  const fetchTrending = async () => {
    let dateFilter = new Date();
    
    switch (timeFilter) {
      case "today":
        dateFilter.setHours(0, 0, 0, 0);
        break;
      case "week":
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case "month":
        dateFilter.setMonth(dateFilter.getMonth() - 1);
        break;
      case "all":
        dateFilter = new Date(0); // Get all time
        break;
    }

    const { data: shoutOuts } = await supabase
      .from("shout_outs")
      .select(`
        *,
        sender:profiles!shout_outs_sender_id_fkey(name, avatar_url),
        reactions(count)
      `)
      .gte("created_at", dateFilter.toISOString())
      .order("created_at", { ascending: false })
      .limit(20);

    if (shoutOuts) {
      const sorted = shoutOuts
        .map(s => ({
          ...s,
          reactionCount: s.reactions?.length || 0
        }))
        .sort((a, b) => b.reactionCount - a.reactionCount)
        .slice(0, 5);

      setTrending(sorted);
    }
  };

  const getFilterLabel = () => {
    switch (timeFilter) {
      case "today": return "Today";
      case "week": return "This Week";
      case "month": return "This Month";
      case "all": return "All Time";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            🔥 Trending {getFilterLabel()}
          </CardTitle>
          <Select value={timeFilter} onValueChange={(value: TimeFilter) => setTimeFilter(value)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trending.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No trending shout-outs yet</p>
          ) : (
            trending.map((shoutOut, index) => (
              <div key={shoutOut.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-black/20 hover:shadow-md transition-all">
                <span className="text-2xl font-bold text-orange-500">#{index + 1}</span>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={shoutOut.sender?.avatar_url} />
                  <AvatarFallback>{shoutOut.sender?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{shoutOut.sender?.name}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{shoutOut.message}</p>
                  <p className="text-xs text-orange-600 font-medium mt-1">{shoutOut.reactionCount} reactions</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}