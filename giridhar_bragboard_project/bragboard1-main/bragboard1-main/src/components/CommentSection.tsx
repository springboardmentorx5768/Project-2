import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Pencil, Reply } from "lucide-react";
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

interface CommentSectionProps {
  shoutOutId: string;
  comments: any[];
  currentUserId?: string;
  onUpdate: () => void;
}

export default function CommentSection({
  shoutOutId,
  comments,
  currentUserId,
  onUpdate,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAdmin } = useAdminCheck();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("comments").insert({
        shout_out_id: shoutOutId,
        user_id: currentUserId,
        content: newComment.trim(),
      });

      if (error) throw error;

      toast({
        title: "Comment added",
      });
      setNewComment("");
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyText.trim() || !currentUserId) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("comments").insert({
        shout_out_id: shoutOutId,
        user_id: currentUserId,
        content: replyText.trim(),
        parent_comment_id: parentId,
      });

      if (error) throw error;

      toast({
        title: "Reply added",
      });
      setReplyText("");
      setReplyTo(null);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase.from("comments").delete().eq("id", deleteId);

      if (error) throw error;

      toast({
        title: "Comment deleted",
      });
      setDeleteId(null);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (id: string) => {
    if (!editedContent.trim()) return;

    try {
      const { error } = await supabase
        .from("comments")
        .update({ content: editedContent.trim() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Comment updated",
      });
      setEditingId(null);
      setEditedContent("");
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

  // Separate parent comments and replies
  const parentComments = comments.filter((c) => !c.parent_comment_id);
  const getReplies = (parentId: string) => 
    comments.filter((c) => c.parent_comment_id === parentId);

  const renderComment = (comment: any, isReply = false) => {
    const isOwner = currentUserId === comment.user_id;
    const canDelete = isOwner || isAdmin;

    return (
      <div key={comment.id} className={isReply ? "ml-12 mt-3" : ""}>
        <div className="flex gap-3">
          <Avatar className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-br from-accent to-success flex-shrink-0`}>
            <AvatarFallback className="bg-accent text-accent-foreground text-xs">
              {getInitials(comment.user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold">{comment.user.name}</p>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>
              {editingId === comment.id ? (
                <div className="space-y-2 mt-2">
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[60px] text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEdit(comment.id)}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null);
                        setEditedContent("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm">{comment.content}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  className="h-7 text-xs gap-1 hover:text-primary"
                >
                  <Reply className="w-3 h-3" />
                  Reply
                </Button>
              )}
              {isOwner && !editingId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingId(comment.id);
                    setEditedContent(comment.content);
                  }}
                  className="h-7 text-xs gap-1 hover:text-accent"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteId(comment.id)}
                  className="h-7 text-xs gap-1 hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </Button>
              )}
            </div>
            {replyTo === comment.id && (
              <div className="mt-2 space-y-2">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[60px] text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleReply(comment.id)}
                    disabled={loading || !replyText.trim()}
                    className="bg-gradient-to-r from-primary to-secondary"
                  >
                    Post Reply
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReplyTo(null);
                      setReplyText("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Render nested replies */}
        {!isReply && getReplies(comment.id).map((reply) => renderComment(reply, true))}
      </div>
    );
  };

  return (
    <div className="w-full space-y-4 pt-4 border-t">
      <h4 className="font-semibold text-sm flex items-center gap-2">
        💬 Comments ({comments.length})
      </h4>

      {parentComments.length > 0 && (
        <div className="space-y-4">
          {parentComments.map((comment) => renderComment(comment))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px] resize-none"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={loading || !newComment.trim()}
            className="bg-gradient-to-r from-primary to-secondary"
          >
            {loading ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </form>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
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
    </div>
  );
}
