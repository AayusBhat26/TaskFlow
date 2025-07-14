import { AddTaskShortcut } from "@/components/addTaskShortCut/AddTaskShortcut";
import { Calendar } from "@/components/calendar/Calendar";
import { DashboardHeader } from "@/components/header/DashboardHeader";
import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";

const AssignedToMe = async () => {
  const session = await checkIfUserCompletedOnboarding(
    "/dashboard/assigned-to-me"
  );

  return (
    <>
      <DashboardHeader>
        <AddTaskShortcut userId={session.user.id} />
      </DashboardHeader>
      <main className="h-full">
        <Calendar userId={session.user.id} />
      </main>
    </>
  );
};

export default AssignedToMe;
