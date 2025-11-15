import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Medal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Leaderboard = () => {
  const { data: topUsers } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      // Get all shout-out tags to count who was recognized the most
      const { data: tags, error } = await supabase
        .from("shout_out_tags")
        .select(`
          tagged_user_id,
          profiles:tagged_user_id (full_name, department)
        `);

      if (error) throw error;

      // Count occurrences of each user
      const userCounts = tags?.reduce((acc: any, tag: any) => {
        const userId = tag.tagged_user_id;
        if (!acc[userId]) {
          acc[userId] = {
            id: userId,
            full_name: tag.profiles?.full_name || "Unknown",
            department: tag.profiles?.department || "N/A",
            count: 0,
          };
        }
        acc[userId].count++;
        return acc;
      }, {});

      // Convert to array and sort by count
      const sorted = Object.values(userCounts || {})
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 10);

      return sorted;
    },
  });

  const getIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-accent" />;
    if (index === 1) return <Award className="w-5 h-5 text-muted-foreground" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" />
          Top Contributors
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!topUsers || topUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No data yet. Start giving shout-outs!
          </p>
        ) : (
          <div className="space-y-3">
            {topUsers.map((user: any, index: number) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-8 text-center font-bold text-muted-foreground">
                  {index + 1}
                </div>
                {getIcon(index)}
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user.full_name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground">{user.department}</p>
                </div>
                <Badge variant="secondary" className="font-bold">
                  {user.count}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
