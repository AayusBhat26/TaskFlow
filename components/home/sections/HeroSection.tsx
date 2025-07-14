"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, Sparkles, Users, Zap, Target } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/20 rounded-full blur-2xl animate-float" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Announcement Badge */}
          <div className="inline-flex items-center mb-6">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <Sparkles className="w-4 h-4 mr-2" />
              Introducing TaskFlow v2.0
              <ArrowRight className="w-4 h-4 ml-2" />
            </Badge>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="block">Your Ultimate</span>
            <span className="block bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
              Productivity Hub
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
            Streamline your workflow with TaskFlow—the all-in-one workspace that brings together task management, 
            team collaboration, and productivity tools in one beautiful interface.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-lg px-8 py-3 h-auto shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-3 h-auto border-2 hover:bg-accent/50 transition-all duration-200"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {[
              { icon: Target, text: "Task Management" },
              { icon: Users, text: "Team Collaboration" },
              { icon: Zap, text: "Workflow Automation" },
            ].map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-full shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <feature.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Hero Visual */}
          <div className="relative max-w-5xl mx-auto">
            <div className="relative bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Dashboard Preview */}
                <div className="md:col-span-2 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 border border-border/30">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-3 bg-primary/20 rounded-full w-32"></div>
                      <div className="h-3 bg-accent/20 rounded-full w-16"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-muted/40 rounded w-full"></div>
                      <div className="h-2 bg-muted/40 rounded w-3/4"></div>
                      <div className="h-2 bg-muted/40 rounded w-1/2"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="h-16 bg-primary/10 rounded-lg"></div>
                      <div className="h-16 bg-accent/10 rounded-lg"></div>
                    </div>
                  </div>
                </div>
                
                {/* Side Panel */}
                <div className="bg-gradient-to-br from-accent/5 to-secondary/5 rounded-2xl p-6 border border-border/30">
                  <div className="space-y-3">
                    <div className="h-3 bg-accent/20 rounded-full w-24"></div>
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-8 bg-muted/30 rounded-lg"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary/20 rounded-full animate-float"></div>
            <div className="absolute -top-6 -right-6 w-6 h-6 bg-accent/20 rounded-full animate-float" style={{ animationDelay: "0.5s" }}></div>
            <div className="absolute -bottom-4 left-1/4 w-10 h-10 bg-secondary/20 rounded-full animate-float" style={{ animationDelay: "1s" }}></div>
          </div>

          {/* Social Proof */}
          <div className="mt-16 pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-6">Trusted by teams at</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {["Company A", "Company B", "Company C", "Company D"].map((company, index) => (
                <div key={index} className="text-lg font-semibold text-muted-foreground">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
