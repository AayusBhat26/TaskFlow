import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
  message_received: (message: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    senderImage?: string;
    conversationId: string;
    createdAt: string;
    messageType: "TEXT" | "SYSTEM";
    replyToId?: string;
    replyTo?: any;
  }) => void;
  user_joined: (user: { id: string; name: string; image?: string }) => void;
  user_left: (userId: string) => void;
  user_typing: (data: { userId: string; userName: string; conversationId: string }) => void;
  user_stopped_typing: (data: { userId: string; conversationId: string }) => void;
  message_reaction: (data: {
    messageId: string;
    userId: string;
    emoji: string;
    action: "add" | "remove";
  }) => void;
  online_users: (users: { id: string; name: string; image?: string }[]) => void;
}

interface ClientToServerEvents {
  join_conversation: (conversationId: string) => void;
  leave_conversation: (conversationId: string) => void;
  send_message: (data: {
    conversationId: string;
    content: string;
    messageType?: "TEXT" | "SYSTEM";
    replyToId?: string;
  }) => void;
  typing: (data: { conversationId: string }) => void;
  stop_typing: (data: { conversationId: string }) => void;
  add_reaction: (data: { messageId: string; emoji: string }) => void;
  remove_reaction: (data: { messageId: string; emoji: string }) => void;
}

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  process.env.NODE_ENV === "production" 
    ? process.env.NEXT_PUBLIC_SOCKET_URL || ""
    : "http://localhost:3002",
  {
    autoConnect: false,
    transports: ["websocket", "polling"],
    forceNew: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000,
  }
);

// Socket connection management with user authentication
export const connectSocket = (userId?: string, userName?: string, userImage?: string) => {
  if (!socket.connected) {
    // Set authentication query parameters
    socket.io.opts.query = {
      userId: userId || "",
      userName: userName || "",
      userImage: userImage || "",
    };
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;
