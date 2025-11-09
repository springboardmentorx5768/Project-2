import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { X, Users, Upload, Image as ImageIcon, MessageCircle } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CreateShoutOutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateShoutOut({ open, onOpenChange, onSuccess }: CreateShoutOutProps) {
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, department")
        .order("name");

      if (error) throw error;
      setAllUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading users",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please write a message for your shout-out.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let imageUrl = null;

      // Upload image if one is selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('shout-outs')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('shout-outs')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { data: shoutOut, error: shoutOutError } = await supabase
        .from("shout_outs")
        .insert({
          sender_id: user.id,
          message: message.trim(),
          image_url: imageUrl,
        })
        .select()
        .single();

      if (shoutOutError) throw shoutOutError;

      if (recipients.length > 0) {
        const recipientInserts = recipients.map((recipient) => ({
          shout_out_id: shoutOut.id,
          recipient_id: recipient.id,
        }));

        const { error: recipientsError } = await supabase
          .from("shout_out_recipients")
          .insert(recipientInserts);

        if (recipientsError) throw recipientsError;
      }

      toast({
        title: "Shout-out posted!",
        description: "Your recognition has been shared with the team.",
      });

      setMessage("");
      setRecipients([]);
      setImageFile(null);
      setImagePreview(null);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error creating shout-out",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addRecipient = (user: any) => {
    if (!recipients.find((r) => r.id === user.id)) {
      setRecipients([...recipients, user]);
    }
    setPopoverOpen(false);
  };

  const removeRecipient = (userId: string) => {
    setRecipients(recipients.filter((r) => r.id !== userId));
  };

  const availableUsers = allUsers.filter((u) => !recipients.find((r) => r.id === u.id));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-background via-background to-primary/5 border-2 border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            ✨ Create a Shout-Out
          </DialogTitle>
          <DialogDescription className="text-base">
            Recognize someone's amazing work and share it with the team 🎉
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="recipients" className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" />
              Tag Team Members (Optional)
            </Label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal gap-2 border-2 border-dashed hover:border-primary/50 hover:bg-primary/5">
                  <Users className="w-4 h-4 text-primary" />
                  {recipients.length === 0 ? "🎯 Select people to recognize..." : "➕ Add more people..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[400px]" align="start">
                <Command>
                  <CommandInput placeholder="Search team members..." />
                  <CommandList>
                    <CommandEmpty>No team members found.</CommandEmpty>
                    <CommandGroup>
                      {availableUsers.map((user) => (
                        <CommandItem
                          key={user.id}
                          onSelect={() => addRecipient(user)}
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col">
                            <span>{user.name}</span>
                            <span className="text-xs text-muted-foreground">{user.department}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {recipients.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 p-3 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-lg border border-primary/20">
                {recipients.map((recipient) => (
                  <Badge key={recipient.id} className="gap-1 pr-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground border-0">
                    <span className="font-medium">{recipient.name}</span>
                    <button
                      type="button"
                      onClick={() => removeRecipient(recipient.id)}
                      className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-success" />
              Attach Image (Optional)
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-2 border-dashed hover:border-success/50 hover:bg-success/5"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 text-success" />
              📸 Upload Image
            </Button>
            {imagePreview && (
              <div className="relative mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-semibold flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-warning" />
              Your Message
            </Label>
            <Textarea
              id="message"
              placeholder="✍️ Share why this person or achievement deserves recognition..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] resize-none border-2 focus:border-primary/50 bg-background/50"
              required
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="hover:bg-destructive/10">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-opacity font-semibold">
              {loading ? "🚀 Posting..." : "🎉 Post Shout-Out"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
