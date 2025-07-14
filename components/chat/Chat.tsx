"use client";

import React from "react";
import { ChatContainer } from "./ChatContainer";
import { ExtendedWorkspace } from "@/types/chat";

interface ChatProps {
  workspace: ExtendedWorkspace;
}

export const Chat: React.FC<ChatProps> = ({ workspace }) => {
  return <ChatContainer workspace={workspace} />;
};

export default Chat;
