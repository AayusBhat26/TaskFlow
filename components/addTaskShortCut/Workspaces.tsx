import { Workspace } from "@prisma/client";
import { ScrollArea } from "../ui/scroll-area";
import { SelectWorkspace } from "./SelectWorkspace";

interface Props {
  workspaces?: Workspace[];
  onSelectActiveWorkspace: (workspace: Workspace) => void;
}

export const Workspaces = ({ workspaces, onSelectActiveWorkspace }: Props) => {
  return (
    <ScrollArea className="w-full max-h-64 sm:max-h-72 bg-background/70 border border-border p-4 rounded-md shadow-sm">
      <div className="w-full h-full flex flex-col">
        {workspaces &&
          workspaces.map((workspace) => (
            <SelectWorkspace
              key={workspace.id}
              workspace={workspace}
              onSelectActiveWorkspace={onSelectActiveWorkspace}
            />
          ))}
      </div>
    </ScrollArea>
  );
};
