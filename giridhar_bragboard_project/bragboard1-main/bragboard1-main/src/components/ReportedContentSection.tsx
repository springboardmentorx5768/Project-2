import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle, Flag, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ReportedContentSectionProps {
  reports: any[];
  onReportsUpdate: () => void;
}

export default function ReportedContentSection({ reports, onReportsUpdate }: ReportedContentSectionProps) {
  const { toast } = useToast();
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const handleResolveReport = async (reportId: string, status: "resolved" | "dismissed") => {
    setResolvingId(reportId);
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
      
      await onReportsUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResolvingId(null);
    }
  };

  const handleDeleteShoutOut = async (shoutOutId: string, reportId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("shout_outs")
        .delete()
        .eq("id", shoutOutId);

      if (deleteError) throw deleteError;

      // Auto-resolve the report
      await handleResolveReport(reportId, "resolved");

      toast({
        title: "Success",
        description: "Shout-out deleted and report resolved",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const pendingReports = reports.filter(r => r.status === "pending");

  return (
    <div className="space-y-4">
      {pendingReports.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Flag className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No reports to review</p>
          <p className="text-sm mt-1">All caught up! 🎉</p>
        </div>
      ) : (
        pendingReports.map((report) => (
          <Card key={report.id} className="border-red-200 dark:border-red-900">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={report.reporter?.avatar_url} />
                  <AvatarFallback className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                    {report.reporter?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        Reported by <span className="text-foreground">{report.reporter?.name}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge variant="destructive" className="gap-1">
                      <Flag className="h-3 w-3" />
                      {report.status}
                    </Badge>
                  </div>

                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                      Reason for report:
                    </p>
                    <p className="text-sm text-red-800 dark:text-red-200">{report.reason}</p>
                  </div>

                  {report.shout_out && (
                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {report.shout_out.sender?.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium">{report.shout_out.sender?.name}</p>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {report.shout_out.message}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleResolveReport(report.id, "dismissed")}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      disabled={resolvingId === report.id}
                    >
                      <XCircle className="h-4 w-4" />
                      Dismiss Report
                    </Button>
                    
                    <Button
                      onClick={() => handleResolveReport(report.id, "resolved")}
                      variant="outline"
                      size="sm"
                      className="gap-2 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-900 dark:text-green-300 dark:hover:bg-green-950/20"
                      disabled={resolvingId === report.id}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark as Resolved
                    </Button>

                    {report.shout_out_id && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-2 ml-auto"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Shout-Out
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Reported Content?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the shout-out and automatically resolve this report. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteShoutOut(report.shout_out_id, report.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
