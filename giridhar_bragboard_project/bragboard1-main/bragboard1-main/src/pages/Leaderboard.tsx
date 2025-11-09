import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Award, TrendingUp, Medal, Star, Flame } from "lucide-react";
import { motion } from "framer-motion";

interface LeaderboardUser {
  id: string;
  name: string;
  department: string;
  count: number;
  avatar_url?: string;
}

export default function Leaderboard() {
  const [topContributors, setTopContributors] = useState<LeaderboardUser[]>([]);
  const [mostTagged, setMostTagged] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboardData();
  }, []);

  const loadLeaderboardData = async () => {
    try {
      // Get top contributors
      const { data: contributors } = await supabase
        .from("shout_outs")
        .select("sender_id, sender:profiles!shout_outs_sender_id_fkey(name, department, avatar_url)")
        .order("created_at", { ascending: false });

      if (contributors) {
        const contributorCounts = contributors.reduce((acc: any, item: any) => {
          const id = item.sender_id;
          if (!acc[id]) {
            acc[id] = { ...item.sender, count: 0, id };
          }
          acc[id].count++;
          return acc;
        }, {});

        setTopContributors(
          Object.values(contributorCounts)
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, 10) as LeaderboardUser[]
        );
      }

      // Get most tagged users
      const { data: tagged } = await supabase
        .from("shout_out_recipients")
        .select("recipient_id, recipient:profiles!shout_out_recipients_recipient_id_fkey(name, department, avatar_url)");

      if (tagged) {
        const taggedCounts = tagged.reduce((acc: any, item: any) => {
          const id = item.recipient_id;
          if (!acc[id]) {
            acc[id] = { ...item.recipient, count: 0, id };
          }
          acc[id].count++;
          return acc;
        }, {});

        setMostTagged(
          Object.values(taggedCounts)
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, 10) as LeaderboardUser[]
        );
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return { icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950" };
    if (index === 1) return { icon: Medal, color: "text-gray-400", bg: "bg-gray-50 dark:bg-gray-900" };
    if (index === 2) return { icon: Award, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" };
    return { icon: Star, color: "text-muted-foreground", bg: "bg-muted" };
  };

  const getStreakColor = (count: number) => {
    if (count >= 50) return "from-yellow-500 to-orange-600";
    if (count >= 30) return "from-orange-500 to-red-600";
    if (count >= 15) return "from-blue-500 to-purple-600";
    return "from-primary to-secondary";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Hall of Fame
        </h1>
        <p className="text-muted-foreground text-lg">
          Celebrating our top contributors and most appreciated team members
        </p>
      </div>

      {/* Most Appreciated Employees */}
      <Card className="border-2 border-primary/20 shadow-[0_0_40px_rgba(147,51,234,0.15)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            Most Appreciated Employees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mostTagged.map((user, index) => {
              const { icon: RankIcon, color, bg } = getRankBadge(index);
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative overflow-hidden rounded-lg border bg-card hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Rank */}
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full ${bg}`}>
                      <RankIcon className={`w-6 h-6 ${color}`} />
                    </div>

                    {/* Avatar */}
                    <Avatar className="w-14 h-14 border-2 border-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>

                    {/* User Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {user.department}
                      </Badge>
                    </div>

                    {/* Count with Flame Effect */}
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                      <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getStreakColor(user.count)} text-white font-bold text-lg`}>
                        {user.count}
                      </div>
                    </div>
                  </div>

                  {/* Rank Number */}
                  <div className="absolute top-2 right-2 text-6xl font-bold opacity-5">
                    #{index + 1}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Contributors */}
      <Card className="border-2 border-accent/20 shadow-[0_0_40px_rgba(8,145,178,0.15)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-gradient-to-br from-accent to-success rounded-lg">
              <TrendingUp className="w-6 h-6 text-accent-foreground" />
            </div>
            Top Contributors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topContributors.map((user, index) => {
              const { icon: RankIcon, color, bg } = getRankBadge(index);
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative overflow-hidden rounded-lg border bg-card hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Rank */}
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full ${bg}`}>
                      <RankIcon className={`w-6 h-6 ${color}`} />
                    </div>

                    {/* Avatar */}
                    <Avatar className="w-14 h-14 border-2 border-accent/20">
                      <AvatarFallback className="bg-gradient-to-br from-accent to-success text-accent-foreground font-bold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>

                    {/* User Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {user.department}
                      </Badge>
                    </div>

                    {/* Count */}
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getStreakColor(user.count)} text-white font-bold text-lg`}>
                        {user.count}
                      </div>
                    </div>
                  </div>

                  {/* Rank Number */}
                  <div className="absolute top-2 right-2 text-6xl font-bold opacity-5">
                    #{index + 1}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
