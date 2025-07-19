import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env.local' });

const app = express();
const server = createServer(app);

// Configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Socket server is running', timestamp: new Date().toISOString() });
});

// Track users and their conversations
const userSockets = new Map<string, string>(); // userId -> socketId
const conversationUsers = new Map<string, Set<string>>(); // conversationId -> Set<userId>
const typingUsers = new Map<string, Set<string>>(); // conversationId -> Set<userId>

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining with authentication
  socket.on('join_user', (userData: { userId: string, name: string }) => {
    userSockets.set(userData.userId, socket.id);
    socket.data.userId = userData.userId;
    socket.data.userName = userData.name;
    
    console.log(`User ${userData.name} (${userData.userId}) joined with socket ${socket.id}`);
  });

  // Handle joining conversation
  socket.on('join_conversation', (conversationId: string) => {
    socket.join(conversationId);
    
    if (socket.data.userId) {
      if (!conversationUsers.has(conversationId)) {
        conversationUsers.set(conversationId, new Set());
      }
      conversationUsers.get(conversationId)!.add(socket.data.userId);
      
      // Notify other users in the conversation
      socket.to(conversationId).emit('user_joined', {
        id: socket.data.userId,
        name: socket.data.userName
      });
      
      // Send current online users to the new joiner
      const onlineUsers = Array.from(conversationUsers.get(conversationId) || []);
      socket.emit('online_users', onlineUsers);
    }
    
    console.log(`User ${socket.data.userName} joined conversation: ${conversationId}`);
  });

  // Handle leaving conversation
  socket.on('leave_conversation', (conversationId: string) => {
    socket.leave(conversationId);
    
    if (socket.data.userId) {
      conversationUsers.get(conversationId)?.delete(socket.data.userId);
      
      // Remove from typing if they were typing
      typingUsers.get(conversationId)?.delete(socket.data.userId);
      
      // Notify other users
      socket.to(conversationId).emit('user_left', socket.data.userId);
      socket.to(conversationId).emit('user_stopped_typing', {
        userId: socket.data.userId,
        conversationId
      });
    }
    
    console.log(`User ${socket.data.userName} left conversation: ${conversationId}`);
  });

  // Handle sending messages
  socket.on('send_message', (messageData: any) => {
    // Broadcast to all users in the conversation EXCEPT the sender
    socket.to(messageData.conversationId).emit('message_received', {
      ...messageData,
      senderId: socket.data.userId,
      senderName: socket.data.userName,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Message sent by ${socket.data.userName} to conversation ${messageData.conversationId}`);
  });

  // Handle typing indicators
  socket.on('typing', ({ conversationId }: { conversationId: string }) => {
    if (socket.data.userId) {
      if (!typingUsers.has(conversationId)) {
        typingUsers.set(conversationId, new Set());
      }
      typingUsers.get(conversationId)!.add(socket.data.userId);
      
      socket.to(conversationId).emit('user_typing', {
        userId: socket.data.userId,
        name: socket.data.userName,
        conversationId
      });
    }
  });

  socket.on('stop_typing', ({ conversationId }: { conversationId: string }) => {
    if (socket.data.userId) {
      typingUsers.get(conversationId)?.delete(socket.data.userId);
      
      socket.to(conversationId).emit('user_stopped_typing', {
        userId: socket.data.userId,
        conversationId
      });
    }
  });

  // Handle reactions
  socket.on('add_reaction', ({ messageId, emoji }: { messageId: string, emoji: string }) => {
    // Find which conversation this message belongs to
    // Note: In a real implementation, you'd query the database to find the conversation
    // For now, we'll broadcast to all rooms the user is in
    Array.from(socket.rooms).forEach(room => {
      if (room !== socket.id) { // Don't broadcast to self
        socket.to(room).emit('message_reaction', {
          messageId,
          emoji,
          userId: socket.data.userId,
          action: 'add'
        });
      }
    });
  });

  socket.on('remove_reaction', ({ messageId, emoji }: { messageId: string, emoji: string }) => {
    // Similar to add_reaction
    Array.from(socket.rooms).forEach(room => {
      if (room !== socket.id) {
        socket.to(room).emit('message_reaction', {
          messageId,
          emoji,
          userId: socket.data.userId,
          action: 'remove'
        });
      }
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    if (socket.data.userId) {
      // Remove from all conversations
      conversationUsers.forEach((users, conversationId) => {
        if (users.has(socket.data.userId)) {
          users.delete(socket.data.userId);
          socket.to(conversationId).emit('user_left', socket.data.userId);
        }
      });
      
      // Remove from typing users
      typingUsers.forEach((users, conversationId) => {
        if (users.has(socket.data.userId)) {
          users.delete(socket.data.userId);
          socket.to(conversationId).emit('user_stopped_typing', {
            userId: socket.data.userId,
            conversationId
          });
        }
      });
      
      userSockets.delete(socket.data.userId);
    }
  });
});

const PORT = process.env.SOCKET_PORT || 3002;

server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

export default server;
