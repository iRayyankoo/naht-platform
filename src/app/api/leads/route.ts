import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// A simple in-memory rate limit Map (for demo/development purposes)
const rateLimit = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5; // 5 requests per minute

export async function POST(request: Request) {
  try {
    // Basic Rate Limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const userLimit = rateLimit.get(ip);
    if (userLimit) {
      if (now - userLimit.timestamp < RATE_LIMIT_WINDOW) {
        if (userLimit.count >= MAX_REQUESTS) {
          return NextResponse.json({ status: "error", message: "Too many requests. Please try again later." }, { status: 429 });
        }
        userLimit.count++;
      } else {
        rateLimit.set(ip, { count: 1, timestamp: now });
      }
    } else {
      rateLimit.set(ip, { count: 1, timestamp: now });
    }

    const body = await request.json();

    const {
      name,
      phone,
      email,
      message,
      projectId,
      formType,
      budget,
      propertyType,
      preferredContactMethod,
      preferredContactTime,
      city,
      district,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      landingPageUrl,
      referrer,
      deviceType,
      platform,
    } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ status: "error", message: "الاسم مطلوب" }, { status: 400 });
    }
    
    // Regex for basic phone validation (accepts +, spaces, and digits, min 9 chars)
    const phoneRegex = /^[+\d\s]{9,20}$/;
    if (!phone || typeof phone !== "string" || !phoneRegex.test(phone.trim())) {
      return NextResponse.json({ status: "error", message: "رقم الجوال غير صالح" }, { status: 400 });
    }

    // Email validation (optional but if provided must be valid format)
    if (email && typeof email === "string" && email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json({ status: "error", message: "البريد الإلكتروني غير صالح" }, { status: 400 });
      }
    }

    // Save to DB
    const lead = await prisma.lead.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        message: message?.trim() || null,
        projectId: projectId || null,
        formType: formType || "GENERAL",
        budget,
        propertyType,
        preferredContactMethod,
        preferredContactTime,
        city,
        district,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        utmTerm,
        landingPageUrl,
        referrer,
        deviceType,
        platform,
        status: "NEW",
        leadType: formType === "PROJECT_SPECIFIC" ? "PROJECT_INTEREST" : "GENERAL",
      },
    });

    revalidatePath("/crm/leads");
    revalidatePath("/crm");

    return NextResponse.json({ status: "success", data: { id: lead.id } }, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json({ status: "error", message: "حدث خطأ داخلي أثناء معالجة الطلب" }, { status: 500 });
  }
}
