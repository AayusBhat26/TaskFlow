import { Sidebar } from "@/components/sidebar/Sidebar";
import { ToggleSidebarProvider } from "@/context/ToggleSidebar";
import { UserActivityStatusProvider } from "@/context/UserActivityStatus";
import { UserEditableWorkspacesProvider } from "@/context/UserEditableWorkspaces";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <UserActivityStatusProvider>
      <UserEditableWorkspacesProvider>
        <ToggleSidebarProvider>
          <div className="flex h-screen w-full">
            <Sidebar />
            <div className="relative flex-grow flex flex-col overflow-y-auto">
              {children}
            </div>
          </div>
        </ToggleSidebarProvider>
      </UserEditableWorkspacesProvider>
    </UserActivityStatusProvider>
  );
};

export default DashboardLayout;
