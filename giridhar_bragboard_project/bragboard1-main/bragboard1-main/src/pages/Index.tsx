import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Target, MessageSquare } from "lucide-react";
import heroImage from "@/assets/hero-celebration.jpg";
import recognitionImage from "@/assets/recognition-illustration.jpg";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            BragBoard
          </h1>
          <Button onClick={() => navigate("/auth")} className="bg-gradient-to-r from-primary to-secondary hover:shadow-glow">
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Team celebration" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/80 to-background/90" />
        </div>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-fade-in">
            Celebrate Team Success
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            BragBoard helps teams recognize achievements, share victories, and build a culture of appreciation.
          </p>
          <Button 
            onClick={() => navigate("/auth")} 
            size="lg" 
            className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:shadow-glow transition-all duration-300 hover:scale-105"
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gradient-to-br from-muted/30 to-accent/5">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 mb-16">
            <div className="lg:w-1/2">
              <img 
                src={recognitionImage} 
                alt="Team recognition" 
                className="rounded-2xl shadow-elegant hover:shadow-glow transition-all duration-300"
              />
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Why BragBoard?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Transform your workplace culture with meaningful recognition and celebration. BragBoard makes it easy to acknowledge great work and build stronger teams.
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:shadow-elegant hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <Trophy className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Achievements</h3>
              <p className="text-muted-foreground">Monitor your team's milestones and celebrate every win.</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 hover:shadow-elegant hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-secondary to-secondary-glow flex items-center justify-center">
                <Users className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Team Recognition</h3>
              <p className="text-muted-foreground">Give shout-outs to colleagues who deserve recognition.</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 hover:shadow-elegant hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent to-accent-glow flex items-center justify-center">
                <Target className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Set Goals</h3>
              <p className="text-muted-foreground">Define and track team goals to stay aligned.</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20 hover:shadow-elegant hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-success to-chart-4 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-success-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Engage & Connect</h3>
              <p className="text-muted-foreground">Foster communication and build stronger relationships.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">Join teams already celebrating success with BragBoard.</p>
          <Button 
            onClick={() => navigate("/auth")} 
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary hover:shadow-glow transition-all duration-300 hover:scale-105"
          >
            Sign Up Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>© 2025 BragBoard. Built with appreciation.</p>
        </div>
      </footer>
    </div>
  );
}
