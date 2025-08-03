import { AddTaskShortcut } from "@/components/addTaskShortCut/AddTaskShortcut";
import { DashboardHeader } from "@/components/header/DashboardHeader";
import { ExternalServicesClientWrapper } from "@/components/dashboard/ExternalServicesClientWrapper";
import { ExternalServicesPrompt } from "@/components/dashboard/ExternalServicesPrompt";
import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";
import { db } from "@/lib/db";

const ExternalServicesPage = async () => {
  const session = await checkIfUserCompletedOnboarding("/dashboard/external-services");

  // Check if user has configured external services
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

  const hasExternalServices = 
    user?.leetcodeUsername ||
    user?.codeforcesUsername ||
    user?.redditUsername ||
    user?.githubUsername ||
    (user?.emailIds && user.emailIds.length > 0);

  return (
    <>
      <DashboardHeader>
        <AddTaskShortcut userId={session.user.id} />
      </DashboardHeader>
      <main className="container mx-auto py-6 space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">External Services Dashboard</h1>
          <p className="text-muted-foreground">
            Track your progress and activity across all connected platforms.
          </p>
        </div>

        {/* Content */}
        {!hasExternalServices ? (
          <ExternalServicesPrompt />
        ) : (
          <ExternalServicesClientWrapper />
        )}
      </main>
    </>
  );
};

export default ExternalServicesPage;
