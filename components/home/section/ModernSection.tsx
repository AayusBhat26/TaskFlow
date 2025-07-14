"use client";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ImagesCarousel } from "../carousel/ImagesCarousel";
import { HomePageImage } from "@/types/extended";
import { useIsVisible } from "@/hooks/useIsVisible";
import { ArrowRight, Sparkles, Star } from "lucide-react";

interface Props {
  reverse?: boolean;
  title: string;
  desc: string;
  images: HomePageImage[];
  id?: string;
}

export const ModernSection = ({ reverse, title, desc, images, id }: Props) => {
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
      id={id}
      ref={ref}
      className="relative py-20 lg:py-32 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl animate-float"
          style={{ 
            top: '20%', 
            left: reverse ? '70%' : '10%',
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-gradient-to-br from-accent/5 to-secondary/5 rounded-full blur-2xl animate-float"
          style={{ 
            bottom: '20%', 
            right: reverse ? '70%' : '10%',
            animationDelay: '2s',
            transform: `translate(${mousePosition.x * -0.008}px, ${mousePosition.y * -0.008}px)`
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
          reverse ? 'lg:grid-flow-col-dense' : ''
        }`}>
          
          {/* Content Side */}
          <div className={`space-y-8 ${reverse ? 'lg:col-start-2' : ''}`}>
            {/* Badge */}
            <div className="inline-flex">
              <Badge 
                variant="secondary" 
                className="px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 hover:border-primary/40 transition-all duration-300 group cursor-pointer"
              >
                <Star className="w-4 h-4 mr-2 text-primary" />
                Feature Spotlight
              </Badge>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {title.split(' ').slice(0, -1).join(' ')}
              </span>
              {title.split(' ').length > 1 && (
                <span className="block bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent animate-gradient">
                  {title.split(' ').slice(-1)}
                </span>
              )}
            </h2>

            {/* Description */}
            <div className="max-w-2xl">
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed break-words">
                {desc}
              </p>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                className="group border-2 border-primary/20 hover:border-primary/40 bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 transition-all duration-300"
              >
                Explore Feature
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                Learn More
              </Button>
            </div>
          </div>

          {/* Visual Side */}
          <div className={`relative ${reverse ? 'lg:col-start-1' : ''}`}>
            <Card className="relative bg-gradient-to-br from-card/60 to-card/30 backdrop-blur-xl border border-border/40 rounded-3xl p-6 shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-500">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              
              {/* Content */}
              <div className="relative z-10">
                <ImagesCarousel images={images} />
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary/20 rounded-full animate-float" />
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-accent/20 rounded-full animate-float" style={{ animationDelay: '1s' }} />
              
              {/* Interactive Elements */}
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="w-3 h-3 bg-green-400/60 rounded-full animate-pulse" />
                <div className="w-3 h-3 bg-yellow-400/60 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                <div className="w-3 h-3 bg-red-400/60 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
              </div>
            </Card>

            {/* Decorative Elements */}
            <div className="absolute -z-10 top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl animate-pulse" />
            <div className="absolute -z-10 bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-br from-accent/20 to-transparent rounded-full blur-xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          </div>
        </div>
      </div>

      {/* Section Transition */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
    </section>
  );
};
