import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Trophy,
  TrendingUp,
  Users,
  Flag,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  Award,
  MessageSquare,
  ThumbsUp,
  FileText,
  Activity,
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart,
  Clock,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { formatDistanceToNow, format, subDays, startOfDay, endOfDay } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import UserManagement from "@/components/UserManagement";
import ReportedContentSection from "@/components/ReportedContentSection";

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    totalShoutOuts: 0,
    totalReactions: 0,
    totalComments: 0,
    totalUsers: 0,
    activeUsers: 0,
    avgReactionsPerPost: 0,
    avgCommentsPerPost: 0,
    mostPopularReaction: "",
    todayShoutOuts: 0,
    weekShoutOuts: 0,
    monthShoutOuts: 0,
  });
  const [topContributors, setTopContributors] = useState<any[]>([]);
  const [mostTagged, setMostTagged] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [allShoutOuts, setAllShoutOuts] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [departmentStats, setDepartmentStats] = useState<any[]>([]);
  const [engagementRate, setEngagementRate] = useState(0);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      await loadAdminData();
    } catch (error) {
      console.error("Admin check failed:", error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      // Basic stats
      const { count: shoutOutCount } = await supabase
        .from("shout_outs")
        .select("*", { count: "exact", head: true });

      const { count: reactionCount } = await supabase
        .from("reactions")
        .select("*", { count: "exact", head: true });

      const { count: commentCount } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true });

      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Advanced stats
      const { data: allShoutOutsData } = await supabase
        .from("shout_outs")
        .select("*, reactions(*), comments(*)");

      const today = startOfDay(new Date());
      const weekAgo = subDays(today, 7);
      const monthAgo = subDays(today, 30);

      const todayCount = allShoutOutsData?.filter(s => new Date(s.created_at) >= today).length || 0;
      const weekCount = allShoutOutsData?.filter(s => new Date(s.created_at) >= weekAgo).length || 0;
      const monthCount = allShoutOutsData?.filter(s => new Date(s.created_at) >= monthAgo).length || 0;

      // Calculate averages
      const avgReactions = shoutOutCount ? (reactionCount || 0) / shoutOutCount : 0;
      const avgComments = shoutOutCount ? (commentCount || 0) / shoutOutCount : 0;

      // Most popular reaction
      const { data: reactionsData } = await supabase.from("reactions").select("type");
      const reactionCounts = reactionsData?.reduce((acc: any, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
      }, {});
      const mostPopular = reactionCounts && Object.keys(reactionCounts).length > 0
        ? Object.entries(reactionCounts).sort(([,a]: any, [,b]: any) => b - a)[0][0]
        : "like";

      // Active users (posted in last 30 days)
      const activeUsersSet = new Set(
        allShoutOutsData
          ?.filter(s => new Date(s.created_at) >= monthAgo)
          .map(s => s.sender_id)
      );

      // Engagement rate
      const totalEngagements = (reactionCount || 0) + (commentCount || 0);
      const engagementRate = shoutOutCount ? (totalEngagements / (shoutOutCount * (userCount || 1))) * 100 : 0;

      setStats({
        totalShoutOuts: shoutOutCount || 0,
        totalReactions: reactionCount || 0,
        totalComments: commentCount || 0,
        totalUsers: userCount || 0,
        activeUsers: activeUsersSet.size,
        avgReactionsPerPost: Number(avgReactions.toFixed(1)),
        avgCommentsPerPost: Number(avgComments.toFixed(1)),
        mostPopularReaction: mostPopular as string,
        todayShoutOuts: todayCount,
        weekShoutOuts: weekCount,
        monthShoutOuts: monthCount,
      });

      setEngagementRate(Number(engagementRate.toFixed(1)));

      // Top contributors
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
            .slice(0, 10)
        );
      }

      // Most tagged users
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
            .slice(0, 10)
        );
      }

      // Department stats
      const { data: deptData } = await supabase
        .from("profiles")
        .select("department");

      if (deptData) {
        const deptCounts = deptData.reduce((acc: any, item) => {
          acc[item.department] = (acc[item.department] || 0) + 1;
          return acc;
        }, {});

        setDepartmentStats(
          Object.entries(deptCounts)
            .map(([dept, count]) => ({ department: dept, count }))
            .sort((a: any, b: any) => b.count - a.count)
        );
      }

      // Reports with full data
      const { data: reportsData } = await supabase
        .from("reports")
        .select(`
          *,
          reporter:profiles!reports_reporter_id_fkey(name, avatar_url),
          shout_out:shout_outs(message, sender:profiles!shout_outs_sender_id_fkey(name))
        `)
        .order("created_at", { ascending: false });

      setReports(reportsData || []);

      // All shout-outs for moderation
      const { data: shoutOuts } = await supabase
        .from("shout_outs")
        .select(`
          *,
          sender:profiles!shout_outs_sender_id_fkey(name, department, avatar_url),
          reactions(count),
          comments(count)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      setAllShoutOuts(shoutOuts || []);

      // Recent activity
      const { data: recentShoutOuts } = await supabase
        .from("shout_outs")
        .select("*, sender:profiles!shout_outs_sender_id_fkey(name, avatar_url)")
        .order("created_at", { ascending: false })
        .limit(10);

      setRecentActivity(recentShoutOuts || []);
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteShoutOut = async (id: string) => {
    try {
      const { error } = await supabase.from("shout_outs").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shout-out deleted",
      });
      await loadAdminData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReportAction = async (reportId: string, status: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("reports")
        .update({ status, resolved_by: user?.id })
        .eq("id", reportId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Report ${status}`,
      });
      await loadAdminData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const csvData = [
      ["Rank", "Name", "Department", "Shout-Outs Given"],
      ...topContributors.map((c, i) => [i + 1, c.name, c.department, c.count]),
    ];

    const csv = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bragboard-leaderboard.csv";
    a.click();

    toast({
      title: "CSV Exported",
      description: "Leaderboard data exported successfully",
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(147, 51, 234);
    doc.text("BragBoard Analytics Report", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Overall Statistics", 14, 38);
    doc.setFontSize(10);
    doc.text(`Total Shout-Outs: ${stats.totalShoutOuts}`, 14, 45);
    doc.text(`Total Users: ${stats.totalUsers}`, 14, 51);
    doc.text(`Active Users (30d): ${stats.activeUsers}`, 14, 57);
    doc.text(`Total Reactions: ${stats.totalReactions}`, 14, 63);
    doc.text(`Total Comments: ${stats.totalComments}`, 14, 69);
    doc.text(`Engagement Rate: ${engagementRate}%`, 14, 75);
    
    autoTable(doc, {
      startY: 85,
      head: [["Rank", "Name", "Department", "Shout-Outs"]],
      body: topContributors.map((c, i) => [
        `#${i + 1}`,
        c.name,
        c.department,
        c.count.toString(),
      ]),
      headStyles: {
        fillColor: [147, 51, 234],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });
    
    doc.save("bragboard-analytics.pdf");

    toast({
      title: "PDF Exported",
      description: "Analytics report exported successfully",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getReactionEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      like: "👍",
      clap: "👏",
      star: "⭐",
    };
    return emojis[type] || "👍";
  };

  const filteredShoutOuts = allShoutOuts.filter((s) =>
    s.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage BragBoard activity
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" className="gap-2 hover:border-primary/50">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button onClick={exportToPDF} className="gap-2 bg-gradient-to-r from-primary to-secondary">
            <FileText className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Shout-Outs</CardTitle>
            <MessageSquare className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalShoutOuts}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.todayShoutOuts} today
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reactions</CardTitle>
            <ThumbsUp className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReactions}</div>
            <p className="text-xs text-muted-foreground">
              {getReactionEmoji(stats.mostPopularReaction)} Most popular
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageSquare className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.avgCommentsPerPost} avg/post
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} active
            </p>
          </CardContent>
        </Card>

        {/* New Advanced Stats Cards */}
        <Card className="border-l-4 border-l-warning shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Activity className="w-4 h-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementRate}%</div>
            <p className="text-xs text-muted-foreground">
              Reactions + Comments
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weekShoutOuts}</div>
            <p className="text-xs text-muted-foreground">
              Shout-outs posted
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthShoutOuts}</div>
            <p className="text-xs text-muted-foreground">
              Shout-outs posted
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Reactions</CardTitle>
            <BarChart3 className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgReactionsPerPost}</div>
            <p className="text-xs text-muted-foreground">
              Per shout-out
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full grid-cols-7 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
          <TabsTrigger value="leaderboard">🏆 Leaderboard</TabsTrigger>
          <TabsTrigger value="contributors">📊 Contributors</TabsTrigger>
          <TabsTrigger value="reports">🚩 Reports</TabsTrigger>
          <TabsTrigger value="moderation">🛡️ Moderation</TabsTrigger>
          <TabsTrigger value="activity">📈 Activity</TabsTrigger>
          <TabsTrigger value="insights">💡 Insights</TabsTrigger>
          <TabsTrigger value="users">👥 Users</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card className="border-2 border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Most Appreciated Employees
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Times Tagged</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mostTagged.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {index === 0 && <Award className="w-4 h-4 text-yellow-500" />}
                          {index === 1 && <Award className="w-4 h-4 text-gray-400" />}
                          {index === 2 && <Award className="w-4 h-4 text-amber-600" />}
                          #{index + 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8 bg-gradient-to-br from-primary to-secondary">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-gradient-to-r from-secondary/20 to-accent/20">
                          {user.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-primary to-secondary">
                          {user.count}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributors" className="space-y-4">
          <Card className="border-2 border-secondary/20">
            <CardHeader className="bg-gradient-to-r from-secondary/5 to-accent/5">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Contributor</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Shout-Outs Given</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topContributors.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell>#{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8 bg-gradient-to-br from-accent to-success">
                            <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-gradient-to-r from-accent/20 to-success/20">
                          {user.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-secondary to-accent">
                          {user.count}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card className="border-2 border-destructive/20">
            <CardHeader className="bg-gradient-to-r from-destructive/5 to-warning/5">
              <CardTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-destructive" />
                Reported Content
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ReportedContentSection reports={reports} onReportsUpdate={loadAdminData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4">
          <Card className="border-2 border-accent/20">
            <CardHeader className="bg-gradient-to-r from-accent/5 to-primary/5">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-accent" />
                  All Shout-Outs
                </span>
                <Input
                  placeholder="🔍 Search shout-outs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-xs"
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {filteredShoutOuts.map((shoutOut) => (
                  <div
                    key={shoutOut.id}
                    className="border-2 rounded-lg p-4 space-y-3 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 bg-gradient-to-br from-primary to-secondary">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(shoutOut.sender.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{shoutOut.sender.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {shoutOut.sender.department} •{" "}
                            {formatDistanceToNow(new Date(shoutOut.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteShoutOut(shoutOut.id)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm">{shoutOut.message}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {shoutOut.reactions?.length || 0} reactions
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {shoutOut.comments?.length || 0} comments
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="border-2 border-success/20">
            <CardHeader className="bg-gradient-to-r from-success/5 to-accent/5">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-success" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <Avatar className="w-8 h-8 bg-gradient-to-br from-success to-accent flex-shrink-0">
                      <AvatarFallback className="bg-success text-success-foreground text-xs">
                        {getInitials(activity.sender.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.sender.name}</span>{" "}
                        posted a shout-out
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(activity.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {activity.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-2 border-warning/20">
              <CardHeader className="bg-gradient-to-r from-warning/5 to-accent/5">
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-warning" />
                  Department Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {departmentStats.map((dept: any, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                    >
                      <span className="text-sm font-medium">{dept.department}</span>
                      <Badge variant="outline">{dept.count} users</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Growth Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Today</span>
                      <span className="font-bold text-primary">
                        {stats.todayShoutOuts} shout-outs
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                        style={{
                          width: `${(stats.todayShoutOuts / (stats.weekShoutOuts || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>This Week</span>
                      <span className="font-bold text-secondary">
                        {stats.weekShoutOuts} shout-outs
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-secondary to-accent h-2 rounded-full"
                        style={{
                          width: `${(stats.weekShoutOuts / (stats.monthShoutOuts || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>This Month</span>
                      <span className="font-bold text-accent">
                        {stats.monthShoutOuts} shout-outs
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-accent to-success h-2 rounded-full"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
