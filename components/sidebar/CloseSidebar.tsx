import { useToggleSidebar } from "@/context/ToggleSidebar";
import { Button } from "../ui/button";
import { PanelLeftClose } from "lucide-react";

export const CloseSidebar = () => {
  const { isOpen, setIsOpen } = useToggleSidebar();

  return (
    <Button
      onClick={() => {
        setIsOpen(false);
      }}
      className={`absolute right-[-2.5rem] top-10 z-10 rounded-tl-none lg:hidden ${
        !isOpen ? "hidden" : ""
      }`}
      size={"icon"}
      variant={"secondary"}
    >
      <PanelLeftClose />
    </Button>
  );
};
