import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import crypto from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "doc", "docx"];

// S3/R2 Client Configuration
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT || "",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string || "general";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 5MB limit" }, { status: 400 });
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json({ error: "Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const safeName = `${Date.now()}-${uniqueId}.${extension}`;

    const isR2Enabled = !!(process.env.R2_ACCESS_KEY_ID && process.env.R2_ENDPOINT && process.env.R2_BUCKET_NAME);

    if (isR2Enabled) {
      // Upload to Cloudflare R2
      const objectKey = `uploads/forms/${folder}/${safeName}`;
      
      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: objectKey,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      });

      await s3Client.send(command);

      const publicUrl = process.env.R2_PUBLIC_URL 
        ? `${process.env.R2_PUBLIC_URL}/${objectKey}` 
        : `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ENDPOINT?.replace('https://', '')}/${objectKey}`;

      return NextResponse.json({ url: publicUrl }, { status: 200 });
    } else {
      // Fallback: Local Upload (For Development)
      const uploadDir = join(process.cwd(), "public", "uploads", "forms", folder);
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (e) {
        // Directory already exists or cannot be created
      }

      const filePath = join(uploadDir, safeName);
      await writeFile(filePath, buffer);

      const fileUrl = `/uploads/forms/${folder}/${safeName}`;
      return NextResponse.json({ url: fileUrl }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
