import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Heart, Trophy, TrendingUp } from "lucide-react";

export default function StatsCards({ userId }: { userId: string }) {
  const [stats, setStats] = useState({
    sentShoutOuts: 0,
    receivedShoutOuts: 0,
    totalReactions: 0,
    achievements: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    const [sent, received, reactions, achievements] = await Promise.all([
      supabase.from("shout_outs").select("id", { count: "exact" }).eq("sender_id", userId),
      supabase.from("shout_out_recipients").select("id", { count: "exact" }).eq("recipient_id", userId),
      supabase.from("reactions").select("id", { count: "exact" }).eq("user_id", userId),
      supabase.from("achievements").select("id", { count: "exact" }).eq("user_id", userId),
    ]);

    setStats({
      sentShoutOuts: sent.count || 0,
      receivedShoutOuts: received.count || 0,
      totalReactions: reactions.count || 0,
      achievements: achievements.count || 0,
    });
  };

  const cards = [
    {
      title: "Shout-Outs Sent",
      value: stats.sentShoutOuts,
      icon: MessageSquare,
      bgColor: "bg-gradient-to-br from-blue-500 to-cyan-500",
      textColor: "text-blue-600",
    },
    {
      title: "Shout-Outs Received",
      value: stats.receivedShoutOuts,
      icon: Heart,
      bgColor: "bg-gradient-to-br from-pink-500 to-rose-500",
      textColor: "text-pink-600",
    },
    {
      title: "Reactions Given",
      value: stats.totalReactions,
      icon: TrendingUp,
      bgColor: "bg-gradient-to-br from-purple-500 to-indigo-500",
      textColor: "text-purple-600",
    },
    {
      title: "Achievements",
      value: stats.achievements,
      icon: Trophy,
      bgColor: "bg-gradient-to-br from-amber-500 to-orange-500",
      textColor: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card
          key={index}
          className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p className={`text-3xl font-bold mt-2 ${card.textColor}`}>
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}