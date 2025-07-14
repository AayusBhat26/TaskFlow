"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, CheckCircle, Zap } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <Sparkles className="w-4 h-4 mr-2" />
            Limited Time Offer
          </Badge>

          {/* Main Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6">
            Ready to supercharge
            <span className="block bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
              your productivity?
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of teams who have already transformed their workflow with TaskFlow. 
            Start your free trial today—no credit card required.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {[
              "14-day free trial",
              "No credit card required",
              "Cancel anytime",
              "Full feature access"
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-lg px-8 py-4 h-auto shadow-xl hover:shadow-2xl transition-all duration-200 group"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-4 h-auto border-2 hover:bg-accent/50 transition-all duration-200"
            >
              Schedule Demo
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="border-t border-border/50 pt-8">
            <p className="text-sm text-muted-foreground mb-4">
              Trusted by teams at leading companies
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {["Microsoft", "Google", "Slack", "Notion", "Figma"].map((company, index) => (
                <div key={index} className="text-lg font-semibold text-muted-foreground">
                  {company}
                </div>
              ))}
            </div>
          </div>

          {/* Special Offer */}
          <div className="mt-12 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">Early Bird Special</span>
            </div>
            <p className="text-muted-foreground">
              Sign up in the next 24 hours and get 50% off your first year. 
              <span className="font-semibold text-foreground"> Use code: EARLY50</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
