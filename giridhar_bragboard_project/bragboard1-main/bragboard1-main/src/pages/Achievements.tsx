import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Trophy, Star } from "lucide-react";

export default function Achievements() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Achievements</h2>
        <p className="text-muted-foreground">
          Track your accomplishments and milestones
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-center">Team Player</CardTitle>
            <CardDescription className="text-center">
              Received 10 shout-outs from colleagues
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <Trophy className="w-8 h-8 text-secondary" />
            </div>
            <CardTitle className="text-center">Recognition Champion</CardTitle>
            <CardDescription className="text-center">
              Given recognition to 20 team members
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <Star className="w-8 h-8 text-accent" />
            </div>
            <CardTitle className="text-center">Star Performer</CardTitle>
            <CardDescription className="text-center">
              Consistently recognized for excellence
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
