import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Award, Target, TrendingUp, MessageSquare, Calendar as CalendarIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import StatsCards from "@/components/StatsCards";
import AchievementBadges from "@/components/AchievementBadges";
import TrendingSection from "@/components/TrendingSection";

export default function Dashboard() {
  const { profile } = useOutletContext<any>();
  const navigate = useNavigate();
  const [recentShoutOuts, setRecentShoutOuts] = useState<any[]>([]);
  const [upcomingGoals, setUpcomingGoals] = useState(5);
  const [teamActivity, setTeamActivity] = useState(12);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const { data } = await supabase
      .from("shout_outs")
      .select("*, sender:profiles!shout_outs_sender_id_fkey(name)")
      .order("created_at", { ascending: false })
      .limit(3);
    
    setRecentShoutOuts(data || []);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">
          Hey {profile?.name} ({profile?.role}), you were last working on
        </h2>
        <p className="text-muted-foreground">
          Welcome back to BragBoard! Continue sharing your achievements.
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <StatsCards userId={profile?.id} />
        <TrendingSection />
        <AchievementBadges userId={profile?.id} />
      </div>

      <section className="mb-8">
        <h3 className="text-2xl font-semibold mb-6">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-md hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate("/shout-outs")}>
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-center">Share a Shout-Out</CardTitle>
              <CardDescription className="text-center">
                Celebrate achievements with the team
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate("/team")}>
            <CardHeader>
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <CardTitle className="text-center">Browse Team</CardTitle>
              <CardDescription className="text-center">
                Connect with your colleagues
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate("/goals")}>
            <CardHeader>
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <Target className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-center">Track Goals</CardTitle>
              <CardDescription className="text-center">
                Monitor your progress and achievements
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate("/activity")}>
            <CardHeader>
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-950/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-center">Activity Feed</CardTitle>
              <CardDescription className="text-center">
                See latest team updates
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate("/calendar")}>
            <CardHeader>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <CalendarIcon className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-center">Calendar View</CardTitle>
              <CardDescription className="text-center">
                Track activity over time
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate("/leaderboard")}>
            <CardHeader>
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <Award className="w-8 h-8 text-amber-600" />
              </div>
              <CardTitle className="text-center">Leaderboard</CardTitle>
              <CardDescription className="text-center">
                See top contributors
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold">Recent Shout-Outs</h3>
          <Button variant="outline" onClick={() => navigate("/shout-outs")}>
            View All
          </Button>
        </div>
        <div className="space-y-4">
          {recentShoutOuts.map(shoutOut => (
            <Card key={shoutOut.id}>
              <CardContent className="p-4">
                <p className="text-sm font-medium">{shoutOut.sender?.name}</p>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{shoutOut.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDistanceToNow(new Date(shoutOut.created_at), { addSuffix: true })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile</CardTitle>
            <CardDescription>Your information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{profile?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{profile?.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Role & Department</CardTitle>
            <CardDescription>Your organizational details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Employee Type</p>
              <Badge variant="default" className="capitalize">
                {profile?.role}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">{profile?.department}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Status</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <Badge variant="default" className="bg-success">
                Active
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium">
                {profile?.joined_at && formatDistanceToNow(new Date(profile.joined_at), { addSuffix: true })}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
