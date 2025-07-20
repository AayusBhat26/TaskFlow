"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Smile } from "lucide-react";
import { useSocket } from "@/context/SocketProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "./FileUpload";
import { RichTextToolbar } from "./RichTextToolbar";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { UserMention } from "./UserMention";
import { MessageType } from "@prisma/client";
import { cn } from "@/lib/utils";

interface AttachedFile {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  key: string;
}

interface MessageInputProps {
  conversationId: string;
  workspaceId?: string;
  replyTo?: any | null;
  onCancelReply?: () => void;
  onMessageSent?: (message: any) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  conversationId,
  workspaceId,
  replyTo,
  onCancelReply,
  onMessageSent,
}) => {
  const { sendMessage, startTyping, stopTyping } = useSocket();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSendMessage = async () => {
    if (message.trim() || attachedFiles.length > 0) {
      const messageContent = message.trim();
      const messageData = {
        conversationId,
        content: messageContent || (attachedFiles.length > 0 ? "📎 File attachment" : ""),
        messageType: attachedFiles.length > 0 ? MessageType.FILE_UPLOAD : MessageType.TEXT,
        replyToId: replyTo?.id,
      };

      // Clear input immediately for better UX
      setMessage("");
      setAttachedFiles([]);
      if (onCancelReply) {
        onCancelReply();
      }
      handleStopTyping();

      try {
        // Send message via API first
        const response = await fetch('/api/chat/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Message sent successfully:', result);
          
          // If there are attached files, save them to the message
          if (attachedFiles.length > 0) {
            try {
              const attachmentResponse = await fetch('/api/chat/attachments', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  messageId: result.id,
                  files: attachedFiles.map(file => ({
                    url: file.url,
                    filename: file.filename,
                    originalName: file.originalName,
                    mimeType: file.mimeType,
                    size: file.size,
                    key: file.key,
                  }))
                }),
              });
              
              if (attachmentResponse.ok) {
                const attachmentResult = await attachmentResponse.json();
                console.log('Attachments saved:', attachmentResult);
                
                // Update the result with attachments
                result.attachments = attachmentResult.attachments;
              }
            } catch (attachmentError) {
              console.error('Error saving attachments:', attachmentError);
            }
          }
          
          // Add optimistic update for sender
          if (onMessageSent) {
            onMessageSent({
              ...result,
              isOptimistic: false, // Mark as real message
            });
          }
          
          // Send via socket for real-time updates to other users
          sendMessage({
            ...messageData,
            id: result.id,
            senderId: result.senderId,
            senderName: result.sender?.name || result.sender?.username,
            senderImage: result.sender?.image,
            createdAt: result.createdAt,
            replyTo: result.replyTo,
            attachments: result.attachments || [],
          });
        } else {
          console.error('Failed to send message:', await response.text());
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newCursorPos = e.target.selectionStart;
    
    setMessage(newValue);
    setCursorPosition(newCursorPos);
    handleStartTyping();
    
    // Detect mentions
    detectMentions(newValue, newCursorPos);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle keyboard shortcuts for formatting
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          applyFormat('**');
          break;
        case 'i':
          e.preventDefault();
          applyFormat('*');
          break;
        case 'e':
          e.preventDefault();
          applyFormat('`');
          break;
      }
    }
    
    // Close mentions on Escape
    if (e.key === 'Escape' && showMentions) {
      e.preventDefault();
      setShowMentions(false);
    }
  };

  const handleFilesAttached = (files: AttachedFile[]) => {
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeAttachedFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleStartTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      startTyping(conversationId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      stopTyping(conversationId);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        stopTyping(conversationId);
      }
    };
  }, [conversationId, isTyping, stopTyping]);

  // Rich text formatting functions
  const applyFormat = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = message.substring(start, end);
    
    let formattedText = "";
    
    switch (format) {
      case "**":
        formattedText = selectedText ? `**${selectedText}**` : "**text**";
        break;
      case "*":
        formattedText = selectedText ? `*${selectedText}*` : "*text*";
        break;
      case "`":
        formattedText = selectedText ? `\`${selectedText}\`` : "`code`";
        break;
      case "@":
        const rect = textarea.getBoundingClientRect();
        setMentionPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX
        });
        setShowMentions(true);
        setMentionQuery("");
        formattedText = "@";
        break;
      default:
        formattedText = selectedText;
    }

    const newMessage = message.substring(0, start) + formattedText + message.substring(end);
    setMessage(newMessage);
    
    // Set cursor position
    setTimeout(() => {
      if (format === "@") {
        textarea.setSelectionRange(start + 1, start + 1);
      } else if (selectedText) {
        textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
      } else {
        const cursorPos = start + formattedText.length - (format === "**" ? 2 : format === "`" ? 1 : 0);
        textarea.setSelectionRange(cursorPos, cursorPos);
      }
      textarea.focus();
    }, 0);
  };

  const handleMentionSelect = (user: any) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const mentionText = `@${user.username} `;
    const beforeMention = message.substring(0, cursorPosition - mentionQuery.length - 1);
    const afterMention = message.substring(cursorPosition);
    
    const newMessage = beforeMention + mentionText + afterMention;
    setMessage(newMessage);
    setShowMentions(false);
    setMentionQuery("");
    
    setTimeout(() => {
      const newCursorPos = beforeMention.length + mentionText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const detectMentions = (text: string, cursorPos: number) => {
    const beforeCursor = text.substring(0, cursorPos);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      if (!showMentions) {
        const textarea = textareaRef.current;
        if (textarea) {
          const rect = textarea.getBoundingClientRect();
          setMentionPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX
          });
          setShowMentions(true);
        }
      }
    } else {
      setShowMentions(false);
      setMentionQuery("");
    }
  };

  return (
    <div className="p-4 space-y-3">
      {/* Reply Preview */}
      {replyTo && (
        <div className="bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-500 p-3 rounded">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Replying to {replyTo.sender?.name || replyTo.sender?.username}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                {replyTo.content}
              </p>
            </div>
            {onCancelReply && (
              <button
                onClick={onCancelReply}
                className="ml-3 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Attached files ({attachedFiles.length})
          </p>
          <div className="space-y-2">
            {attachedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between bg-white dark:bg-gray-700 p-2 rounded">
                <div className="flex items-center space-x-2 flex-1">
                  <span className="text-sm truncate">{file.originalName}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
                <button
                  onClick={() => removeAttachedFile(file.id)}
                  className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex items-end space-x-2">
        <div className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden focus-within:border-blue-500 dark:focus-within:border-blue-400">
          {/* Rich Text Toolbar */}
          <RichTextToolbar
            onFormatApply={applyFormat}
            onPreviewToggle={() => setIsPreviewMode(!isPreviewMode)}
            isPreviewMode={isPreviewMode}
          />
          
          {/* Input Area */}
          <div className="relative">
            {isPreviewMode ? (
              <div className="min-h-[40px] max-h-[120px] overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800">
                {message.trim() ? (
                  <MarkdownRenderer 
                    content={message} 
                    className="text-sm leading-relaxed"
                  />
                ) : (
                  <span className="text-gray-500 text-sm">Preview your message...</span>
                )}
              </div>
            ) : (
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onKeyPress={handleKeyPress}
                placeholder="Type a message... Use **bold**, *italic*, `code`, or @mention"
                className="min-h-[40px] max-h-[120px] resize-none border-none focus:ring-0 focus:outline-none"
                rows={1}
              />
            )}
          </div>
        </div>
        
        <div className="flex space-x-1">
          <FileUpload
            conversationId={conversationId}
            onFilesAttached={handleFilesAttached}
            disabled={false}
          />
          
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-10 w-10"
            onClick={() => {
              // TODO: Add emoji picker
            }}
          >
            <Smile className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() && attachedFiles.length === 0}
            size="sm"
            className="p-2 h-10 w-10 bg-blue-500 hover:bg-blue-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* User Mention Dropdown */}
      {workspaceId && (
        <UserMention
          isOpen={showMentions}
          onClose={() => setShowMentions(false)}
          onSelectUser={handleMentionSelect}
          position={mentionPosition}
          searchQuery={mentionQuery}
          workspaceId={workspaceId}
        />
      )}
    </div>
  );
};
