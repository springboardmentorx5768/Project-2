import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Zap, Award, Target, Flame } from "lucide-react";

const BADGE_ICONS: Record<string, any> = {
  first_shoutout: Star,
  five_shoutouts: Zap,
  ten_shoutouts: Trophy,
  first_reaction: Award,
  popular: Flame,
  consistent: Target,
};

export default function AchievementBadges({ userId }: { userId: string }) {
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    fetchAchievements();
    checkAndAwardAchievements();
  }, [userId]);

  const fetchAchievements = async () => {
    const { data } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", userId)
      .order("earned_at", { ascending: false });

    setAchievements(data || []);
  };

  const checkAndAwardAchievements = async () => {
    const { data: shoutOuts } = await supabase
      .from("shout_outs")
      .select("id")
      .eq("sender_id", userId);

    const { data: reactions } = await supabase
      .from("reactions")
      .select("id")
      .eq("user_id", userId);

    const shoutOutCount = shoutOuts?.length || 0;
    const reactionCount = reactions?.length || 0;

    const newBadges = [];

    if (shoutOutCount >= 1) newBadges.push({ type: "first_shoutout", name: "First Steps" });
    if (shoutOutCount >= 5) newBadges.push({ type: "five_shoutouts", name: "Rising Star" });
    if (shoutOutCount >= 10) newBadges.push({ type: "ten_shoutouts", name: "Champion" });
    if (reactionCount >= 1) newBadges.push({ type: "first_reaction", name: "Supporter" });

    for (const badge of newBadges) {
      const { data: existing } = await supabase
        .from("achievements")
        .select("id")
        .eq("user_id", userId)
        .eq("badge_type", badge.type)
        .maybeSingle();

      if (!existing) {
        await supabase.from("achievements").insert({
          user_id: userId,
          badge_type: badge.type,
          badge_name: badge.name,
        });

        await supabase.from("notifications").insert({
          user_id: userId,
          type: "achievement",
          title: "New Achievement! 🏆",
          message: `You've earned the "${badge.name}" badge!`,
        });
      }
    }

    fetchAchievements();
  };

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
          <Trophy className="h-5 w-5 text-amber-600" />
          🏆 Your Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Start earning achievements!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {achievements.map((achievement) => {
              const Icon = BADGE_ICONS[achievement.badge_type] || Trophy;
              return (
                <div
                  key={achievement.id}
                  className="p-3 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 text-center hover:scale-105 transition-transform"
                >
                  <Icon className="h-8 w-8 mx-auto text-amber-600 mb-2" />
                  <p className="font-semibold text-sm">{achievement.badge_name}</p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}