"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  CheckSquare, 
  Users, 
  Timer, 
  MessageSquare, 
  Calendar,
  Search,
  Zap,
  Target,
  Workflow,
  Shield,
  BarChart3
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Mind Maps",
    description: "Visualize complex ideas with our intuitive mind mapping tool. Create stunning visual representations of your projects and brainstorming sessions.",
    badge: "Visual",
    gradient: "from-purple-500/20 to-pink-500/20"
  },
  {
    icon: CheckSquare,
    title: "Smart Tasks",
    description: "Organize your work with intelligent task management. Auto-save, deadlines, categories, and seamless calendar integration.",
    badge: "Productivity",
    gradient: "from-blue-500/20 to-cyan-500/20"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work together seamlessly with role-based permissions, real-time updates, and effortless project sharing.",
    badge: "Teamwork",
    gradient: "from-green-500/20 to-emerald-500/20"
  },
  {
    icon: Timer,
    title: "Pomodoro Timer",
    description: "Boost focus with our built-in Pomodoro timer. Customize session lengths, breaks, and get productivity insights.",
    badge: "Focus",
    gradient: "from-orange-500/20 to-red-500/20"
  },
  {
    icon: Calendar,
    title: "Unified Calendar",
    description: "See all your tasks and deadlines in one beautiful calendar view. Never miss an important deadline again.",
    badge: "Organization",
    gradient: "from-teal-500/20 to-blue-500/20"
  },
  {
    icon: Search,
    title: "Smart Search",
    description: "Find anything instantly with our powerful search and filtering system. Tag, star, and organize for quick access.",
    badge: "Efficiency",
    gradient: "from-yellow-500/20 to-orange-500/20"
  },
  {
    icon: Shield,
    title: "Advanced Security",
    description: "Keep your data safe with enterprise-grade security, role management, and privacy controls.",
    badge: "Security",
    gradient: "from-indigo-500/20 to-blue-500/20"
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track your productivity with detailed analytics, insights, and performance metrics.",
    badge: "Insights",
    gradient: "from-pink-500/20 to-rose-500/20"
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32 bg-gradient-to-br from-background to-secondary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10">
            <Zap className="w-4 h-4 mr-2" />
            Powerful Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Everything you need to
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              maximize productivity
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            TaskFlow combines the best productivity tools into one seamless experience. 
            From task management to team collaboration, we've got you covered.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group relative bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} group-hover:scale-110 transition-transform duration-200`}>
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors duration-200">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full border border-primary/20">
            <Target className="w-5 h-5 text-primary" />
            <span className="font-medium">And many more features coming soon...</span>
          </div>
        </div>
      </div>
    </section>
  );
}
