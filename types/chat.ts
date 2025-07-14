import { Message, MessageReaction, MessageRead, User, Workspace } from "@prisma/client";

export interface ExtendedMessage extends Message {
  sender: User;
  replyTo?: ExtendedMessage | null;
  reactions: (MessageReaction & { user: User })[];
  readBy: (MessageRead & { user: User })[];
  _count?: {
    reactions: number;
    readBy: number;
  };
}

export interface ExtendedWorkspace extends Workspace {
  conversation?: {
    id: string;
    messages: ExtendedMessage[];
  } | null;
  subscribers: { user: User; userRole: string }[];
}

export interface ChatState {
  activeUsers: Map<string, { id: string; name: string; image?: string }>;
  typingUsers: Map<string, { userId: string; userName: string; conversationId: string }>;
  isConnected: boolean;
  currentConversationId: string | null;
}

export interface TypingIndicatorProps {
  conversationId: string;
  currentUserId: string;
}

export interface MessageInputProps {
  conversationId: string;
  replyTo?: ExtendedMessage | null;
  onCancelReply?: () => void;
}

export interface MessageListProps {
  messages: ExtendedMessage[];
  currentUserId: string;
  onReply: (message: ExtendedMessage) => void;
}

export interface MessageItemProps {
  message: ExtendedMessage;
  currentUserId: string;
  onReply: (message: ExtendedMessage) => void;
  isLastMessage?: boolean;
}

export interface ChatContainerProps {
  workspace: ExtendedWorkspace;
  currentUserId: string;
}
