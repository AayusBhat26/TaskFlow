"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote, Users } from "lucide-react";

const testimonials = [
  {
    name: "Aayush Bhat",
    role: "Product Manager",
    company: "Aayush Bhat",
    avatar: "/api/placeholder/64/64",
    content: "TaskFlow has completely transformed how our team collaborates. The mind mapping feature is a game-changer for brainstorming sessions, and the real-time updates keep everyone aligned.",
    rating: 5,
    featured: true
  },
  {
    name: "Aayush Bhat",
    role: "Team Lead",
    company: "Aayush Bhat",
    avatar: "/api/placeholder/64/64",
    content: "The Pomodoro timer integration with task management is brilliant. I've increased my productivity by 40% since switching to TaskFlow.",
    rating: 5,
    featured: false
  },
  {
    name: "Aayush Bhat",
    role: "Project Coordinator",
    company: "Aayush Bhat",
    avatar: "/api/placeholder/64/64",
    content: "Love how everything is connected - tasks, calendar, all in one place. No more switching between multiple apps!",
    rating: 5,
    featured: false
  },
  {
    name: "Aayush Bhat",
    role: "Software Engineer",
    company: "Aayush Bhat",
    avatar: "/api/placeholder/64/64",
    content: "The theme customization is amazing! I can work comfortably in any lighting condition. The midnight theme is my favorite.",
    rating: 5,
    featured: false
  },
  {
    name: "Aayush Bhat",
    role: "Operations Manager",
    company: "Global Enterprises",
    avatar: "/api/placeholder/64/64",
    content: "TaskFlow's analytics dashboard gives us incredible insights into team productivity. The role management system is also top-notch for our large team.",
    rating: 5,
    featured: true
  },
  {
    name: "Aayush Bhat",
    role: "Freelance Consultant",
    company: "Independent",
    avatar: "/api/placeholder/64/64",
    content: "As a solo freelancer, TaskFlow helps me stay organized and focused. The smart search feature saves me so much time finding information.",
    rating: 5,
    featured: false
  }
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 lg:py-32 bg-gradient-to-br from-secondary/5 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10">
            <Users className="w-4 h-4 mr-2" />
            Testimonials
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Loved by teams
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              around the world
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Join thousands of satisfied users who have transformed their productivity with TaskFlow
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {[
            { label: "Active Users", value: "50K+" },
            { label: "Tasks Completed", value: "2M+" },
            { label: "Teams", value: "5K+" },
            { label: "Countries", value: "120+" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className={`group relative bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                testimonial.featured ? 'lg:col-span-1 md:col-span-2 lg:row-span-1' : ''
              }`}
            >
              <CardContent className="p-6">
                {/* Quote Icon */}
                <div className="mb-4">
                  <Quote className="w-8 h-8 text-primary/20 rotate-180" />
                </div>

                {/* Content */}
                <blockquote className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.company}
                    </div>
                  </div>
                </div>

                {/* Featured Badge */}
                {testimonial.featured && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10 text-xs">
                      Featured
                    </Badge>
                  </div>
                )}

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Quote */}
        <div className="text-center mt-16">
          <div className="max-w-3xl mx-auto">
            <blockquote className="text-xl sm:text-2xl font-medium text-muted-foreground mb-4">
              "TaskFlow isn't just a productivity tool—it's a complete workflow transformation"
            </blockquote>
            <cite className="text-primary font-semibold">— The Productivity Report 2024</cite>
          </div>
        </div>
      </div>
    </section>
  );
}
