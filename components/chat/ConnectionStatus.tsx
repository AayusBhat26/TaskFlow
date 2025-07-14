"use client";

import React from "react";
import { useSocket } from "@/context/SocketProvider";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export const ConnectionStatus: React.FC = () => {
  const { isConnected } = useSocket();

  return (
    <div className={cn(
      "flex items-center space-x-1 px-2 py-1 rounded-full text-xs",
      isConnected 
        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    )}>
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          <span>Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span>Disconnected</span>
        </>
      )}
    </div>
  );
};
