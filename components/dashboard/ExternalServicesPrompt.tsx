"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalServicesSettings } from "@/components/settings/ExternalServicesSettings";
import { 
  Github, 
  Code, 
  MessageCircle, 
  Mail, 
  Plus, 
  ChevronRight,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

interface ExternalServicesData {
  leetcodeUsername?: string | null;
  codeforcesUsername?: string | null;
  redditUsername?: string | null;
  githubUsername?: string | null;
  emailIds?: string[];
}

export const ExternalServicesPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);

  const { data: externalServices, isLoading } = useQuery({
    queryKey: ["external-services"],
    queryFn: async () => {
      const response = await axios.get("/api/profile/external-services");
      return response.data as ExternalServicesData;
    },
  });

  useEffect(() => {
    if (externalServices) {
      // Check if user has provided any external service data
      const hasAnyService = Boolean(
        externalServices.leetcodeUsername ||
        externalServices.codeforcesUsername ||
        externalServices.redditUsername ||
        externalServices.githubUsername ||
        (externalServices.emailIds && externalServices.emailIds.length > 0)
      );

      // Show prompt if no services are configured
      setShowPrompt(!hasAnyService);
    }
  }, [externalServices]);

  const getConnectedServicesCount = () => {
    if (!externalServices) return 0;
    
    let count = 0;
    if (externalServices.leetcodeUsername) count++;
    if (externalServices.codeforcesUsername) count++;
    if (externalServices.redditUsername) count++;
    if (externalServices.githubUsername) count++;
    if (externalServices.emailIds && externalServices.emailIds.length > 0) count++;
    
    return count;
  };

  const totalServices = 5; // LeetCode, Codeforces, GitHub, Reddit, Email
  const connectedCount = getConnectedServicesCount();

  if (isLoading) {
    return null; // Or a loading skeleton
  }

  if (!showPrompt && connectedCount === totalServices) {
    return null; // User has everything set up
  }

  return (
    <Card className="w-full border-primary/20 bg-gradient-to-r from-card to-card">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Complete Your Profile Setup</CardTitle>
              <CardDescription className="mt-1">
                Connect your external accounts to unlock personalized insights and track your progress across platforms.
              </CardDescription>
            </div>
          </div>
          {!showPrompt && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPrompt(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={connectedCount === totalServices ? "default" : "secondary"}>
                {connectedCount === totalServices ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <AlertCircle className="w-3 h-3 mr-1" />
                )}
                {connectedCount}/{totalServices} Services Connected
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalServices }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < connectedCount ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Services Preview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className={`flex items-center gap-2 p-2 rounded-lg border ${
              externalServices?.leetcodeUsername ? "bg-primary/10 border-primary/20" : "bg-muted/50"
            }`}>
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span className="text-xs font-medium">LeetCode</span>
              {externalServices?.leetcodeUsername && <CheckCircle className="w-3 h-3 text-accent-foreground ml-auto" />}
            </div>
            
            <div className={`flex items-center gap-2 p-2 rounded-lg border ${
              externalServices?.codeforcesUsername ? "bg-accent/20 border-accent/30" : "bg-muted/50"
            }`}>
              <div className="w-3 h-3 bg-accent rounded"></div>
              <span className="text-xs font-medium">Codeforces</span>
              {externalServices?.codeforcesUsername && <CheckCircle className="w-3 h-3 text-accent-foreground ml-auto" />}
            </div>
            
            <div className={`flex items-center gap-2 p-2 rounded-lg border ${
              externalServices?.githubUsername ? "bg-secondary/50 border-secondary" : "bg-muted/50"
            }`}>
              <Github className="w-3 h-3" />
              <span className="text-xs font-medium">GitHub</span>
              {externalServices?.githubUsername && <CheckCircle className="w-3 h-3 text-accent-foreground ml-auto" />}
            </div>
            
            <div className={`flex items-center gap-2 p-2 rounded-lg border ${
              externalServices?.redditUsername ? "bg-destructive/10 border-destructive/20" : "bg-muted/50"
            }`}>
              <div className="w-3 h-3 bg-destructive rounded-full"></div>
              <span className="text-xs font-medium">Reddit</span>
              {externalServices?.redditUsername && <CheckCircle className="w-3 h-3 text-accent-foreground ml-auto" />}
            </div>
            
            <div className={`flex items-center gap-2 p-2 rounded-lg border ${
              externalServices?.emailIds && externalServices.emailIds.length > 0 ? "bg-secondary/50 border-secondary" : "bg-muted/50"
            }`}>
              <Mail className="w-3 h-3" />
              <span className="text-xs font-medium">Email</span>
              {externalServices?.emailIds && externalServices.emailIds.length > 0 && (
                <CheckCircle className="w-3 h-3 text-accent-foreground ml-auto" />
              )}
            </div>
          </div>

          {/* Action Button */}
          <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" variant={connectedCount === totalServices ? "outline" : "default"}>
                {connectedCount === totalServices ? "Manage Connections" : "Set Up Connections"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>External Service Integrations</DialogTitle>
              </DialogHeader>
              <ExternalServicesSettings 
                initialData={externalServices || {}} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
