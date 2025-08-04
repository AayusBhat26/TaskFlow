import Welcoming from "@/components/common/Welcoming";
import { DashboardHeader } from "@/components/header/DashboardHeader";
import { HomeRecentActivityContainer } from "@/components/homeRecentActivity/HomeRecentActivityContainer";
import { ExternalServicesPrompt } from "@/components/dashboard/ExternalServicesPrompt";
import ExternalServicesDashboardWidget from "../../../components/dashboard/ExternalServicesDashboardWidget";
import { DSAProgressDashboard } from "@/components/dashboard/DSAProgressDashboard";
import GamingStatsWidget from "@/components/dashboard/GamingStatsWidget";
import { getInitialHomeRecentActivity } from "@/lib/api";
import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";
import { db } from "@/lib/db";

const Dashboard = async () => {
  const session = await checkIfUserCompletedOnboarding("/dashboard");

  const [initialRecentActivity, user] = await Promise.all([
    getInitialHomeRecentActivity(session.user.id),
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        codeforcesUsername: true,
        redditUsername: true,
        githubUsername: true,
        emailIds: true,
      },
    })
  ]);

  const hasExternalServices = 
    user?.codeforcesUsername ||
    user?.redditUsername ||
    user?.githubUsername ||
    (user?.emailIds && user.emailIds.length > 0);

  return (
    <>
      <DashboardHeader />
      <main className="h-full w-full">
        <Welcoming
          hideOnDesktop
          className="px-4 py-2"
          username={session.user.username!}
          name={session.user.name}
          surname={session.user.surname}
        />
        
        {/* External Services Section */}
        <div className="px-4 py-2">
          {!hasExternalServices ? (
            <ExternalServicesPrompt />
          ) : (
            <ExternalServicesDashboardWidget />
          )}
        </div>
        
        {/* DSA Progress Section */}
        <div className="px-4 py-2">
          <DSAProgressDashboard />
        </div>
        
        {/* Achievements Section */}
        <div className="px-4 py-2">
          <GamingStatsWidget />
        </div>
        
        <HomeRecentActivityContainer
          userId={session.user.id}
          initialData={initialRecentActivity ? initialRecentActivity : []}
        />
      </main>
    </>
  );
};

export default Dashboard;
