import { AddTaskShortcut } from "@/components/addTaskShortCut/AddTaskShortcut";
import { DashboardHeader } from "@/components/header/DashboardHeader";
import { ExternalServicesSettings } from "@/components/settings/ExternalServicesSettings";
import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";
import { db } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ExternalServicesPage = async () => {
  const session = await checkIfUserCompletedOnboarding("/dashboard/settings/external-services");

  // Fetch user's external service data
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      leetcodeUsername: true,
      codeforcesUsername: true,
      redditUsername: true,
      githubUsername: true,
      emailIds: true,
    },
  });

  return (
    <>
      <DashboardHeader>
        <AddTaskShortcut userId={session.user.id} />
      </DashboardHeader>
      <main className="container mx-auto py-6 space-y-6">
        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Settings
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">External Service Integrations</h1>
          <p className="text-muted-foreground">
            Connect your external accounts to unlock personalized insights and track your progress across platforms.
          </p>
        </div>

        {/* External Services Settings */}
        <ExternalServicesSettings 
          initialData={{
            leetcodeUsername: user?.leetcodeUsername,
            codeforcesUsername: user?.codeforcesUsername,
            redditUsername: user?.redditUsername,
            githubUsername: user?.githubUsername,
            emailIds: user?.emailIds || [],
          }}
        />
      </main>
    </>
  );
};

export default ExternalServicesPage;
