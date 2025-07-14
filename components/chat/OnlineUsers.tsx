"use client";

import React from "react";
import { Users } from "lucide-react";
import { useSocket } from "@/context/SocketProvider";

export const OnlineUsers: React.FC = () => {
  const { activeUsers } = useSocket();
  const onlineCount = activeUsers.size;

  return (
    <div className="flex items-center space-x-1 text-white/80">
      <Users className="h-4 w-4" />
      <span className="text-xs">{onlineCount}</span>
    </div>
  );
};
