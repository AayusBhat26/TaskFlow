"use client";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsVisible } from "@/hooks/useIsVisible";
import { ArrowRight, Sparkles, Zap, Users } from "lucide-react";

interface Props {
  title: string;
  desc: string;
}

export const ModernTextSection = ({ title, desc }: Props) => {
  const { isVisible, ref } = useIsVisible();
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={ref}
      className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-background via-secondary/5 to-background"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-br from-primary/15 to-accent/15 rounded-full blur-3xl animate-float"
          style={{ 
            top: '30%', 
            left: '20%',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-gradient-to-br from-accent/10 to-secondary/10 rounded-full blur-3xl animate-float"
          style={{ 
            bottom: '30%', 
            right: '20%',
            animationDelay: '2s',
            transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`
          }}
        />
        <div 
          className="absolute w-64 h-64 bg-gradient-to-br from-primary/8 to-primary/4 rounded-full blur-2xl animate-float"
          style={{ 
            top: '60%', 
            left: '60%',
            animationDelay: '4s',
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
          }}
        />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-white/[0.01] bg-grid-black/[0.01]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        {/* Badge */}
        <div className="inline-flex items-center mb-8">
          <Badge 
            variant="secondary" 
            className="px-6 py-3 text-sm font-medium bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20 hover:border-primary/40 transition-all duration-300 group cursor-pointer"
          >
            <Users className="w-4 h-4 mr-2 text-primary" />
            Team Collaboration
            <Sparkles className="w-4 h-4 ml-2 animate-pulse" />
          </Badge>
        </div>

        {/* Title with Creative Typography */}
        <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-8 relative">
          <span className="block mb-4">
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {title.split(' ').slice(0, -2).join(' ')}
            </span>
          </span>
          <span className="block">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              {title.split(' ').slice(-2).join(' ')}
            </span>
          </span>
          
          {/* Decorative elements */}
          <div className="absolute -top-4 left-1/4 w-6 h-6 bg-primary/20 rounded-full animate-float" />
          <div className="absolute -bottom-4 right-1/4 w-4 h-4 bg-accent/20 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        </h2>

        {/* Description */}
        <div className="max-w-4xl mx-auto mb-12">
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground leading-relaxed break-words">
            <span className="bg-gradient-to-r from-muted-foreground to-muted-foreground/80 bg-clip-text text-transparent">
              {desc}
            </span>
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Zap, text: "Instant Setup", desc: "Get started in seconds" },
            { icon: Users, text: "Team Sync", desc: "Real-time collaboration" },
            { icon: Sparkles, text: "Smart AI", desc: "Intelligent assistance" }
          ].map((feature, index) => (
            <div 
              key={index}
              className="group relative p-6 bg-card/30 backdrop-blur-sm border border-border/30 rounded-2xl hover:border-primary/30 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <div className="relative z-10 text-center">
                <feature.icon className="w-8 h-8 text-primary mb-3 mx-auto group-hover:scale-110 transition-transform duration-200" />
                <h3 className="font-semibold text-foreground mb-1">{feature.text}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="group bg-gradient-to-r from-primary via-primary/90 to-accent hover:from-primary/90 hover:via-primary/80 hover:to-accent/90 text-lg px-8 py-4 h-auto shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <Zap className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
            Experience the Magic
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="text-lg px-8 py-4 h-auto border-2 border-border/50 hover:border-primary/50 bg-card/30 backdrop-blur-sm hover:bg-primary/5 transition-all duration-300"
          >
            Learn More
          </Button>
        </div>

        {/* Stats or Social Proof */}
        <div className="mt-16 pt-8 border-t border-border/20">
          <div className="grid grid-cols-3 gap-8">
            {[
              { value: "10K+", label: "Happy Teams" },
              { value: "1M+", label: "Tasks Completed" },
              { value: "99.9%", label: "Uptime" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
