"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Image, 
  Video, 
  Music, 
  File, 
  Download, 
  Eye, 
  X,
  ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface FileAttachmentProps {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
  canDelete?: boolean;
  onDelete?: (id: string) => void;
  className?: string;
}

const getFileIcon = (mimeType: string, size: 'sm' | 'md' | 'lg' = 'md') => {
  const sizeClass = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-6 w-6'
  }[size];

  if (mimeType.startsWith('image/')) return <Image className={sizeClass} />;
  if (mimeType.startsWith('video/')) return <Video className={sizeClass} />;
  if (mimeType.startsWith('audio/')) return <Music className={sizeClass} />;
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
    return <FileText className={sizeClass} />;
  }
  return <File className={sizeClass} />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toUpperCase() || '';
};

export const FileAttachment: React.FC<FileAttachmentProps> = ({
  id,
  filename,
  originalName,
  mimeType,
  size,
  url,
  createdAt,
  canDelete = false,
  onDelete,
  className,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  const isImage = mimeType.startsWith('image/');
  const isVideo = mimeType.startsWith('video/');
  const isAudio = mimeType.startsWith('audio/');
  const isPreviewable = isImage || isVideo || isAudio;

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(id);
    } finally {
      setIsDeleting(false);
    }
  };

  const openPreview = () => {
    if (isPreviewable) {
      setIsPreviewOpen(true);
    } else {
      // For non-previewable files, open in new tab
      window.open(url, '_blank');
    }
  };

  return (
    <>
      <div className={cn(
        "group relative bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 max-w-sm",
        className
      )}>
        {/* File Info */}
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-700 rounded">
            {getFileIcon(mimeType, 'lg')}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {originalName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(size)} • {getFileExtension(filename)}
            </p>
          </div>
        </div>

        {/* Image Preview */}
        {mimeType.startsWith('image/') && (
          <div className="mt-3 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
            {!imageLoadError ? (
              <img
                src={url}
                alt={originalName}
                className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={openPreview}
                loading="lazy"
                onError={() => setImageLoadError(true)}
                onLoad={() => setImageLoadError(false)}
              />
            ) : (
              <div className="w-full h-32 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" onClick={openPreview}>
                <div className="text-center">
                  <Image className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-xs text-gray-500">Image preview failed</p>
                  <p className="text-xs text-blue-500">Click to view</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-3 space-x-2">
          <div className="flex space-x-1">
            {isPreviewable && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={openPreview}
              >
                <Eye className="h-3 w-3 mr-1" />
                <span className="text-xs">Preview</span>
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={handleDownload}
            >
              <Download className="h-3 w-3 mr-1" />
              <span className="text-xs">Download</span>
            </Button>
            
            {!isPreviewable && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => window.open(url, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                <span className="text-xs">Open</span>
              </Button>
            )}
          </div>

          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="truncate">{originalName}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto">
            {isImage && (
              <img
                src={url}
                alt={originalName}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            )}
            
            {isVideo && (
              <video
                src={url}
                controls
                className="w-full h-auto max-h-[70vh]"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            )}
            
            {isAudio && (
              <div className="p-8 text-center">
                <Music className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <audio
                  src={url}
                  controls
                  className="w-full max-w-md mx-auto"
                  preload="metadata"
                >
                  Your browser does not support the audio tag.
                </audio>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-gray-500">
              {formatFileSize(size)} • {getFileExtension(filename)}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
