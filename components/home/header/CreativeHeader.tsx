"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loadingState";
import { ArrowRight, Play, Sparkles, Users, Zap, Target, Star, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRouteLoading, RouteLoadingOverlay } from "@/hooks/useRouteLoading";

export const CreativeHeader = () => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);
  const router = useRouter();
  const { isLoading, startLoading } = useRouteLoading();

  const handleGetStarted = async () => {
    startLoading();
    try {
      // TODO: Check if user is already logged in
      // For now, redirect to sign-up page
      // In future: if (session) router.push('/dashboard') else router.push('/sign-up')
      router.push('/sign-up');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <header className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background/95 to-primary/5 dark:to-primary/10">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating orbs */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 dark:from-primary/30 dark:to-accent/30 rounded-full blur-3xl animate-float"
          style={{ 
            top: '10%', 
            left: '10%',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-gradient-to-br from-accent/15 to-secondary/15 dark:from-accent/25 dark:to-secondary/25 rounded-full blur-3xl animate-float"
          style={{ 
            top: '60%', 
            right: '15%',
            animationDelay: '2s',
            transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`
          }}
        />
        <div 
          className="absolute w-64 h-64 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-full blur-2xl animate-float"
          style={{ 
            bottom: '20%', 
            left: '20%',
            animationDelay: '4s',
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
          }}
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] dark:bg-grid-white/[0.05]" />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Announcement Badge */}
        <div className="inline-flex items-center mb-8 group">
          <Badge 
            variant="secondary" 
            className="px-6 py-3 text-sm font-medium bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 dark:from-primary/20 dark:via-accent/20 dark:to-primary/20 border-primary/20 hover:border-primary/40 transition-all duration-300 group-hover:scale-105 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
            ✨ Introducing TaskFlow 2.0 - Now with AI Magic
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </Badge>
        </div>

        {/* Main Hero Text with Creative Typography */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold tracking-tight mb-6 relative">
            <span className="block mb-4">
              <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Where
              </span>
              <span className="relative ml-4">
                <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent animate-gradient">
                  Ideas
                </span>
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400/20 rounded-full animate-ping" />
              </span>
            </span>
            <span className="block mb-4">
              <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Transform Into
              </span>
            </span>
            <span 
              className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Reality
              {isHovered && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 blur-2xl animate-pulse" />
              )}
            </span>
          </h1>

          {/* Subtitle with Animation */}
          <p className="max-w-3xl mx-auto text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-12 leading-relaxed">
            <span className="bg-gradient-to-r from-muted-foreground to-muted-foreground/80 bg-clip-text text-transparent">
              TaskFlow isn't just another productivity app—it's your creative command center. 
              Transform chaos into clarity with our revolutionary workflow system.
            </span>
          </p>
        </div>

        {/* Interactive CTA Section */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <Button 
            size="lg" 
            className="group relative bg-gradient-to-r from-primary via-primary/90 to-accent hover:from-primary/90 hover:via-primary/80 hover:to-accent/90 text-lg px-12 py-6 h-auto shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden disabled:opacity-50"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleGetStarted}
            disabled={isLoading}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            {isLoading ? (
              <>
                <LoadingState className="mr-3" />
                Getting Started...
              </>
            ) : (
              <>
                <Zap className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-200" />
                Start Your Journey
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-200" />
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="group text-lg px-12 py-6 h-auto border-2 border-border/50 hover:border-primary/50 bg-card/50 backdrop-blur-sm hover:bg-primary/5 transition-all duration-300"
            onClick={() => {
              // TODO: Add demo video modal or scroll to demo section
              window.scrollTo({ 
                top: document.body.scrollHeight, 
                behavior: 'smooth' 
              });
            }}
          >
            <Play className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-200" />
            Watch Magic Happen
          </Button>
        </div>

        {/* Feature Highlights with Creative Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {[
            { icon: Target, text: "AI-Powered Tasks", color: "from-blue-500/20 to-cyan-500/20" },
            { icon: Users, text: "Team Harmony", color: "from-green-500/20 to-emerald-500/20" },
            { icon: Zap, text: "Lightning Fast", color: "from-yellow-500/20 to-orange-500/20" },
            { icon: Globe, text: "Global Sync", color: "from-purple-500/20 to-pink-500/20" }
          ].map((feature, index) => (
            <div 
              key={index}
              className="group relative p-6 bg-card/30 backdrop-blur-sm border border-border/30 rounded-2xl hover:border-primary/30 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
              <div className="relative z-10">
                <feature.icon className="w-8 h-8 text-primary mb-3 mx-auto group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm font-medium text-center block">{feature.text}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Demo Preview */}
        <div className="relative max-w-6xl mx-auto">
          <div className="relative bg-gradient-to-br from-card/60 to-card/30 backdrop-blur-xl border border-border/40 rounded-3xl p-8 shadow-2xl overflow-hidden group">
            {/* Demo Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Dashboard */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Live Dashboard</span>
                  </div>
                  <div className="flex gap-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-3 h-3 bg-primary/20 rounded-full" />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-border/20">
                      <div className="w-6 h-6 bg-primary/20 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-foreground/10 rounded-full w-3/4" />
                        <div className="h-2 bg-foreground/5 rounded-full w-1/2" />
                      </div>
                      <div className="w-12 h-6 bg-green-400/20 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Side Panel */}
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-br from-accent/10 to-secondary/10 rounded-2xl border border-border/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">Quick Actions</span>
                  </div>
                  <div className="space-y-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-8 bg-card/50 rounded-lg border border-border/10" />
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Zap className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm font-medium">AI Assistant Ready</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="w-8 h-8 bg-primary/20 rounded-full animate-pulse" />
              <div className="w-8 h-8 bg-accent/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>

            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>

          {/* Floating Elements */}
          <div className="absolute -top-6 -left-6 w-12 h-12 bg-primary/10 rounded-full animate-float" />
          <div className="absolute -top-8 -right-8 w-8 h-8 bg-accent/10 rounded-full animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-6 left-1/4 w-10 h-10 bg-secondary/10 rounded-full animate-float" style={{ animationDelay: '2s' }} />
        </div>

        {/* Social Proof with Animation */}
        <div className="mt-20 pt-12 border-t border-border/20">
          <p className="text-sm text-muted-foreground mb-8 flex items-center justify-center gap-2">
            <span>Trusted by innovators worldwide</span>
            <Globe className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            {["TechCorp", "InnovateLab", "FutureWorks", "DigitalFlow", "CreativeSpace"].map((company, index) => (
              <div 
                key={index} 
                className="text-xl font-bold text-muted-foreground hover:text-primary transition-colors duration-200 cursor-pointer hover:scale-105 transform"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Route Loading Overlay */}
      <RouteLoadingOverlay isVisible={isLoading} />
    </header>
  );
};
