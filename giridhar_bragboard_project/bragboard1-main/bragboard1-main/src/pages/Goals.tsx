import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, CheckCircle } from "lucide-react";

export default function Goals() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Goals</h2>
        <p className="text-muted-foreground">
          Set and track your professional goals
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-center">Recognition Goals</CardTitle>
            <CardDescription className="text-center">
              Set targets for giving and receiving recognition
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <TrendingUp className="w-8 h-8 text-secondary" />
            </div>
            <CardTitle className="text-center">Growth Objectives</CardTitle>
            <CardDescription className="text-center">
              Track your professional development
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <CheckCircle className="w-8 h-8 text-accent" />
            </div>
            <CardTitle className="text-center">Milestones</CardTitle>
            <CardDescription className="text-center">
              Celebrate completed goals and achievements
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
