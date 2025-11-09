import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shoutOutsByDate, setShoutOutsByDate] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchShoutOuts();
  }, [currentDate]);

  const fetchShoutOuts = async () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);

    const { data } = await supabase
      .from("shout_outs")
      .select("created_at")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString());

    const counts: Record<string, number> = {};
    data?.forEach(item => {
      const date = format(new Date(item.created_at), "yyyy-MM-dd");
      counts[date] = (counts[date] || 0) + 1;
    });
    setShoutOutsByDate(counts);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-primary" />
          Activity Calendar
        </h2>
        <p className="text-muted-foreground">Track shout-outs over time</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {format(currentDate, "MMMM yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
            
            {daysInMonth.map(day => {
              const dateKey = format(day, "yyyy-MM-dd");
              const count = shoutOutsByDate[dateKey] || 0;
              
              return (
                <div
                  key={day.toISOString()}
                  className={`
                    aspect-square p-2 rounded-lg border text-center
                    ${!isSameMonth(day, currentDate) ? "opacity-30" : ""}
                    ${count > 0 ? "bg-primary/10 border-primary" : ""}
                    ${isSameDay(day, new Date()) ? "ring-2 ring-primary" : ""}
                  `}
                >
                  <div className="text-sm font-medium">{format(day, "d")}</div>
                  {count > 0 && (
                    <div className="text-xs text-primary font-semibold">{count}</div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
