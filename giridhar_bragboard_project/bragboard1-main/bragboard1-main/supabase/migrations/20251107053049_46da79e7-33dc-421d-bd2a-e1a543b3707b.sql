-- Add parent_comment_id for nested comments
ALTER TABLE public.comments
ADD COLUMN parent_comment_id uuid REFERENCES public.comments(id) ON DELETE CASCADE;

-- Create index for faster nested comment queries
CREATE INDEX idx_comments_parent_id ON public.comments(parent_comment_id);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.shout_outs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;