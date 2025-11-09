import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, HandMetal, Star, MessageCircle, Trash2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import CommentSection from "./CommentSection";
import ReportDialog from "./ReportDialog";
import BookmarkButton from "./BookmarkButton";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ShoutOutCardProps {
  shoutOut: any;
  currentUserId?: string;
  onUpdate: () => void;
}

const REACTION_ICONS: Record<string, { icon: any; emoji: string }> = {
  like: { icon: ThumbsUp, emoji: "👍" },
  clap: { icon: null, emoji: "👏" },
  star: { icon: Star, emoji: "⭐" },
};

export default function ShoutOutCard({ shoutOut, currentUserId, onUpdate }: ShoutOutCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editedMessage, setEditedMessage] = useState(shoutOut.message);
  const { toast } = useToast();
  const { isAdmin } = useAdminCheck();
  const navigate = useNavigate();

  const getReactionCount = (type: string) => {
    return shoutOut.reactions?.filter((r: any) => r.type === type).length || 0;
  };

  const hasUserReacted = (type: string) => {
    return shoutOut.reactions?.some((r: any) => r.type === type && r.user_id === currentUserId) || false;
  };

  const getUserReactionType = () => {
    const userReaction = shoutOut.reactions?.find((r: any) => r.user_id === currentUserId);
    return userReaction?.type || null;
  };

  const handleReaction = async (type: string) => {
    if (!currentUserId) return;

    try {
      const currentReactionType = getUserReactionType();

      // If user already has this reaction, remove it
      if (currentReactionType === type) {
        const reaction = shoutOut.reactions.find(
          (r: any) => r.type === type && r.user_id === currentUserId
        );
        await supabase.from("reactions").delete().eq("id", reaction.id);
      } else {
        // Remove any existing reaction first (one reaction per user)
        if (currentReactionType) {
          const existingReaction = shoutOut.reactions.find(
            (r: any) => r.user_id === currentUserId
          );
          await supabase.from("reactions").delete().eq("id", existingReaction.id);
        }
        
        // Add the new reaction
        await supabase.from("reactions").insert([{
          shout_out_id: shoutOut.id,
          user_id: currentUserId,
          type: type as "like" | "clap" | "star",
        }]);
      }

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("shout_outs")
        .delete()
        .eq("id", shoutOut.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shout-out deleted successfully",
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    try {
      const { error } = await supabase
        .from("shout_outs")
        .update({ message: editedMessage })
        .eq("id", shoutOut.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shout-out updated successfully",
      });
      setShowEditDialog(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const isOwner = currentUserId === shoutOut.sender_id;
  const canDelete = isOwner || isAdmin;

  return (
    <>
      <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar 
                className="w-12 h-12 bg-gradient-to-br from-primary to-secondary cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                onClick={() => navigate(`/profile/${shoutOut.sender.id}`)}
              >
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {getInitials(shoutOut.sender.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{shoutOut.sender.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs bg-gradient-to-r from-secondary/20 to-accent/20 border-secondary/30">
                    {shoutOut.sender.department}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(shoutOut.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditDialog(true)}
                  className="hover:bg-accent/10"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              {!isOwner && (
                <ReportDialog shoutOutId={shoutOut.id} currentUserId={currentUserId} />
              )}
            </div>
          </div>
        </CardHeader>

      <CardContent className="space-y-4">
        {shoutOut.image_url && (
          <div className="rounded-lg overflow-hidden">
            <img
              src={shoutOut.image_url}
              alt="Shout-out attachment"
              className="w-full h-auto max-h-96 object-cover"
            />
          </div>
        )}

        <p className="text-foreground leading-relaxed">{shoutOut.message}</p>

        {shoutOut.recipients && shoutOut.recipients.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Shout-out to:</span>
            {shoutOut.recipients.map((r: any) => (
              <Badge key={r.recipient.id} variant="outline" className="gap-1 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/30">
                <Avatar className="w-4 h-4 bg-gradient-to-br from-accent to-success">
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                    {getInitials(r.recipient.name)}
                  </AvatarFallback>
                </Avatar>
                {r.recipient.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-col items-start gap-4 border-t pt-4">
        <div className="flex items-center gap-2 w-full">
          {Object.entries(REACTION_ICONS).map(([type, { emoji }]) => {
            const count = getReactionCount(type);
            const isActive = hasUserReacted(type);

            return (
              <Button
                key={type}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleReaction(type)}
                className={`gap-2 transition-all ${isActive ? "bg-gradient-to-r from-primary to-secondary scale-110" : "hover:border-primary/50 hover:scale-105"}`}
              >
                <span className="text-lg">{emoji}</span>
                {count > 0 && (
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-background/80">
                    {count}
                  </span>
                )}
              </Button>
             );
           })}
           <BookmarkButton shoutOutId={shoutOut.id} userId={currentUserId!} />
           <Button
             variant="outline"
             size="sm"
             onClick={() => setShowComments(!showComments)}
             className="gap-2 ml-auto"
           >
             <MessageCircle className="w-4 h-4" />
             {shoutOut.comments?.length > 0 && (
               <span className="text-xs">{shoutOut.comments.length}</span>
             )}
           </Button>
         </div>

        {showComments && (
          <CommentSection
            shoutOutId={shoutOut.id}
            comments={shoutOut.comments || []}
            currentUserId={currentUserId}
            onUpdate={onUpdate}
          />
        )}
      </CardFooter>
    </Card>

    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Shout-out</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this shout-out? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Shout-out</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={editedMessage}
            onChange={(e) => setEditedMessage(e.target.value)}
            className="min-h-[100px]"
            placeholder="Edit your message..."
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} className="bg-gradient-to-r from-primary to-secondary">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
