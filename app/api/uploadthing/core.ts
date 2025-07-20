import { getToken } from "next-auth/jwt";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { db } from "@/lib/db";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 2 } })
    .middleware(async ({ req }) => {
      const user = await getToken({ req });
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async () => {}),
    
  chatFileUpload: f({
    pdf: { maxFileSize: "32MB", maxFileCount: 5 },
    image: { maxFileSize: "16MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 3 },
    audio: { maxFileSize: "16MB", maxFileCount: 5 },
    text: { maxFileSize: "8MB", maxFileCount: 5 }, // for documents
    "application/msword": { maxFileSize: "16MB", maxFileCount: 5 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "16MB", maxFileCount: 5 },
    "application/vnd.ms-excel": { maxFileSize: "16MB", maxFileCount: 5 },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { maxFileSize: "16MB", maxFileCount: 5 },
  })
    .middleware(async ({ req }) => {
      const user = await getToken({ req });
      if (!user) throw new Error("Unauthorized");
      
      return { 
        userId: user.id as string
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Chat file uploaded successfully:", {
        fileUrl: file.url,
        fileName: file.name,
        fileSize: file.size,
        userId: metadata.userId,
      });
      
      // Return file information for client-side handling
      return {
        url: file.url,
        name: file.name,
        size: file.size,
        key: file.key,
        type: file.type,
      };
    }),
    
  addToChatFile: f({
    pdf: { maxFileSize: "32MB", maxFileCount: 5 },
    image: { maxFileSize: "16MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 3 },
    audio: { maxFileSize: "16MB", maxFileCount: 5 },
    text: { maxFileSize: "8MB", maxFileCount: 5 }, // for documents
  })
    .middleware(async ({ req }) => {
      const user = await getToken({ req });
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Log the upload completion for processing
      console.log("File uploaded successfully:", {
        fileUrl: file.url,
        fileName: file.name,
        fileSize: file.size,
        userId: metadata.userId,
      });
    }),
  // Separate endpoint for compressed videos
  compressedVideo: f({
    video: { maxFileSize: "32MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const user = await getToken({ req });
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Compressed video uploaded:", {
        fileUrl: file.url,
        fileName: file.name,
        fileSize: file.size,
        userId: metadata.userId,
      });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
