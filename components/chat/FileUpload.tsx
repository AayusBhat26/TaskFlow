"use client";

import React, { useState, useCallback } from "react";
import { Paperclip, X, Upload, FileText, Image, Video, Music, File } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  conversationId: string;
  onFilesAttached: (files: AttachedFile[]) => void;
  disabled?: boolean;
}

interface AttachedFile {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  key: string;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
  if (mimeType.startsWith('video/')) return <Video className="h-4 w-4" />;
  if (mimeType.startsWith('audio/')) return <Music className="h-4 w-4" />;
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
    return <FileText className="h-4 w-4" />;
  }
  return <File className="h-4 w-4" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileUpload: React.FC<FileUploadProps> = ({
  conversationId,
  onFilesAttached,
  disabled = false,
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const { startUpload } = useUploadThing("chatFileUpload", {
    onClientUploadComplete: (res) => {
      console.log("Upload complete:", res);
      
      const attachedFiles: AttachedFile[] = res.map((file) => ({
        id: file.key,
        url: file.url,
        filename: file.name,
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        key: file.key,
      }));

      // Update uploading files status
      setUploadingFiles(prev => prev.map(uf => {
        const uploadedFile = res.find(r => r.name === uf.file.name);
        return uploadedFile ? { ...uf, status: 'success' as const, progress: 100 } : uf;
      }));

      // Notify parent component
      onFilesAttached(attachedFiles);

      // Clear uploading files after a delay
      setTimeout(() => {
        setUploadingFiles([]);
      }, 2000);
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      setUploadingFiles(prev => prev.map(uf => ({
        ...uf,
        status: 'error' as const,
        error: error.message
      })));
    },
    onUploadProgress: (progress) => {
      console.log("Upload progress:", progress);
      // Note: UploadThing doesn't provide per-file progress, so we'll use a general progress
    },
  });

  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (fileArray.length === 0) return;

    // Create uploading file entries
    const newUploadingFiles: UploadingFile[] = fileArray.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      progress: 0,
      status: 'uploading',
    }));

    setUploadingFiles(newUploadingFiles);

    // Start upload
    startUpload(fileArray);
  }, [startUpload, conversationId]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
      e.target.value = ''; // Reset input
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  const removeUploadingFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(uf => uf.id !== id));
  };

  return (
    <div className="relative">
      {/* File Input */}
      <input
        type="file"
        id="file-upload"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
        disabled={disabled}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
      />
      
      {/* Upload Button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="p-2 h-10 w-10"
        onClick={() => document.getElementById('file-upload')?.click()}
        disabled={disabled || uploadingFiles.length > 0}
      >
        <Paperclip className="h-4 w-4" />
      </Button>

      {/* Drag and Drop Overlay */}
      {dragActive && (
        <div
          className="fixed inset-0 bg-blue-500/20 backdrop-blur-sm z-50 flex items-center justify-center"
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border-2 border-dashed border-blue-500">
            <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-center">Drop files here to upload</p>
            <p className="text-sm text-gray-500 text-center mt-2">
              Images, videos, documents up to 64MB each
            </p>
          </div>
        </div>
      )}

      {/* Uploading Files Preview */}
      {uploadingFiles.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-3 space-y-2 max-h-40 overflow-y-auto">
          {uploadingFiles.map((uploadingFile) => (
            <div
              key={uploadingFile.id}
              className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded"
            >
              <div className="flex-shrink-0">
                {getFileIcon(uploadingFile.file.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {uploadingFile.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(uploadingFile.file.size)}
                </p>
                
                {uploadingFile.status === 'uploading' && (
                  <Progress 
                    value={uploadingFile.progress} 
                    className="mt-1 h-2"
                  />
                )}
                
                {uploadingFile.status === 'error' && (
                  <p className="text-xs text-red-500 mt-1">
                    {uploadingFile.error || 'Upload failed'}
                  </p>
                )}
                
                {uploadingFile.status === 'success' && (
                  <p className="text-xs text-green-500 mt-1">
                    Upload complete
                  </p>
                )}
              </div>
              
              {uploadingFile.status !== 'uploading' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6"
                  onClick={() => removeUploadingFile(uploadingFile.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Global drag handlers */}
      <div
        className="fixed inset-0 pointer-events-none"
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      />
    </div>
  );
};
