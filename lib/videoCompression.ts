"use client";

// Video compression utility using browser-based compression
export interface CompressionOptions {
  quality: number; // 0.1 to 1.0
  maxWidth: number;
  maxHeight: number;
  outputFormat: 'webm' | 'mp4';
}

export interface CompressionResult {
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  thumbnail: string;
  duration: number;
}

export class VideoCompressor {
  private static readonly DEFAULT_OPTIONS: CompressionOptions = {
    quality: 0.7,
    maxWidth: 1280,
    maxHeight: 720,
    outputFormat: 'webm'
  };

  static async compressVideo(
    file: File, 
    options: Partial<CompressionOptions> = {}
  ): Promise<CompressionResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    // Create video element to get metadata
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    return new Promise((resolve, reject) => {
      video.onloadedmetadata = async () => {
        try {
          const duration = video.duration;
          
          // Calculate new dimensions while maintaining aspect ratio
          const { width: newWidth, height: newHeight } = this.calculateDimensions(
            video.videoWidth,
            video.videoHeight,
            opts.maxWidth,
            opts.maxHeight
          );
          
          canvas.width = newWidth;
          canvas.height = newHeight;
          
          // Generate thumbnail
          video.currentTime = duration * 0.1; // 10% into the video
          
          video.onseeked = async () => {
            // Draw frame to canvas for thumbnail
            ctx.drawImage(video, 0, 0, newWidth, newHeight);
            const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
            
            // Compress video
            const compressedFile = await this.compressWithMediaRecorder(
              file, 
              opts,
              newWidth,
              newHeight
            );
            
            resolve({
              compressedFile,
              originalSize: file.size,
              compressedSize: compressedFile.size,
              compressionRatio: compressedFile.size / file.size,
              thumbnail,
              duration
            });
          };
        } catch (error) {
          reject(error);
        }
      };
      
      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = URL.createObjectURL(file);
    });
  }

  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };
    
    // Scale down if too large
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }
    
    // Ensure even dimensions for video encoding
    width = Math.floor(width / 2) * 2;
    height = Math.floor(height / 2) * 2;
    
    return { width, height };
  }

  private static async compressWithMediaRecorder(
    file: File,
    options: CompressionOptions,
    width: number,
    height: number
  ): Promise<File> {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = width;
    canvas.height = height;
    
    return new Promise((resolve, reject) => {
      const chunks: Blob[] = [];
      
      video.onloadeddata = () => {
        const stream = canvas.captureStream(30); // 30 FPS
        
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: `video/${options.outputFormat}; codecs=vp9`,
          videoBitsPerSecond: this.calculateBitrate(width, height, options.quality)
        });
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { 
            type: `video/${options.outputFormat}` 
          });
          
          const compressedFile = new File(
            [blob], 
            file.name.replace(/\.[^/.]+$/, `.${options.outputFormat}`),
            { type: blob.type }
          );
          
          resolve(compressedFile);
        };
        
        mediaRecorder.onerror = reject;
        
        // Start recording
        mediaRecorder.start();
        
        // Draw video frames to canvas
        this.drawVideoFrames(video, ctx, canvas.width, canvas.height, () => {
          mediaRecorder.stop();
          stream.getTracks().forEach(track => track.stop());
        });
      };
      
      video.onerror = reject;
      video.src = URL.createObjectURL(file);
      video.load();
    });
  }

  private static drawVideoFrames(
    video: HTMLVideoElement,
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    onComplete: () => void
  ) {
    const fps = 30;
    const frameDuration = 1000 / fps;
    let currentTime = 0;
    
    const drawFrame = () => {
      if (currentTime >= video.duration) {
        onComplete();
        return;
      }
      
      video.currentTime = currentTime;
      
      const onSeeked = () => {
        ctx.drawImage(video, 0, 0, width, height);
        currentTime += frameDuration / 1000;
        
        setTimeout(drawFrame, frameDuration);
        video.removeEventListener('seeked', onSeeked);
      };
      
      video.addEventListener('seeked', onSeeked);
    };
    
    video.play().then(() => {
      video.pause();
      drawFrame();
    });
  }

  private static calculateBitrate(width: number, height: number, quality: number): number {
    // Base bitrate calculation: pixels per second * quality factor
    const baseRate = width * height * 30 * 0.1; // 30 FPS, 0.1 bits per pixel
    return Math.floor(baseRate * quality);
  }

  // Utility method to check if browser supports video compression
  static isCompressionSupported(): boolean {
    return !!(
      typeof MediaRecorder !== 'undefined' &&
      typeof HTMLCanvasElement !== 'undefined' &&
      HTMLCanvasElement.prototype.captureStream
    );
  }

  // Quick compression for chat uploads (aggressive compression)
  static async quickCompress(file: File): Promise<CompressionResult> {
    return this.compressVideo(file, {
      quality: 0.5,
      maxWidth: 854,
      maxHeight: 480,
      outputFormat: 'webm'
    });
  }

  // High quality compression for important videos
  static async highQualityCompress(file: File): Promise<CompressionResult> {
    return this.compressVideo(file, {
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
      outputFormat: 'mp4'
    });
  }
}

// Progressive loading for video files
export class VideoLoader {
  static async createProgressiveVideo(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onProgress?.(progress);
        }
      };
      
      reader.onload = () => {
        resolve(reader.result as string);
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
