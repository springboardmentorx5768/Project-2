import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Filter, Sparkles } from "lucide-react";
import ShoutOutCard from "@/components/ShoutOutCard";
import CreateShoutOut from "@/components/CreateShoutOut";

const DEPARTMENTS = [
  "All Departments",
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "Customer Success",
  "Operations",
  "HR",
  "Finance",
  "General",
];

export default function ShoutOuts() {
  const { profile } = useOutletContext<any>();
  const [shoutOuts, setShoutOuts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [timeFilter, setTimeFilter] = useState("All Time");
  const { toast } = useToast();

  useEffect(() => {
    fetchShoutOuts();

    // Set up real-time subscription
    const channel = supabase
      .channel('shout-outs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shout_outs'
        },
        () => fetchShoutOuts()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reactions'
        },
        () => fetchShoutOuts()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments'
        },
        () => fetchShoutOuts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchShoutOuts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("shout_outs")
        .select(`
          *,
          sender:profiles!shout_outs_sender_id_fkey(id, name, department, avatar_url),
          recipients:shout_out_recipients(
            recipient:profiles!shout_out_recipients_recipient_id_fkey(id, name, department, avatar_url)
          ),
          reactions(id, type, user_id),
          comments(id, content, created_at, user:profiles!comments_user_id_fkey(id, name, avatar_url))
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setShoutOuts(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading shout-outs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredShoutOuts = shoutOuts.filter((shoutOut) => {
    const matchesSearch = searchQuery
      ? shoutOut.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shoutOut.message.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesDepartment =
      departmentFilter === "All Departments"
        ? true
        : shoutOut.sender.department === departmentFilter;

    // Time filter logic
    const now = new Date();
    const shoutOutDate = new Date(shoutOut.created_at);
    let matchesTime = true;

    if (timeFilter === "Today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      matchesTime = shoutOutDate >= today;
    } else if (timeFilter === "This Week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesTime = shoutOutDate >= weekAgo;
    } else if (timeFilter === "This Month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchesTime = shoutOutDate >= monthAgo;
    }

    return matchesSearch && matchesDepartment && matchesTime;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent p-8">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative">
          <h2 className="text-4xl font-bold mb-2 text-white flex items-center gap-3">
            <Sparkles className="w-10 h-10" />
            Shout-outs Feed
          </h2>
          <p className="text-white/90 mb-4">Celebrate amazing work and spread positivity! 🎉</p>
          <Button 
            onClick={() => setShowCreateDialog(true)} 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
          >
            ✨ Share a Shout-out
          </Button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-card via-card to-primary/5 rounded-lg border-2 border-primary/20 p-6 mb-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Filters</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Input
            placeholder="🔍 Search by sender..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-2 focus:border-primary"
          />
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Time">All Time</SelectItem>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="This Week">This Week</SelectItem>
              <SelectItem value="This Month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setDepartmentFilter("All Departments");
              setTimeFilter("All Time");
            }}
            className="hover:bg-primary/10 hover:text-primary"
          >
            🔄 Reset Filters
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          💫 Feed ({filteredShoutOuts.length} shout-outs)
        </h3>
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading shout-outs...</p>
            </div>
          ) : filteredShoutOuts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No shout-outs found</p>
            </div>
          ) : (
            filteredShoutOuts.map((shoutOut) => (
              <ShoutOutCard
                key={shoutOut.id}
                shoutOut={shoutOut}
                currentUserId={profile?.id}
                onUpdate={fetchShoutOuts}
              />
            ))
          )}
        </div>
      </div>

      <CreateShoutOut
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={fetchShoutOuts}
      />
    </div>
  );
}
