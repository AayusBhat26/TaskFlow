import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const port = parseInt(process.env.SOCKET_PORT || "3001", 10);
const hostname = process.env.HOSTNAME || "localhost";

// Initialize Prisma
const prisma = new PrismaClient();

// Enable CORS for all routes
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? process.env.NEXT_PUBLIC_APP_URL 
    : ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
}));

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Socket.io server is running', 
    port, 
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

const server = createServer(app);

// Socket.io setup
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.NODE_ENV === "production" 
      ? process.env.NEXT_PUBLIC_APP_URL 
      : ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Connected users and room management
interface ConnectedUser {
  id: string;
  name: string;
  image?: string;
  socketId: string;
}

interface RoomUsers {
  [conversationId: string]: Map<string, ConnectedUser>;
}

interface TypingUsers {
  [conversationId: string]: Map<string, { userId: string; userName: string }>;
}

const connectedUsers = new Map<string, ConnectedUser>();
const roomUsers: RoomUsers = {};
const typingUsers: TypingUsers = {};

// Initialize room and typing user maps
const getOrCreateRoom = (conversationId: string) => {
  if (!roomUsers[conversationId]) {
    roomUsers[conversationId] = new Map();
  }
  return roomUsers[conversationId];
};

const getOrCreateTypingUsers = (conversationId: string) => {
  if (!typingUsers[conversationId]) {
    typingUsers[conversationId] = new Map();
  }
  return typingUsers[conversationId];
};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

    socket.on("join_conversation", async (conversationId: string) => {
      try {
        socket.join(conversationId);
        
        // Initialize room users if not exists
        if (!roomUsers[conversationId]) {
          roomUsers[conversationId] = new Map();
        }

        // Get user info from headers or authentication
        const userId = socket.handshake.query.userId as string;
        const userName = socket.handshake.query.userName as string;
        const userImage = socket.handshake.query.userImage as string;

        if (userId && userName) {
          const user: ConnectedUser = {
            id: userId,
            name: userName,
            image: userImage,
            socketId: socket.id,
          };

          connectedUsers.set(socket.id, user);
          roomUsers[conversationId].set(userId, user);

          // Notify others in the room
          socket.to(conversationId).emit("user_joined", {
            id: userId,
            name: userName,
            image: userImage,
          });

          // Send current online users to the new user
          const currentUsers = Array.from(roomUsers[conversationId].values())
            .map((user, idx) => ({ id: user.id, name: user.name, image: user.image, _mapIndex: idx }));
          socket.emit("online_users", currentUsers);
        }

        console.log(`User ${userId} joined conversation ${conversationId}`);
      } catch (error) {
        console.error("Error joining conversation:", error);
      }
    });

    socket.on("leave_conversation", (conversationId: string) => {
      socket.leave(conversationId);
      
      const user = connectedUsers.get(socket.id);
      if (user && roomUsers[conversationId]) {
        roomUsers[conversationId].delete(user.id);
        socket.to(conversationId).emit("user_left", user.id);
        
        // Clean up typing if user was typing
        if (typingUsers[conversationId]) {
          typingUsers[conversationId].delete(user.id);
          socket.to(conversationId).emit("user_stopped_typing", {
            userId: user.id,
            conversationId,
          });
        }
      }

      console.log(`User left conversation ${conversationId}`);
    });

    socket.on("send_message", async (data) => {
      try {
        const { conversationId, content, messageType = "TEXT", replyToId, id, senderId, senderName, senderImage, createdAt } = data;
        
        console.log('Broadcasting message:', data);
        
        // Broadcast message to all users in the conversation including sender
        io.to(conversationId).emit("message_received", {
          id: id || `temp-${Date.now()}`,
          content,
          senderId: senderId || '',
          senderName: senderName || '',
          senderImage: senderImage || '',
          conversationId,
          createdAt: createdAt || new Date().toISOString(),
          messageType,
          replyToId,
        });

        console.log(`Message broadcasted to conversation ${conversationId}`);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    socket.on("typing", ({ conversationId }) => {
      const user = connectedUsers.get(socket.id);
      if (!user) return;

      if (!typingUsers[conversationId]) {
        typingUsers[conversationId] = new Map();
      }

      typingUsers[conversationId].set(user.id, {
        userId: user.id,
        userName: user.name,
      });

      socket.to(conversationId).emit("user_typing", {
        userId: user.id,
        userName: user.name,
        conversationId,
      });
    });

    socket.on("stop_typing", ({ conversationId }) => {
      const user = connectedUsers.get(socket.id);
      if (!user) return;

      if (typingUsers[conversationId]) {
        typingUsers[conversationId].delete(user.id);
        socket.to(conversationId).emit("user_stopped_typing", {
          userId: user.id,
          conversationId,
        });
      }
    });

    socket.on("add_reaction", async ({ messageId, emoji }) => {
      try {
        const user = connectedUsers.get(socket.id);
        if (!user) return;

        // Add reaction via API
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/chat/reaction`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messageId, emoji }),
        });

        if (response.ok) {
          // Broadcast reaction to all users
          Object.keys(roomUsers).forEach(conversationId => {
            if (roomUsers[conversationId].has(user.id)) {
              io.to(conversationId).emit("message_reaction", {
                messageId,
                userId: user.id,
                emoji,
                action: "add",
              });
            }
          });
        }
      } catch (error) {
        console.error("Error adding reaction:", error);
      }
    });

    socket.on("remove_reaction", async ({ messageId, emoji }) => {
      try {
        const user = connectedUsers.get(socket.id);
        if (!user) return;

        // Remove reaction via API
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/chat/reaction`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messageId, emoji }),
        });

        if (response.ok) {
          // Broadcast reaction removal to all users
          Object.keys(roomUsers).forEach(conversationId => {
            if (roomUsers[conversationId].has(user.id)) {
              io.to(conversationId).emit("message_reaction", {
                messageId,
                userId: user.id,
                emoji,
                action: "remove",
              });
            }
          });
        }
      } catch (error) {
        console.error("Error removing reaction:", error);
      }
    });

    socket.on("disconnect", () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        // Remove user from all rooms and notify others
        Object.keys(roomUsers).forEach(conversationId => {
          if (roomUsers[conversationId].has(user.id)) {
            roomUsers[conversationId].delete(user.id);
            socket.to(conversationId).emit("user_left", user.id);
          }
        });

        // Clean up typing
        Object.keys(typingUsers).forEach(conversationId => {
          if (typingUsers[conversationId] && typingUsers[conversationId].has(user.id)) {
            typingUsers[conversationId].delete(user.id);
            socket.to(conversationId).emit("user_stopped_typing", {
              userId: user.id,
              conversationId,
            });
          }
        });

        connectedUsers.delete(socket.id);
      }

      console.log(`User disconnected: ${socket.id}`);
    });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received. Closing HTTP server...");
  
  try {
    await prisma.$disconnect();
    console.log("Prisma disconnected.");
  } catch (error) {
    console.error("Error disconnecting Prisma:", error);
  }
  
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received. Closing HTTP server...");
  
  try {
    await prisma.$disconnect();
    console.log("Prisma disconnected.");
  } catch (error) {
    console.error("Error disconnecting Prisma:", error);
  }
  
  process.exit(0);
});

// Start server
server.listen(port, hostname, () => {
  console.log(`> Ready on http://${hostname}:${port}`);
  console.log(`> Socket.io server running on port ${port}`);
  console.log(`> Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
