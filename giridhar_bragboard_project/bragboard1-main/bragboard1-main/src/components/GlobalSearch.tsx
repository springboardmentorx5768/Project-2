import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

export default function GlobalSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const { data } = await supabase
      .from("shout_outs")
      .select(`
        *,
        sender:profiles!shout_outs_sender_id_fkey(name, avatar_url),
        recipients:shout_out_recipients(recipient:profiles!shout_out_recipients_recipient_id_fkey(name))
      `)
      .ilike("message", `%${query}%`)
      .order("created_at", { ascending: false })
      .limit(10);

    setSearchResults(data || []);
    setIsSearching(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Search className="h-4 w-4" />
          Search Shout-Outs
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search shout-outs..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {isSearching ? (
                <p className="text-center text-muted-foreground py-8">Searching...</p>
              ) : searchResults.length === 0 && searchQuery ? (
                <p className="text-center text-muted-foreground py-8">No results found</p>
              ) : (
                searchResults.map((shoutOut) => (
                  <div
                    key={shoutOut.id}
                    className="p-4 rounded-lg border bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={shoutOut.sender?.avatar_url} />
                        <AvatarFallback>{shoutOut.sender?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{shoutOut.sender?.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(shoutOut.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{shoutOut.message}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {shoutOut.recipients?.map((r: any, i: number) => (
                            <span key={i} className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
                              @{r.recipient?.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}