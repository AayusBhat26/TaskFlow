import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export const VideoContainer = ({ className }: Props) => {
  return (
    <div
      className={cn(
        `w-full h-full bg-secondary rounded-3xl border border-border`,
        className
      )}
    ></div>
  );
};
