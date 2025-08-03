import { AddTaskShortcut } from "@/components/addTaskShortCut/AddTaskShortcut";
import { DashboardHeader } from "@/components/header/DashboardHeader";
import { AccountInfo } from "@/components/settings/account/AccountInfo";
import { DeleteAccount } from "@/components/settings/account/DeleteAccount";
import { ExternalServicesSettings } from "@/components/settings/ExternalServicesSettings";
import { Heading } from "@/components/settings/account/Heading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";
import { db } from "@/lib/db";
import Link from "next/link";

const Settings = async () => {
  const session = await checkIfUserCompletedOnboarding("/dashboard/settings");

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
      <main>
        <Heading />
        <AccountInfo session={session} />
        
        <div className="p-4 sm:p-6">
          <Separator />
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">External Service Integrations</h2>
                <p className="text-sm text-muted-foreground">
                  Connect your external accounts to track progress and get insights.
                </p>
              </div>
              <Link href="/dashboard/settings/external-services">
                <Button variant="outline" size="sm">
                  Manage All
                </Button>
              </Link>
            </div>
            <ExternalServicesSettings 
              initialData={{
                leetcodeUsername: user?.leetcodeUsername,
                codeforcesUsername: user?.codeforcesUsername,
                redditUsername: user?.redditUsername,
                githubUsername: user?.githubUsername,
                emailIds: user?.emailIds || [],
              }}
            />
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          <Separator />
        </div>
        
        <DeleteAccount userEmail={session.user.email!} />
      </main>
    </>
  );
};

export default Settings;
