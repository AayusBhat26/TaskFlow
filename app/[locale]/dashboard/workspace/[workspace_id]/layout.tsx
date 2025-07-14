import { ReactNode } from "react";

interface WorkspaceLayoutProps {
  children: ReactNode;
  params: {
    workspace_id: string;
  };
}

export default function WorkspaceLayout({ children, params }: WorkspaceLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}
