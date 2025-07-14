// Socket.io event type definitions

export interface User {
  id: string;
  name: string;
  image?: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  conversationId: string;
  createdAt: string;
  messageType: "TEXT" | "SYSTEM";
  replyToId?: string;
}

export interface Reaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  user: User;
}

export interface TypingUser {
  userId: string;
  userName: string;
  conversationId: string;
}

// Events sent from server to client
export interface ServerToClientEvents {
  // User presence events
  user_joined: (user: User) => void;
  user_left: (userId: string) => void;
  online_users: (users: User[]) => void;

  // Message events
  new_message: (message: Message) => void;
  message_received: (message: Message) => void;
  message_error: (data: { error: string }) => void;

  // Typing events
  user_typing: (data: TypingUser) => void;
  user_stopped_typing: (data: { userId: string; conversationId: string }) => void;

  // Reaction events
  reaction_added: (reaction: Reaction) => void;
  reaction_removed: (data: { messageId: string; emoji: string; userId: string }) => void;
  message_reaction: (data: {
    messageId: string;
    userId: string;
    emoji: string;
    action: "add" | "remove";
  }) => void;
}

// Events sent from client to server
export interface ClientToServerEvents {
  // Room management
  join_conversation: (conversationId: string) => void;
  leave_conversation: (conversationId: string) => void;

  // Message events
  send_message: (data: {
    conversationId: string;
    content: string;
    messageType?: "TEXT" | "SYSTEM";
    replyToId?: string;
  }) => void;

  // Typing events
  typing: (data: { conversationId: string }) => void;
  stop_typing: (data: { conversationId: string }) => void;

  // Reaction events
  add_reaction: (data: { messageId: string; emoji: string }) => void;
  remove_reaction: (data: { messageId: string; emoji: string }) => void;
}

// Socket data
export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId?: string;
  userName?: string;
  userImage?: string;
}
