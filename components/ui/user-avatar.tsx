import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import Image from "next/image";

interface Props {
  size?: number;
  className?: string;
  profileImage?: string | null;
  fallbackText?: string;
}

export const UserAvatar = ({ 
  className, 
  profileImage, 
  size = 16, 
  fallbackText 
}: Props) => {
  return (
    <div
      className={cn(
        "h-16 w-16 bg-muted rounded-full flex justify-center items-center text-muted-foreground relative overflow-hidden",
        className
      )}
    >
      {profileImage ? (
        <Image src={profileImage} fill alt="Profile Avatar" priority />
      ) : fallbackText ? (
        <span className="text-sm font-medium text-primary-foreground bg-primary w-full h-full flex items-center justify-center rounded-full">
          {fallbackText}
        </span>
      ) : (
        <User size={size} />
      )}
    </div>
  );
};
