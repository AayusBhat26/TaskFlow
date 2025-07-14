import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import Image from "next/image";

interface Props {
  size?: number;
  className?: string;
  profileImage?: string | null;
}

export const UserAvatar = ({ className, profileImage, size = 16 }: Props) => {
  return (
    <div
      className={cn(
        "h-16 w-16 bg-muted rounded-full flex justify-center items-center text-muted-foreground relative overflow-hidden",
        className
      )}
    >
      {profileImage ? (
        <Image src={profileImage} fill alt="Profile Avatar" priority />
      ) : (
        <User size={size} />
      )}
    </div>
  );
};
